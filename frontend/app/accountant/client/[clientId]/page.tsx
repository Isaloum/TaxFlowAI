'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<any>(null);
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [yearDetails, setYearDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadAll();
  }, [clientId]);

  const loadAll = async () => {
    try {
      const [clientRes, yearsRes] = await Promise.all([
        APIClient.getClientById(clientId),
        APIClient.getClientTaxYears(clientId),
      ]);
      setClient(clientRes.data.client);
      const years = yearsRes.data.taxYears || [];
      setTaxYears(years);
      // Auto-select the most recent tax year
      if (years.length > 0) {
        await loadYearDetails(years[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadYearDetails = async (year: any) => {
    setSelectedYear(year);
    setYearDetails(null);
    try {
      const res = await APIClient.getTaxYearDetails(year.id);
      setYearDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (docId: string) => {
    setActionLoading(docId);
    try {
      await APIClient.approveDocument(docId);
      await loadYearDetails(selectedYear);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!rejectDocId || !rejectReason.trim()) return;
    setActionLoading(rejectDocId);
    try {
      await APIClient.rejectDocument(rejectDocId, rejectReason);
      setRejectDocId(null);
      setRejectReason('');
      await loadYearDetails(selectedYear);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/accountant/dashboard')} className="text-blue-600 hover:underline text-sm">
            ← Dashboard
          </button>
          <h1 className="text-xl font-bold">
            {client ? `${client.firstName} ${client.lastName}` : 'Client'}
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6">
        {/* Client Info */}
        {client && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-8">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Province</p>
              <p className="font-medium">{client.province}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">{client.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Language</p>
              <p className="font-medium">{client.languagePref === 'fr' ? 'Français' : 'English'}</p>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Tax Year List */}
          <div className="w-48 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">TAX YEARS</h2>
            <div className="space-y-1">
              {taxYears.length === 0 && (
                <p className="text-sm text-gray-400">No tax years yet.</p>
              )}
              {taxYears.map((year) => (
                <button
                  key={year.id}
                  onClick={() => loadYearDetails(year)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedYear?.id === year.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-gray-50 border'
                  }`}
                >
                  <div className="font-medium">{year.year}</div>
                  <div className={`text-xs ${selectedYear?.id === year.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {year.status}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tax Year Details */}
          <div className="flex-1">
            {!selectedYear && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                Select a tax year
              </div>
            )}

            {selectedYear && !yearDetails && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                Loading...
              </div>
            )}

            {yearDetails && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white rounded-lg shadow p-4 flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      yearDetails.taxYear?.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      yearDetails.taxYear?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {yearDetails.taxYear?.status || 'draft'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completeness</p>
                    <p className="font-medium">{yearDetails.taxYear?.completenessScore ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Documents</p>
                    <p className="font-medium">{yearDetails.documents?.length || 0} uploaded</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-semibold">Documents</h3>
                  </div>
                  {(!yearDetails.documents || yearDetails.documents.length === 0) && (
                    <p className="px-4 py-8 text-center text-gray-400 text-sm">
                      No documents uploaded yet.
                    </p>
                  )}
                  <div className="divide-y">
                    {yearDetails.documents?.map((doc: any) => (
                      <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{doc.originalName || doc.fileName}</p>
                          <p className="text-xs text-gray-400">{doc.documentType} · {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.status}
                          </span>
                          {doc.status === 'pending' && (
                            <>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => handleApprove(doc.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionLoading === doc.id ? '...' : 'Approve'}
                              </button>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => setRejectDocId(doc.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validations */}
                {yearDetails.validations && yearDetails.validations.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-3 border-b">
                      <h3 className="font-semibold">Validation Checks</h3>
                    </div>
                    <div className="divide-y">
                      {yearDetails.validations.map((v: any) => (
                        <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                          <p className="text-sm">{v.ruleName || v.ruleId}</p>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            v.status === 'passed' ? 'bg-green-100 text-green-700' :
                            v.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {v.status}
                          </span>
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

      {/* Reject Modal */}
      {rejectDocId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold mb-3">Reject Document</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectDocId(null); setRejectReason(''); }}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || !!actionLoading}
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? '...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
