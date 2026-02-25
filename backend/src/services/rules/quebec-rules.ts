/**
 * Quebec Federal/Provincial Document Pairing Rules
 * If federal slip exists + province=QC → require Quebec equivalent
 */
export const QUEBEC_PAIRING_RULES = {
  T4_RL1: {
    code: 'QUEBEC_T4_RL1_PAIR',
    federal: 'T4',
    provincial: 'RL1',
    description: 'T4 requires matching RL-1 for Quebec residents',
    severity: 'error'
  },
  T4A_RL2: {
    code: 'QUEBEC_T4A_RL2_PAIR',
    federal: 'T4A',
    provincial: 'RL2',
    description: 'T4A requires matching RL-2 for Quebec residents',
    severity: 'error'
  },
  T5_RL3: {
    code: 'QUEBEC_T5_RL3_PAIR',
    federal: 'T5',
    provincial: 'RL3',
    description: 'T5 requires matching RL-3 for Quebec residents',
    severity: 'error'
  },
  T3_RL16: {
    code: 'QUEBEC_T3_RL16_PAIR',
    federal: 'T3',
    provincial: 'RL16',
    description: 'T3 requires matching RL-16 for Quebec residents',
    severity: 'error'
  },
  T5008_RL18: {
    code: 'QUEBEC_T5008_RL18_PAIR',
    federal: 'T5008',
    provincial: 'RL18',
    description: 'T5008 requires matching RL-18 for Quebec residents',
    severity: 'error'
  },
  T2202_RL8: {
    code: 'QUEBEC_T2202_RL8_PAIR',
    federal: 'T2202',
    provincial: 'RL8',
    description: 'T2202 requires matching RL-8 for Quebec residents',
    severity: 'error'
  },
  T4RSP_RL2: {
    code: 'QUEBEC_T4RSP_RL2_PAIR',
    federal: 'T4RSP',
    provincial: 'RL2',
    description: 'T4RSP requires matching RL-2 for Quebec residents',
    severity: 'error'
  }
};

/**
 * Supporting Document Rules
 */
export const SUPPORTING_DOC_RULES = {
  RRSP_RECEIPT: {
    code: 'RRSP_RECEIPT_REQUIRED',
    triggerCondition: (profile: any) => profile.has_rrsp_contributions === true,
    requiredDocType: 'RRSP_RECEIPT',
    description: 'RRSP contributions require contribution receipts',
    severity: 'error'
  },
  CHILDCARE_RECEIPT_FEDERAL: {
    code: 'CHILDCARE_RECEIPT_REQUIRED',
    triggerCondition: (profile: any) => profile.has_childcare_expenses === true,
    requiredDocType: 'CHILDCARE_RECEIPT',
    description: 'Childcare expenses require receipts',
    severity: 'error'
  },
  CHILDCARE_RL24_QUEBEC: {
    code: 'QUEBEC_CHILDCARE_RL24_REQUIRED',
    triggerCondition: (profile: any, client: any) =>
      profile.has_childcare_expenses === true && client.province === 'QC',
    requiredDocType: 'RL24',
    description: 'Quebec childcare expenses require RL-24',
    severity: 'error'
  },
  MEDICAL_RECEIPTS: {
    code: 'MEDICAL_RECEIPTS_REQUIRED',
    triggerCondition: (profile: any) => profile.has_medical_expenses === true,
    requiredDocType: 'MEDICAL_RECEIPT',
    description: 'Medical expense claims require receipts',
    severity: 'warning'
  },
  DONATION_RECEIPTS: {
    code: 'DONATION_RECEIPTS_REQUIRED',
    triggerCondition: (profile: any) => profile.has_donations === true,
    requiredDocType: 'DONATION_RECEIPT',
    description: 'Charitable donations require official receipts',
    severity: 'error'
  },
  HOME_OFFICE_T2200: {
    code: 'HOME_OFFICE_T2200_REQUIRED',
    triggerCondition: (profile: any) => profile.claims_home_office === true,
    requiredDocType: 'T2200',
    description: 'Home office expenses require T2200 from employer',
    severity: 'error'
  }
};

/**
 * Income Source Rules
 * Triggered by profile data - if user indicates they have a certain income type,
 * require appropriate documentation
 */
export const INCOME_SOURCE_RULES = {
  EMPLOYMENT_T4: {
    code: 'EMPLOYMENT_T4_REQUIRED',
    triggerCondition: (profile: any) => profile.has_employment_income === true,
    requiredDocType: 'T4',
    description: 'Employment income requires T4',
    severity: 'error'
  },
  SELF_EMPLOYMENT_T2125: {
    code: 'SELF_EMPLOYMENT_T2125_REQUIRED',
    triggerCondition: (profile: any) => profile.has_self_employment === true,
    requiredDocType: 'T2125',
    description: 'Self-employment income requires T2125',
    severity: 'error'
  },
  INVESTMENT_T5: {
    code: 'INVESTMENT_T5_REQUIRED',
    triggerCondition: (profile: any) => profile.has_investment_income === true,
    requiredDocType: 'T5',
    description: 'Investment income requires T5',
    severity: 'warning'
  }
};
