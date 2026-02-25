export function parseRL1Text(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const extract = (regex) => {
    const m = clean.match(regex);
    return m ? parseFloat(m[1].replace(/,/g, '')) || 0 : null;
  };
  return {
    income: extract(/Case\s+A[:\s]*([\d,]+\.?\d*)/i),
    isValid: function () {
      return this.income > 0;
    },
  };
}
