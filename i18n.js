// i18n.js — Quebec-compliant bilingual strings (fr/en)
export function t(lang = 'en') {
  const strings = {
    en: {
      income: 'Income',
      solidarity: 'Solidarity Credit',
      workPremium: 'Work Premium',
      bpaSavings: 'BPA Savings',
      cwb: 'CWB (cash)',
      qcTotal: 'QC Total',
      fedTotal: 'Fed Total',
      totalBenefit: 'Total Benefit',
      cashBack: 'Cash Back',
    },
    fr: {
      income: 'Revenu',
      solidarity: 'Crédit pour la solidarité',
      workPremium: 'Prime au travail',
      bpaSavings: 'Économies BPA',
      cwb: 'PTE (argent)',
      qcTotal: 'Total QC',
      fedTotal: 'Total fédéral',
      totalBenefit: 'Avantage total',
      cashBack: 'Remboursement',
    },
  };
  return (key) => strings[lang]?.[key] || strings.en[key] || key;
}
