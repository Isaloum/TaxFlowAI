// income-slip-parser.js — Auto-detects RL-1 or T4 and parses all key fields
export function parseIncomeSlip(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const hasRL1 = /Box\s+A[:\s]|Case\s+A[:\s]/i.test(clean);
  const hasT4 = /Box\s+14[:\s]|Case\s+14[:\s]/i.test(clean);

  let data = {
    source: hasRL1 ? 'RL-1' : hasT4 ? 'T4' : 'Unknown',
    employmentIncome: null,
    qpp: null,
    cpp: null,
    ei: null,
    ppip: null,
    unionDues: null,
    sin: null
  };

  // Helper: extract by pattern (supports "Box X", "Case X", "X:")
  const extract = (label, regex) => {
    const match = clean.match(regex);
    return match ? parseFloat(match[1].replace(/,/g, '')) || 0 : null;
  };

  // --- RL-1 (Revenu Québec) ---
  if (hasRL1) {
    data.employmentIncome = extract('A', /(?:Box|Case)\s+A[:\s]*([\d,]+\.?\d*)/i);
    data.qpp = extract('B.A', /(?:Box|Case)\s+B\.A[:\s]*([\d,]+\.?\d*)/i);
    data.ei = extract('C', /(?:Box|Case)\s+C[:\s]*([\d,]+\.?\d*)/i);
    data.ppip = extract('H', /(?:Box|Case)\s+H[:\s]*([\d,]+\.?\d*)/i);
    data.unionDues = extract('F', /(?:Box|Case)\s+F[:\s]*([\d,]+\.?\d*)/i);
  }

  // --- T4 (CRA) ---
  if (hasT4) {
    data.employmentIncome = extract('14', /Box\s+14[:\s]*([\d,]+\.?\d*)/i);
    data.cpp = extract('16', /Box\s+16[:\s]*([\d,]+\.?\d*)/i);
    data.qpp = extract('17', /Box\s+17[:\s]*([\d,]+\.?\d*)/i);
    data.ei = extract('18', /Box\s+18[:\s]*([\d,]+\.?\d*)/i);
    data.ppip = extract('55', /Box\s+55[:\s]*([\d,]+\.?\d*)/i);
    data.unionDues = extract('44', /Box\s+44[:\s]*([\d,]+\.?\d*)/i);
  }

  // Shared: SIN (both use 123-456-789 format)
  const sinMatch = clean.match(/S\.?I\.?N\.?[:\s-]*([\d\s-]{9,11})/i);
  data.sin = sinMatch ? sinMatch[1].replace(/\D/g, '') : null;

  // Validation & warnings
  data.isValid = () => data.employmentIncome !== null && data.employmentIncome > 0;
  data.warnings = () => {
    const w = [];
    if (data.unionDues === null) 
      w.push(data.source === 'RL-1' ? 
        "Cotisations syndicales (case F) manquantes — peuvent être déductibles" : 
        "Union dues (Box 44) missing — may be deductible");
    if (!data.sin) w.push("NAS/SIN manquant — obligatoire");
    return w;
  };

  return data;
}
