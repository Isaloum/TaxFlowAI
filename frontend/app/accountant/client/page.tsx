'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIClient } from '@/lib/api-client';
import { useT } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

function formatPhone(raw?: string): string {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return raw;
}

function formatAmount(val: any): string {
  if (val == null || val === '') return '';
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(n)) return String(val);
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

const FIELD_LABELS: Record<string, string> = {
  employer_name: 'Employer',
  payer_name: 'Payer',
  trust_name: 'Trust',
  institution_name: 'Institution',
  issuer_name: 'Issuer',
  landlord_name: 'Landlord',
  vendor_name: 'Vendor',
  box_14_employment_income: 'Employment income',
  box_22_income_tax_deducted: 'Income tax deducted',
  box_a_gross_income: 'Gross income',
  box_e_income_tax_withheld: 'Income tax withheld',
  box_16_pension_income: 'Pension income',
  box_20_cpp_qpp_benefits: 'CPP/QPP benefits',
  box_18_oas_pension: 'OAS pension',
  box_14_ei_benefits: 'EI benefits',
  box_a_ei_benefits: 'EI benefits',
  box_13_interest_income: 'Interest income',
  box_24_eligible_dividends: 'Eligible dividends',
  box_21_capital_gains: 'Capital gains',
  box_20_proceeds: 'Proceeds',
  box_21_acb: 'Adjusted cost base',
  tuition_fees: 'Tuition fees',
  box_a_tuition: 'Tuition',
  box_10_workers_comp: 'Workers comp',
  box_16_contributions: 'Contributions',
  box_a_contributions: 'Contributions',
  box_a_rrsp_contributions: 'RRSP contributions',
  box_a_rent_paid: 'Rent paid',
  contribution_amount: 'Contribution amount',
  amount: 'Amount',
};

function ScanBadge({ doc }: { doc: any }) {
  const meta = (doc.extractedData as any)?._metadata ?? {};
  const status = doc.extractionStatus;
  const review = doc.reviewStatus;

  // Review status takes priority — hide scan state when reviewed
  if (review === 'approved') {
    return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">✓ Approved</span>;
  }
  if (review === 'rejected') {
    return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">✗ Rejected</span>;
  }

  // Pending review — show scan state
  if (status === 'pending' || status === 'processing') {
    return <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">⏳ Scanning…</span>;
  }
  if (status === 'failed') {
    return <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600">❌ Unreadable</span>;
  }
  if (meta.typeMismatch) {
    return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">⚠️ Wrong doc — AI sees {meta.extractedDocType}</span>;
  }
  if (meta.yearMismatch) {
    return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">⚠️ Wrong year — doc shows {meta.extractedYear}</span>;
  }
  if (status === 'success') {
    return <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">⏳ Pending review</span>;
  }
  return null;
}

function ExtractedFields({ doc }: { doc: any }) {
  const data = doc.extractedData as any;
  if (!data) return null;

  const meta = data._metadata ?? {};
  const taxpayerName = data.taxpayer_name;
  const taxYear = data.tax_year;

  // Build list of key financial fields
  const fields: { label: string; value: string }[] = [];
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    if (data[key] != null && data[key] !== '' && !['employer_name','payer_name','trust_name','institution_name','issuer_name','landlord_name','vendor_name'].includes(key)) {
      const val = formatAmount(data[key]);
      if (val) fields.push({ label, value: val });
    }
  }

  const entityName = data.employer_name || data.payer_name || data.trust_name ||
    data.institution_name || data.issuer_name || data.landlord_name || data.vendor_name;

  const hasInfo = taxpayerName || taxYear || entityName || fields.length > 0 ||
    meta.typeMismatch || meta.yearMismatch;

  if (!hasInfo) return null;

  return (
    <div className="mt-1.5 text-xs space-y-0.5">
      {(meta.typeMismatch || meta.yearMismatch) && (
        <div className="text-orange-700 font-medium">
          {meta.typeMismatch && `⚠️ User selected "${meta.selectedDocType}" but AI detected "${meta.extractedDocType}"`}
          {meta.yearMismatch && !meta.typeMismatch && `⚠️ Expected year ${meta.expectedYear}, document shows ${meta.extractedYear}`}
        </div>
      )}
      <div className="text-gray-500 flex flex-wrap gap-x-4 gap-y-0.5">
        {taxpayerName && <span>👤 {taxpayerName}</span>}
        {taxYear && <span>📅 Tax year: {taxYear}</span>}
        {entityName && <span>🏢 {entityName}</span>}
        {fields.map(f => (
          <span key={f.label}>{f.label}: <span className="text-gray-700 font-medium">{f.value}</span></span>
        ))}
      </div>
    </div>
  );
}

function ClientDetail() {
  const router = useRouter();
  const { t } = useT();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('id') || '';

  const [client, setClient] = useState<any>(null);
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [yearDetails, setYearDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (clientId) loadAll();
  }, [clientId]);

  // Auto-refresh every 4s while any document is scanning
  const documents = yearDetails?.taxYear?.documents ?? [];
  const isScanning = documents.some((d: any) =>
    d.extractionStatus === 'pending' || d.extractionStatus === 'processing'
  );
  useEffect(() => {
    if (!isScanning || !selectedYear) return;
    const timer = setInterval(() => loadYearDetails(selectedYear, true), 2000);
    return () => clearInterval(timer);
  }, [isScanning, selectedYear?.id]);

  const loadAll = async () => {
    try {
      const [clientRes, yearsRes] = await Promise.all([
        APIClient.getClientById(clientId),
        APIClient.getClientTaxYears(clientId),
      ]);
      setClient(clientRes.data.client);
      const years = yearsRes.data.client?.taxYears || [];
      setTaxYears(years);
      if (years.length > 0) await loadYearDetails(years[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadYearDetails = async (year: any, silent = false) => {
    setSelectedYear(year);
    if (!silent) setYearDetails(null);
    setNotesSaved(false);
    try {
      const res = await APIClient.getTaxYearDetails(year.id);
      setYearDetails(res.data);
      if (!silent) setNotes(res.data.taxYear?.reviewNotes ?? '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedYear) return;
    setSavingNotes(true);
    try {
      await APIClient.updateTaxYearNotes(selectedYear.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedYear) return;
    setCompleting(true);
    try {
      await APIClient.markAsComplete(selectedYear.id);
      setCompleted(true);
      showToast('✅ Tax year marked as complete!');
      await loadYearDetails(selectedYear);
      const yearsRes = await APIClient.getClientTaxYears(clientId);
      setTaxYears(yearsRes.data.client?.taxYears || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to mark as complete.';
      showToast(`❌ ${msg}`, 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleReopen = async () => {
    if (!selectedYear) return;
    setReopening(true);
    try {
      await APIClient.reopenTaxYear(selectedYear.id);
      setCompleted(false);
      await loadYearDetails(selectedYear);
      const yearsRes = await APIClient.getClientTaxYears(clientId);
      setTaxYears(yearsRes.data.client?.taxYears || []);
    } catch (err) {
      console.error(err);
    } finally {
      setReopening(false);
    }
  };

  const handleApprove = async (docId: string) => {
    setActionLoading(docId);
    try {
      await APIClient.approveDocument(docId);
      await loadYearDetails(selectedYear, true);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleReset = async (docId: string) => {
    setActionLoading(docId);
    try {
      await APIClient.resetDocument(docId);
      await loadYearDetails(selectedYear, true);
    } catch (err) { console.error(err); }
    finally { setActionLoading(''); }
  };

  const handleRescan = async (docId: string) => {
    setActionLoading(docId);
    try {
      await APIClient.rescanDocument(docId);
      await loadYearDetails(selectedYear, true);
    } catch (err) { console.error(err); }
    finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    if (!rejectDocId || !rejectReason.trim()) return;
    setActionLoading(rejectDocId);
    try {
      await APIClient.rejectDocument(rejectDocId, rejectReason);
      setRejectDocId(null);
      setRejectReason('');
      await loadYearDetails(selectedYear, true);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  if (!clientId) return <div className="p-6">No client selected.</div>;
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 shadow-lg rounded-xl px-4 py-3 text-sm flex items-center gap-2 border max-w-sm ${
          toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
        }`}>
          {toast.msg}
        </div>
      )}
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/accountant/dashboard')} className="text-blue-600 hover:underline text-sm">
              ← {t('acctClient.backToDash')}
            </button>
            <h1 className="text-xl font-bold">
              {client ? `${client.firstName} ${client.lastName}` : 'Client'}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6">
        {client && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 sm:gap-8 flex-wrap">
            <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{client.email}</p></div>
            <div><p className="text-xs text-gray-500">Province</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{client.province}</span>
            </div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{client.phone ? <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition">{formatPhone(client.phone)}</a> : '—'}</p></div>
            <div><p className="text-xs text-gray-500">Language</p><p className="font-medium">{client.languagePref === 'fr' ? 'Français' : 'English'}</p></div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 md:flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">TAX YEARS</h2>
            <div className="space-y-1">
              {taxYears.length === 0 && <p className="text-sm text-gray-400">No tax years yet.</p>}
              {taxYears.map((year) => (
                <button key={year.id} onClick={() => loadYearDetails(year)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedYear?.id === year.id ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 border'
                  }`}>
                  <div className="font-medium">{year.year}</div>
                  <div className={`text-xs ${selectedYear?.id === year.id ? 'text-blue-100' : 'text-gray-400'}`}>{year.status}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {!selectedYear && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">Select a tax year</div>}
            {selectedYear && !yearDetails && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">Loading...</div>}

            {yearDetails && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="bg-white rounded-lg shadow p-4 flex gap-6 flex-wrap items-center">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      yearDetails.taxYear?.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      yearDetails.taxYear?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{yearDetails.taxYear?.status || 'draft'}</span>
                  </div>
                  <div><p className="text-xs text-gray-500">Completeness</p><p className="font-medium">{yearDetails.taxYear?.status === 'completed' ? 100 : (yearDetails.taxYear?.completenessScore ?? 0)}%</p></div>
                  <div><p className="text-xs text-gray-500">Documents</p><p className="font-medium">{documents.length} uploaded</p></div>
                  {/* Scan issues summary */}
                  {documents.some((d: any) => {
                    const m = (d.extractedData as any)?._metadata ?? {};
                    return m.typeMismatch || m.yearMismatch;
                  }) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      ⚠️ {documents.filter((d: any) => {
                        const m = (d.extractedData as any)?._metadata ?? {};
                        return m.typeMismatch || m.yearMismatch;
                      }).length} doc{documents.filter((d: any) => {
                        const m = (d.extractedData as any)?._metadata ?? {};
                        return m.typeMismatch || m.yearMismatch;
                      }).length > 1 ? 's' : ''} need attention
                    </span>
                  )}

                  {/* Mark as Complete / Re-open actions */}
                  <div className="ml-auto flex items-center gap-3">
                    {yearDetails.taxYear?.status === 'completed' || completed ? (
                      <>
                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                          ✅ Return Complete
                        </span>
                        <button
                          disabled={reopening}
                          onClick={handleReopen}
                          className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          {reopening ? 'Reopening…' : '↩ Re-open'}
                        </button>
                      </>
                    ) : yearDetails.taxYear?.status === 'submitted' ? (
                      <div className="flex items-center gap-2">
                        {documents.length === 0 && (
                          <span className="text-xs text-red-500">No documents uploaded</span>
                        )}
                        <button
                          disabled={completing || documents.length === 0}
                          onClick={handleMarkComplete}
                          title={documents.length === 0 ? t('acctClient.cannotComplete') : ''}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {completing ? t('acctClient.completing') : `✅ ${t('acctClient.markComplete')}`}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Documents table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="font-semibold">{t('acctClient.documents')}</h3>
                    <span className="text-xs text-gray-400">
                      {documents.filter((d: any) => d.reviewStatus === 'approved').length} {t('acctClient.approved')} ·{' '}
                      {documents.filter((d: any) => d.reviewStatus === 'pending').length} {t('acctClient.pending')}
                    </span>
                  </div>
                  {documents.length === 0 && (
                    <p className="px-4 py-8 text-center text-gray-400 text-sm">{t('acctClient.noDocuments')}</p>
                  )}
                  <div className="divide-y">
                    {documents.map((doc: any) => {
                      const meta = (doc.extractedData as any)?._metadata ?? {};
                      const hasIssue = meta.typeMismatch || meta.yearMismatch;
                      return (
                        <div key={doc.id} className={`px-4 py-3 ${hasIssue ? 'bg-orange-50' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc.originalFilename || doc.docType}</p>
                              <p className="text-xs text-gray-400">
                                {doc.docType}
                                {doc.fileSizeBytes ? ` · ${(doc.fileSizeBytes / 1024).toFixed(0)} KB` : ''}
                                {doc.uploadedAt ? ` · ${new Date(doc.uploadedAt).toLocaleDateString('en-CA')}` : ''}
                              </p>
                              <ExtractedFields doc={doc} />
                              {doc.reviewStatus === 'rejected' && doc.rejectionReason && (
                                <div className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                                  ✗ Rejected: {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <ScanBadge doc={doc} />
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await APIClient.getDocumentDownload(doc.id);
                                    window.open(res.data.downloadUrl, '_blank');
                                  } catch { alert('Could not open document'); }
                                }}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                title="Open document"
                              >👁 View</button>
                              {doc.reviewStatus === 'pending' && (
                                <>
                                  <button disabled={!!actionLoading} onClick={() => handleApprove(doc.id)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">
                                    {actionLoading === doc.id ? '...' : t('acctClient.approve')}
                                  </button>
                                  <button disabled={!!actionLoading} onClick={() => setRejectDocId(doc.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50">
                                    {t('acctClient.reject')}
                                  </button>
                                </>
                              )}
                              {(doc.reviewStatus === 'approved' || doc.reviewStatus === 'rejected') && (
                                <button disabled={!!actionLoading} onClick={() => handleReset(doc.id)}
                                  className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                  title="Reset to pending">
                                  {actionLoading === doc.id ? '...' : '↩ Reset'}
                                </button>
                              )}
                              {(doc.extractionStatus === 'failed' || doc.extractionStatus === 'pending' || doc.extractionStatus === 'processing') && (
                                <button disabled={!!actionLoading} onClick={() => handleRescan(doc.id)}
                                  className="px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 disabled:opacity-50"
                                  title="Re-trigger document scan">
                                  {actionLoading === doc.id ? '...' : '🔄 Re-scan'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accountant Notes */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold mb-2 text-sm">Internal Notes</h3>
                  <p className="text-xs text-gray-400 mb-2">Only visible to you — not shown to the client.</p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Missing T4 from second employer. Asked client to follow up with HR."
                    className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <div className="flex items-center justify-end gap-3 mt-2">
                    {notesSaved && <span className="text-xs text-green-600">✓ Saved</span>}
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingNotes ? 'Saving…' : 'Save Notes'}
                    </button>
                  </div>
                </div>

                {yearDetails.taxYear?.status !== 'completed' && yearDetails.taxYear?.validations && yearDetails.taxYear.validations.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-3 border-b"><h3 className="font-semibold">Validation Checks</h3></div>
                    <div className="divide-y">
                      {yearDetails.taxYear.validations.map((v: any) => (
                        <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                          <p className="text-sm">{v.message || v.ruleCode || v.ruleName || v.ruleId}</p>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            v.status === 'pass' ? 'bg-green-100 text-green-700' :
                            v.status === 'fail' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{v.status === 'pass' ? '✓ Pass' : v.status === 'fail' ? '✗ Fail' : v.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {rejectDocId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold mb-1">{t('acctClient.rejectBtn')}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('acctClient.clientWillSee')}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Wrong year — please upload your 2024 T4" className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectDocId(null); setRejectReason(''); }}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">{t('common.cancel')}</button>
              <button disabled={!rejectReason.trim() || !!actionLoading} onClick={handleReject}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? '...' : t('acctClient.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ClientDetail />
    </Suspense>
  );
}
