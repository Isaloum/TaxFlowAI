'use client';

import { useEffect, useState, useRef } from 'react';
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
    { value: 'T5007',    label: 'T5007 – Workers Compensation / Social Assistance' },
    { value: 'T4FHSA',  label: 'T4FHSA – First Home Savings Account' },
    { value: 'RC210',    label: 'RC210 – Canada Workers Benefit Advance Payments' },
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
    { value: 'RL18', label: 'RL-18 – Securities Transactions' },
    { value: 'RL19', label: 'RL-19 – Advance Payments (RL-1 / RQAP)' },
    { value: 'RL31', label: 'RL-31 – Rental Housing (for Solidarity Credit)' },
    { value: 'RL32', label: 'RL-32 – First Home Savings Account (FHSA)' },
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
    { value: 'AdoptionExp',        label: 'Adoption Expense Receipts' },
    { value: 'StudentLoanInterest', label: 'Student Loan Interest Certificate' },
    { value: 'ChildrenActivities', label: "Children's Activity / Sports Receipts" },
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
    { value: 'VehicleLog',       label: 'Vehicle Expense Log / Mileage Log' },
    { value: 'GigPlatformReport', label: 'Gig Platform Annual Report (Uber, DoorDash, Airbnb…)' },
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
    { value: 'NoticeOfAssessment',   label: 'Notice of Assessment (last year\'s NOA)' },
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

// ─── Profile → required documents mapping ─────────────────────────────────────
type CheckItem = { docType: string; label: string; provinces?: string[] };

const PROFILE_DOCS: Record<string, CheckItem[]> = {
  // ── Income ──────────────────────────────────────────────────────────────────
  has_employment_income: [
    { docType: 'T4',  label: 'T4 – Employment Income' },
    { docType: 'RL1', label: 'RL-1 – Employment & Other Income', provinces: ['QC'] },
  ],
  has_self_employment: [
    { docType: 'BusinessIncome',   label: 'Business / Self-Employment Income Summary' },
    { docType: 'BusinessExpenses', label: 'Business Expense Receipts' },
    { docType: 'RL15', label: 'RL-15 – Professional / Self-Employment Income', provinces: ['QC'] },
  ],
  has_gig_income: [
    { docType: 'GigPlatformReport', label: 'Gig Platform Annual Report (Uber, DoorDash, Airbnb…)' },
  ],
  has_investment_income: [
    { docType: 'T5',  label: 'T5 – Investment Income (Dividends / Interest)' },
    { docType: 'T3',  label: 'T3 – Trust / Mutual Fund Income' },
    { docType: 'RL3', label: 'RL-3 – Investment Income', provinces: ['QC'] },
  ],
  has_securities_transactions: [
    { docType: 'T5008', label: 'T5008 – Securities Transactions' },
    { docType: 'RL18',  label: 'RL-18 – Securities Transactions', provinces: ['QC'] },
  ],
  has_rental_income: [
    { docType: 'RentalIncome', label: 'Rental Income & Expense Summary' },
  ],
  has_retirement_income: [
    { docType: 'T4A_OAS', label: 'T4A(OAS) – Old Age Security' },
    { docType: 'T4A_P',   label: 'T4A(P) – CPP / QPP Benefits' },
    { docType: 'T4A',     label: 'T4A – Pension / Annuity / Other Income' },
    { docType: 'T4RIF',   label: 'T4RIF – RRIF Income' },
    { docType: 'T4RSP',   label: 'T4RSP – RRSP Income (if withdrawn)' },
    { docType: 'RL2',     label: 'RL-2 – Retirement / Pension Income', provinces: ['QC'] },
  ],
  has_ei_rqap: [
    { docType: 'T4E', label: 'T4E – Employment Insurance (EI)' },
    { docType: 'RL6', label: 'RL-6 – EI / RQAP / QPIP Benefits', provinces: ['QC'] },
  ],
  has_social_assistance: [
    { docType: 'T5007', label: 'T5007 – Workers Compensation / Social Assistance' },
    { docType: 'RL5',   label: 'RL-5 – CNESST / Social Assistance Benefits', provinces: ['QC'] },
  ],
  // ── Savings & Plans ─────────────────────────────────────────────────────────
  has_rrsp_contributions: [
    { docType: 'RRSP',  label: 'RRSP Contribution Receipt' },
    { docType: 'RL10',  label: 'RL-10 – RRSP / FTQ / CSN Contributions', provinces: ['QC'] },
  ],
  has_fhsa: [
    { docType: 'T4FHSA', label: 'T4FHSA – First Home Savings Account' },
    { docType: 'RL32',   label: 'RL-32 – FHSA (Quebec)', provinces: ['QC'] },
  ],
  // ── Deductions & Credits ────────────────────────────────────────────────────
  has_childcare_expenses: [
    { docType: 'Childcare', label: 'Childcare Receipts (Daycare / Babysitter)' },
    { docType: 'RL24',      label: 'RL-24 – Childcare Assistance', provinces: ['QC'] },
  ],
  has_tuition: [
    { docType: 'T2202', label: 'T2202 – Tuition Certificate' },
    { docType: 'RL8',   label: 'RL-8 – Tuition (Quebec)', provinces: ['QC'] },
  ],
  has_student_loans: [
    { docType: 'StudentLoanInterest', label: 'Student Loan Interest Certificate' },
  ],
  has_medical_expenses: [
    { docType: 'Medical', label: 'Medical / Dental / Vision Receipts' },
  ],
  has_donations: [
    { docType: 'Donations', label: 'Charitable Donation Receipts' },
  ],
  claims_home_office: [
    { docType: 'HomeOffice', label: 'Home Office Expenses — T2200 / TP-64.3 (employer-signed)' },
  ],
  has_moving_expenses: [
    { docType: 'Moving', label: 'Moving Expense Receipts' },
  ],
  has_disability: [
    { docType: 'DisabilityTaxCredit', label: 'T2201 – Disability Tax Credit Certificate' },
  ],
  // ── Living Situation ────────────────────────────────────────────────────────
  is_tenant: [
    { docType: 'RL31', label: 'RL-31 – Rental Housing (for QC Solidarity Credit)', provinces: ['QC'] },
  ],
  // ── Business / Vehicle ──────────────────────────────────────────────────────
  has_vehicle_for_business: [
    { docType: 'VehicleLog', label: 'Vehicle Expense Log / Mileage Log' },
  ],
};

// A doc type is "satisfied" only if at least one uploaded copy has no issues and isn't rejected
function buildChecklist(profile: any, province: string, uploadedDocs: any[]) {
  const items: { docType: string; label: string; uploaded: boolean }[] = [];
  for (const [key, docs] of Object.entries(PROFILE_DOCS)) {
    if (!profile?.[key]) continue;
    for (const doc of docs) {
      if (doc.provinces && !doc.provinces.includes(province)) continue;
      const copies = uploadedDocs.filter((d: any) => d.docType === doc.docType);
      // "Unreadable" (OCR failed) still counts — accountant reviews manually
      const satisfied = copies.some((d: any) =>
        !d.typeMismatch &&
        !d.yearMismatch &&
        !d.nameMismatch &&
        d.reviewStatus !== 'rejected'
      );
      items.push({ docType: doc.docType, label: doc.label, uploaded: satisfied });
    }
  }
  return items;
}


// Doc types that can have multiple uploads (multiple employers, platforms, etc.)
const MULTI_UPLOAD_TYPES = new Set([
  'T4','T4A','T5','T5008','T4FHSA','RC210',
  'RL1','RL2','RL3','RL16','RL18','RL24','RL25','RL32',
  'GigPlatformReport','VehicleLog',
]);

// Placeholder text for the label field per doc type
const LABEL_PLACEHOLDER: Record<string, string> = {
  T4: "Employer name (e.g. McDonald's)",
  T4A: 'Payer name (e.g. Pension plan name)',
  T5: 'Institution (e.g. RBC, Desjardins)',
  T5008: 'Institution name',
  T4FHSA: 'Institution name',
  RC210: 'Institution name',
  RL1: "Employer name (e.g. McDonald's)",
  RL2: 'Payer name',
  RL3: 'Institution name',
  RL16: 'Trust / fund name',
  RL18: 'Institution name',
  RL24: 'Childcare provider name',
  RL25: 'Landlord / co-op name',
  RL32: 'Institution name',
  GigPlatformReport: 'Platform name (e.g. Uber, Lyft, DoorDash)',
  VehicleLog: 'Vehicle (e.g. Toyota Corolla 2019)',
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
  const [submitting,   setSubmitting]   = useState(false);
  const [docLabel,     setDocLabel]     = useState('');
  const [ownerName,    setOwnerName]    = useState('');
  const [pollCount,    setPollCount]    = useState(0);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [uploadFlash,  setUploadFlash]  = useState(false);
  const [pendingReupload, setPendingReupload] = useState<Set<string>>(new Set());
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLDivElement>(null);

  const handleReupload = (type: string, owner?: string, docId?: string) => {
    setDocType(type);
    if (owner) setOwnerName(owner);
    if (docId) setPendingReupload(prev => new Set([...prev, docId]));
    uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setUploadFlash(true);
    setTimeout(() => setUploadFlash(false), 3000);
  };

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

  // Auto-select docType from first unchecked profile item when completeness loads
  useEffect(() => {
    if (!completeness) return;
    const prof = completeness?.taxYear?.profile;
    const uploaded = completeness?.documents ?? [];
    const prov = completeness?.province ?? province;
    const cl = buildChecklist(prof, prov, uploaded);
    const firstPending = cl.find(i => !i.uploaded);
    if (firstPending) setDocType(firstPending.docType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeness]);

  // Auto-refresh every 5 s while any document is still being scanned (max 12 polls = 60s)
  const allDocs = completeness?.documents ?? [];
  const isScanning = allDocs.some((d: any) =>
    (d.extractionStatus === 'pending' || d.extractionStatus === 'processing') && d.extractionStatus !== 'skipped'
  ) && pollCount < 12;
  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setPollCount(c => c + 1);
      loadCompleteness();
    }, 2000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);


  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      await APIClient.deleteDocument(documentId);
      setPollCount(0);
      await loadCompleteness();
      showToast('Document removed. You can now upload the correct one.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await APIClient.submitForReview(year);
      showToast('File submitted for review! Your accountant will be notified.', 'success');
      await loadCompleteness();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
        docSubtype: docLabel.trim() || undefined,
        ownerName:  ownerName.trim() || undefined,
      });
      const { signedUrl, documentId } = presignRes.data;
      const uploadRes = await APIClient.uploadToSignedUrl(signedUrl, selectedFile);
      if (!uploadRes.ok) throw new Error(`Storage upload failed: ${uploadRes.status}`);
      await APIClient.confirmUpload(documentId);
      setSelectedFile(null);
      setDocLabel('');
      setOwnerName('');
      setPollCount(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast(`${docType} uploaded successfully!`);
      loadCompleteness();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const p = completeness?.taxYear?.profile;
  const hasProfile = p && (
    p.has_employment_income       ||
    p.has_self_employment         ||
    p.has_gig_income              ||
    p.has_investment_income       ||
    p.has_securities_transactions ||
    p.has_rental_income           ||
    p.has_retirement_income       ||
    p.has_ei_rqap                 ||
    p.has_social_assistance       ||
    p.has_rrsp_contributions      ||
    p.has_fhsa                    ||
    p.has_childcare_expenses      ||
    p.has_tuition                 ||
    p.has_student_loans           ||
    p.has_medical_expenses        ||
    p.has_donations               ||
    p.claims_home_office          ||
    p.has_moving_expenses         ||
    p.has_disability              ||
    p.is_tenant                   ||
    p.has_vehicle_for_business    ||
    p.is_married                  ||
    p.has_dependents
  );

  const docGroups = getDocGroups(province);

  // Build required-doc checklist from profile + uploaded docs
  const uploadedDocs = completeness?.documents ?? [];
  const checklist    = buildChecklist(p, province, uploadedDocs);
  const doneCount     = checklist.filter(i => i.uploaded).length;
  const totalCount    = checklist.length;
  const frontendScore = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Any extra documents uploaded that aren't on the required checklist
  const requiredTypes  = new Set(checklist.map(i => i.docType));
  const extraDocs      = uploadedDocs.filter((d: any) => !requiredTypes.has(d.docType));

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

      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
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

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

        {/* ── STEP 1: Profile required ─────────────────────────────────── */}
        {!hasProfile ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 1 — Complete your tax profile</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Tell us about your income sources and deductions so we can show you exactly which documents to upload.
            </p>
            <button
              onClick={() => router.push(`/client/tax-year/${year}/profile`)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Start profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        ) : (
          /* ── STEP 2: Upload documents ──────────────────────────────────── */
          <div ref={uploadFormRef} className={`bg-white rounded-2xl shadow-sm border p-6 mb-6 transition-all duration-300 ${uploadFlash ? 'border-blue-400 ring-2 ring-blue-300' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Step 2 — Upload Documents</h2>
              <button
                onClick={() => router.push(`/client/tax-year/${year}/profile`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </div>

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


              {/* Label field — only for multi-upload doc types */}
              {MULTI_UPLOAD_TYPES.has(docType) && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Label <span className="text-gray-400 font-normal">(optional — helps tell copies apart)</span>
                  </label>
                  <input
                    type="text"
                    value={docLabel}
                    onChange={(e) => setDocLabel(e.target.value)}
                    placeholder={LABEL_PLACEHOLDER[docType] || 'e.g. name or description'}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              )}

              {/* Name on document — always required */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name on document <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(yours, spouse, child, etc.)</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || !ownerName.trim() || uploading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {/* ── Document checklist ──────────────────────────────────────── */}
        {hasProfile && completeness && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">

            {/* Header + progress */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Required Documents</h2>
              <span className={`text-sm font-bold ${frontendScore === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {doneCount}/{totalCount} uploaded
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all ${frontendScore === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${frontendScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mb-5">{frontendScore}% complete — based on your tax profile</p>

            {/* Checklist */}
            {checklist.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {checklist.map((item, idx) => {
                  // All uploaded copies of this doc type
                  const uploadedList = uploadedDocs.filter((d: any) => d.docType === item.docType);
                  const isMulti = MULTI_UPLOAD_TYPES.has(item.docType);
                  const anyIssue = uploadedList.some((d: any) => d.typeMismatch || d.yearMismatch || d.nameMismatch);
                  const anyRejected = uploadedList.some((d: any) => d.reviewStatus === 'rejected');

                  // Row background (based on worst state)
                  let rowBg = 'bg-gray-50 border-gray-100';
                  if (item.uploaded) {
                    if (anyIssue)        rowBg = 'bg-orange-50 border-orange-200';
                    else if (anyRejected) rowBg = 'bg-red-50 border-red-200';
                    else                 rowBg = 'bg-green-50 border-green-100';
                  }

                  return (
                    <li key={idx} className={`p-3 rounded-lg border ${rowBg}`}>
                      {/* ── Header row ── */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {item.uploaded ? (
                            anyIssue ? (
                              <span className="text-orange-500 text-base flex-shrink-0 mt-0.5">⚠️</span>
                            ) : (
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <p className={`text-sm font-medium ${anyIssue ? 'text-orange-800' : item.uploaded ? 'text-green-800' : 'text-gray-700'}`}>
                            {item.label}
                            {uploadedList.length > 1 && (
                              <span className="ml-2 text-[11px] font-normal bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                {uploadedList.length} uploaded
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {!item.uploaded && (
                            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Missing</span>
                          )}
                          {item.uploaded && isMulti && (
                            <button
                              onClick={() => { setDocType(item.docType); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="text-[11px] text-blue-600 hover:underline"
                            >
                              + Add another
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ── Sub-rows: one per uploaded copy ── */}
                      {uploadedList.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-8">
                          {uploadedList.map((doc: any) => {
                            const scan = doc.extractionStatus;
                            const approved = doc.reviewStatus === 'approved';
                            const rejected = doc.reviewStatus === 'rejected';
                            const scanning = scan === 'pending' || scan === 'processing';
                            const hasMismatch = !approved && (doc.typeMismatch || doc.yearMismatch || doc.nameMismatch);
                            return (
                              <li key={doc.id} className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-500 truncate">
                                  {doc.docSubtype ? <strong className="text-gray-700">{doc.docSubtype}</strong> : doc.filename ?? doc.docType}
                                  {doc.docSubtype && <span className="text-gray-400"> — {doc.filename}</span>}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Simple client-friendly status — one badge only */}
                                  {approved && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✓ Received</span>}
                                  {!approved && rejected && (
                                    pendingReupload.has(doc.id)
                                      ? <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">⏳ Under review</span>
                                      : <>
                                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                            ⚠️{doc.rejectionReason ? ` ${doc.rejectionReason}` : ' Fix needed'}
                                          </span>
                                          <button
                                            onClick={() => handleReupload(doc.docType, doc.ownerName, doc.id)}
                                            className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full hover:bg-blue-700 transition font-medium"
                                          >
                                            ↩ Re-upload
                                          </button>
                                        </>
                                  )}
                                  {!approved && !rejected && hasMismatch && doc.typeMismatch && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">⚠️ Wrong document</span>}
                                  {!approved && !rejected && hasMismatch && !doc.typeMismatch && doc.yearMismatch && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">⚠️ Wrong year</span>}
                                  {!approved && !rejected && hasMismatch && !doc.typeMismatch && !doc.yearMismatch && doc.nameMismatch && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">⚠️ Wrong name</span>}
                                  {!approved && !rejected && !hasMismatch && (scanning || scan === 'failed' || scan === 'success') && (
                                    scanning
                                      ? <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full animate-pulse">⏳ Under review</span>
                                      : <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">⏳ Under review</span>
                                  )}
                                  {/* Delete on ALL docs so user can always replace */}
                                  <button
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={deletingId === doc.id}
                                    className="text-[10px] text-gray-400 hover:text-red-600 hover:underline disabled:opacity-50 ml-1"
                                  >
                                    {deletingId === doc.id ? 'Deleting…' : '🗑'}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No required documents identified from your profile.</p>
            )}

            {/* Extra docs not in checklist */}
            {extraDocs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Documents</p>
                <ul className="space-y-2">
                  {extraDocs.map((doc: any, idx: number) => {
                    const scan = doc.extractionStatus;
                    // Only flag as issue for wrong doc/year/name or rejected — not OCR failure
                    const hasIssue = doc.typeMismatch || doc.yearMismatch || doc.nameMismatch || doc.reviewStatus === 'rejected';
                    return (
                      <li key={idx} className={`flex items-start justify-between p-3 rounded-lg border gap-3 ${
                        hasIssue ? 'bg-orange-50 border-orange-200' :
                        doc.reviewStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-start gap-3 min-w-0">
                          {hasIssue
                            ? <span className="text-orange-500 flex-shrink-0 mt-0.5">⚠️</span>
                            : <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700">{doc.docType}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {doc.filename}
                              {doc.taxpayerName && ` · ${doc.taxpayerName}`}
                              {doc.extractedYear && ` · ${doc.extractedYear}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {/* Simple client-friendly status */}
                          {doc.reviewStatus === 'approved'
                            ? <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Received</span>
                            : doc.reviewStatus === 'rejected'
                            ? pendingReupload.has(doc.id)
                              ? <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">⏳ Under review</span>
                              : <>
                                  <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                    ⚠️{doc.rejectionReason ? ` ${doc.rejectionReason}` : ' Fix needed'}
                                  </span>
                                  <button
                                    onClick={() => handleReupload(doc.docType, doc.ownerName, doc.id)}
                                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full hover:bg-blue-700 transition font-medium mt-1"
                                  >
                                    ↩ Re-upload
                                  </button>
                                </>
                            : doc.typeMismatch
                            ? <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⚠️ Wrong document</span>
                            : doc.yearMismatch
                            ? <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⚠️ Wrong year</span>
                            : doc.nameMismatch
                            ? <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⚠️ Wrong name</span>
                            : (scan === 'pending' || scan === 'processing')
                            ? <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full animate-pulse font-medium">⏳ Under review</span>
                            : <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">⏳ Under review</span>
                          }
                          {/* Delete always available */}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="text-[11px] text-gray-400 hover:text-red-600 hover:underline disabled:opacity-50 mt-1"
                          >
                            {deletingId === doc.id ? 'Deleting…' : '🗑 Delete'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── SUBMIT FOR REVIEW ──────────────────────────────────────── */}
        {hasProfile && uploadedDocs.length > 0 && completeness?.taxYear?.status !== 'submitted' && completeness?.taxYear?.status !== 'completed' && (() => {
          // OCR failure is NOT a blocking issue — accountant reviews manually
          const issueCount = uploadedDocs.filter((d: any) =>
            d.typeMismatch || d.yearMismatch || d.nameMismatch || d.reviewStatus === 'rejected'
          ).length;
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              {issueCount > 0 && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-2 items-start">
                  <span className="text-orange-500 flex-shrink-0">⚠️</span>
                  <p className="text-sm text-orange-800">
                    <strong>{issueCount} document{issueCount > 1 ? 's' : ''}</strong> {issueCount > 1 ? 'have' : 'has'} issues (wrong type, wrong year, or rejected).
                    Please delete and re-upload the correct files before submitting.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Ready? Submit your file for review</p>
                  <p className="text-sm text-gray-500 mt-0.5">Your accountant will be notified and can start reviewing your documents.</p>
                </div>
                <button
                  onClick={handleSubmitForReview}
                  disabled={submitting || issueCount > 0}
                  title={issueCount > 0 ? 'Fix document issues before submitting' : ''}
                  className="flex-shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
              </div>
            </div>
          );
        })()}
        {completeness?.taxYear?.status === 'submitted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mt-6 flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <p className="font-semibold text-blue-900">File submitted for review</p>
              <p className="text-sm text-blue-700">Your accountant has been notified. You will be alerted if any correction is needed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
