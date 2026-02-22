'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

// ─── Document type definitions ───────────────────────────────────────────────

type DocOption = { value: string; label: string };
type DocGroup  = { label: string; options: DocOption[] };

const FEDERAL_SLIPS: DocGroup = {
  label: 'Federal Slips (All Provinces)',
  options: [
    { value: 'T4',       label: 'T4 – Employment Income' },
    { value: 'T4A',      label: 'T4A – Pension / Retirement / Other Income' },
    { value: 'T4A_P',    label: 'T4A(P) – CPP / QPP Benefits' },
    { value: 'T4A_OAS',  label: 'T4A(OAS) – Old Age Security' },
    { value: 'T4E',      label: 'T4E – Employment Insurance (EI)' },
    { value: 'T4RSP',    label: 'T4RSP – RRSP Income' },
    { value: 'T4RIF',    label: 'T4RIF – RRIF Income' },
    { value: 'T5',       label: 'T5 – Investment Income (Dividends / Interest)' },
    { value: 'T3',       label: 'T3 – Trust / Mutual Fund Income' },
    { value: 'T5008',    label: 'T5008 – Securities Transactions' },
    { value: 'T5013',    label: 'T5013 – Partnership Income' },
    { value: 'T2202',    label: 'T2202 – Tuition Certificate' },
    { value: 'T1007',    label: 'T1007 – Workers Compensation Benefits' },
    { value: 'T4PS',     label: 'T4PS – Employee Profit Sharing' },
  ],
};

const QC_RL_SLIPS: DocGroup = {
  label: 'Quebec RL Slips (Quebec Residents)',
  options: [
    { value: 'RL1',  label: 'RL-1 – Employment & Other Income' },
    { value: 'RL2',  label: 'RL-2 – Retirement / Pension Income' },
    { value: 'RL3',  label: 'RL-3 – Investment Income' },
    { value: 'RL5',  label: 'RL-5 – Benefits & Allocations' },
    { value: 'RL6',  label: 'RL-6 – Dividends from Quebec Companies' },
    { value: 'RL8',  label: 'RL-8 – Tuition (Quebec)' },
    { value: 'RL10', label: 'RL-10 – EI & QPIP Benefits' },
    { value: 'RL11', label: 'RL-11 – RRSP / RRIF Income' },
    { value: 'RL15', label: 'RL-15 – Professional / Self-Employment Income' },
    { value: 'RL16', label: 'RL-16 – Trust Income' },
    { value: 'RL22', label: 'RL-22 – Employee Benefits' },
    { value: 'RL24', label: 'RL-24 – Childcare Assistance' },
    { value: 'RL25', label: 'RL-25 – Amounts Paid to Residents of Canada' },
    { value: 'RL31', label: 'RL-31 – Rental Housing' },
    { value: 'SolidarityCredit', label: 'Solidarity Tax Credit Statement (Revenu Québec)' },
  ],
};

const PROVINCE_SPECIFIC: Record<string, DocGroup> = {
  ON: {
    label: 'Ontario Provincial',
    options: [
      { value: 'OTB',   label: 'Ontario Trillium Benefit (OTB) Statement' },
      { value: 'ODSP',  label: 'Ontario Works / ODSP Statement' },
      { value: 'OEPTC', label: 'Ontario Energy & Property Tax Credit' },
      { value: 'NOEC',  label: 'Northern Ontario Energy Credit' },
    ],
  },
  BC: {
    label: 'British Columbia Provincial',
    options: [
      { value: 'BCClimateAction',   label: 'BC Climate Action Tax Credit' },
      { value: 'BCHRenovation',     label: 'BC Seniors\u2019 Home Renovation Tax Credit' },
      { value: 'BCTrainingCredit',  label: 'BC Training Tax Credit' },
      { value: 'BCFamilyBenefit',   label: 'BC Family Benefit Statement' },
    ],
  },
  AB: {
    label: 'Alberta Provincial (No Provincial Income Tax)',
    options: [
      { value: 'ACFB',   label: 'Alberta Child & Family Benefit (ACFB) Statement' },
      { value: 'ABSeniors', label: 'Alberta Seniors\u2019 Benefit Statement' },
      { value: 'ABASBRebate', label: 'Alberta Affordability Payments Statement' },
    ],
  },
  MB: {
    label: 'Manitoba Provincial',
    options: [
      { value: 'MBPropertyTax',  label: 'Manitoba Education Property Tax Credit' },
      { value: 'MBFarmlandTax',  label: 'Manitoba Farmland School Tax Rebate' },
      { value: 'MBGreenEnergy',  label: 'Manitoba Green Energy Equipment Tax Credit' },
    ],
  },
  SK: {
    label: 'Saskatchewan Provincial',
    options: [
      { value: 'SKLowIncome',  label: 'Saskatchewan Low-Income Tax Credit (SLITC)' },
      { value: 'SKFarmCredit', label: 'Saskatchewan Farm & Small Business Credit' },
    ],
  },
  NS: {
    label: 'Nova Scotia Provincial',
    options: [
      { value: 'NSAffordableLiving', label: 'NS Affordable Living Tax Credit' },
      { value: 'NSHARP',             label: 'Heating Assistance Rebate Program (HARP)' },
      { value: 'NSSeniors',          label: 'NS Seniors\u2019 Care Grant Statement' },
    ],
  },
  NB: {
    label: 'New Brunswick Provincial',
    options: [
      { value: 'NBHSTCredit',    label: 'NB Harmonized Sales Tax Credit' },
      { value: 'NBLowIncome',    label: 'NB Low-Income Tax Reduction Statement' },
      { value: 'NBRenovation',   label: 'NB Seniors\u2019 Home Renovation Tax Credit' },
    ],
  },
  PE: {
    label: 'Prince Edward Island Provincial',
    options: [
      { value: 'PEISalesTax',   label: 'PEI Sales Tax Credit Statement' },
      { value: 'PEIPropertyTax',label: 'PEI Property Tax Credit' },
    ],
  },
  NL: {
    label: 'Newfoundland & Labrador Provincial',
    options: [
      { value: 'NLIncomeSupplement', label: 'NL Income Supplement Statement' },
      { value: 'NLSeniors',          label: 'NL Seniors\u2019 Benefit Statement' },
      { value: 'NLChildBenefit',     label: 'NL Child Benefit Statement' },
    ],
  },
  NT: {
    label: 'Northwest Territories',
    options: [
      { value: 'NTCostOfLiving', label: 'NT Cost of Living Tax Credit' },
    ],
  },
  NU: {
    label: 'Nunavut',
    options: [
      { value: 'NUCostOfLiving', label: 'Nunavut Cost of Living Tax Credit' },
    ],
  },
  YT: {
    label: 'Yukon',
    options: [
      { value: 'YTCarbonRebate', label: 'Yukon Government Carbon Price Rebate' },
      { value: 'YTChildBenefit', label: 'Yukon Child Benefit Statement' },
    ],
  },
};

const CONTRIBUTIONS: DocGroup = {
  label: 'Contributions & Savings',
  options: [
    { value: 'RRSP', label: 'RRSP Contribution Receipt' },
    { value: 'TFSA', label: 'TFSA Contribution Receipt' },
    { value: 'FHSA', label: 'FHSA – First Home Savings Account' },
    { value: 'HBP',  label: 'HBP – Home Buyers\u2019 Plan Repayment' },
    { value: 'LLP',  label: 'LLP – Lifelong Learning Plan Repayment' },
    { value: 'RESP', label: 'RESP Contribution Receipt' },
  ],
};

const DEDUCTIONS: DocGroup = {
  label: 'Deductions & Credits',
  options: [
    { value: 'Medical',      label: 'Medical Expenses Receipts' },
    { value: 'Donations',    label: 'Charitable Donation Receipts' },
    { value: 'Childcare',    label: 'Childcare Receipts (Daycare / Babysitter)' },
    { value: 'Tuition',      label: 'Tuition Receipts / Student Fees' },
    { value: 'Moving',       label: 'Moving Expense Receipts' },
    { value: 'HomeOffice',   label: 'Home Office Expenses (T2200 / TP-64.3)' },
    { value: 'Union',        label: 'Union / Professional Dues' },
    { value: 'Tools',        label: 'Tradesperson\u2019s Tools Receipts' },
    { value: 'Clergy',       label: 'Clergy Residence Deduction' },
    { value: 'AdoptionExp',  label: 'Adoption Expense Receipts' },
  ],
};

const SELF_EMPLOYMENT: DocGroup = {
  label: 'Self-Employment & Business',
  options: [
    { value: 'BusinessIncome',   label: 'Business / Self-Employment Income Summary' },
    { value: 'BusinessExpenses', label: 'Business Expense Receipts' },
    { value: 'T2125',            label: 'T2125 – Business & Professional Activities' },
    { value: 'T2042',            label: 'T2042 – Farming Income' },
    { value: 'T2121',            label: 'T2121 – Fishing Income' },
    { value: 'GST_HST',          label: 'GST / HST / QST Return' },
  ],
};

const RENTAL_CAPITAL: DocGroup = {
  label: 'Rental & Capital Gains',
  options: [
    { value: 'RentalIncome',  label: 'Rental Income / Expense Summary' },
    { value: 'T776',          label: 'T776 – Statement of Real Estate Rentals' },
    { value: 'CapitalGains',  label: 'Capital Gains / Losses Statement' },
    { value: 'ACB',           label: 'Adjusted Cost Base (ACB) Report' },
    { value: 'T1255',         label: 'T1255 – Disposition of Principal Residence' },
  ],
};

const OTHER: DocGroup = {
  label: 'Other',
  options: [
    { value: 'ForeignIncome',        label: 'Foreign Income / Assets (T1135)' },
    { value: 'SocialAssistance',     label: 'Social Assistance / Welfare Statement' },
    { value: 'WorkersComp',          label: 'Workers\u2019 Compensation Statement' },
    { value: 'DisabilityTaxCredit',  label: 'Disability Tax Credit Certificate (T2201)' },
    { value: 'CaregiverAmount',      label: 'Caregiver / Infirm Dependent Documents' },
    { value: 'ID',                   label: 'Government ID / SIN Card' },
    { value: 'Other',                label: 'Other Document' },
  ],
};

function getDocGroups(province: string): DocGroup[] {
  const groups: DocGroup[] = [FEDERAL_SLIPS];
  if (province === 'QC') groups.push(QC_RL_SLIPS);
  const provGroup = PROVINCE_SPECIFIC[province];
  if (provGroup) groups.push(provGroup);
  groups.push(CONTRIBUTIONS, DEDUCTIONS, SELF_EMPLOYMENT, RENTAL_CAPITAL, OTHER);
  return groups;
}

// ─── Province labels ──────────────────────────────────────────────────────────
const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland & Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaxYearClient() {
  const params  = useParams();
  const router  = useRouter();
  const year    = parseInt(params.year as string);

  const [completeness, setCompleteness] = useState<any>(null);
  const [uploading,    setUploading]    = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType,      setDocType]      = useState('T4');
  const [province,     setProvince]     = useState('QC');
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCompleteness = async () => {
    try {
      const res = await APIClient.getCompleteness(year);
      setCompleteness(res.data);
      if (res.data.province) setProvince(res.data.province);
    } catch (error: any) {
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    loadCompleteness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // Reset docType to first option of new province when province changes
  useEffect(() => {
    const groups = getDocGroups(province);
    if (groups[0]?.options[0]) setDocType(groups[0].options[0].value);
  }, [province]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const presignRes = await APIClient.presignUpload(year, {
        docType,
        filename: selectedFile.name,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      const { signedUrl, documentId } = presignRes.data;
      const uploadRes = await APIClient.uploadToSignedUrl(signedUrl, selectedFile);
      if (!uploadRes.ok) throw new Error(`Storage upload failed: ${uploadRes.status}`);
      await APIClient.confirmUpload(documentId);
      setSelectedFile(null);
      showToast(`${docType} uploaded successfully!`);
      loadCompleteness();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const hasProfile = completeness?.taxYear?.profile && (
    completeness.taxYear.profile.has_employment_income ||
    completeness.taxYear.profile.has_self_employment   ||
    completeness.taxYear.profile.has_investment_income ||
    completeness.taxYear.profile.has_rental_income     ||
    completeness.taxYear.profile.has_rrsp_contributions||
    completeness.taxYear.profile.has_childcare_expenses||
    completeness.taxYear.profile.has_tuition           ||
    completeness.taxYear.profile.has_medical_expenses  ||
    completeness.taxYear.profile.has_donations         ||
    completeness.taxYear.profile.claims_home_office    ||
    completeness.taxYear.profile.has_moving_expenses   ||
    completeness.taxYear.profile.is_married            ||
    completeness.taxYear.profile.has_dependents
  );

  const docGroups = getDocGroups(province);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 shadow-lg rounded-xl px-4 py-3 text-sm flex items-center gap-2 border ${
          toast.type === 'success'
            ? 'bg-white border-green-200 text-green-700'
            : 'bg-white border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/client/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-bold text-gray-900">Tax Year {year}</h1>
        </div>
        {completeness?.province && (
          <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
            📍 {completeness.province}
          </span>
        )}
      </nav>

      <div className="container mx-auto px-6 max-w-4xl">
        {!hasProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">Please complete your tax profile first</p>
            <button
              onClick={() => router.push(`/client/tax-year/${year}/profile`)}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Complete Profile
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Upload Documents</h2>

          {/* Province indicator */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <span className="text-sm text-blue-700">
              📍 Showing document types for <strong>{PROVINCE_NAMES[province] ?? province}</strong>
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                size={1}
              >
                {docGroups.map((group) => (
                  <optgroup key={group.label} label={`── ${group.label} ──`}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {completeness && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Tax Return Status</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Completeness</span>
                <span className="text-blue-600 font-bold">{completeness.completenessScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${completeness.completenessScore}%` }}
                />
              </div>
            </div>

            {completeness.documents && completeness.documents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Uploaded Documents ({completeness.documents.length})</h3>
                <ul className="space-y-2">
                  {completeness.documents.map((doc: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <span className="text-sm font-medium">{doc.docType}</span>
                        <span className="text-sm text-gray-500 ml-2">– {doc.filename}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          doc.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          doc.reviewStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.reviewStatus}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
