import React, { useState } from 'react';
import './TaxCalculator.css'; // Reuse existing styles

const MultiYearComparison = ({ language }) => {
  const [yearsData, setYearsData] = useState([
    { id: 1, year: new Date().getFullYear(), income: '', spouseIncome: '', children: 0, rrspContribution: '' }
  ]);
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: "Multi-Year Tax Comparison",
      yearLabel: "Year",
      incomeLabel: "Annual Income ($)",
      spouseIncomeLabel: "Spouse's Income ($)",
      childrenLabel: "Children",
      rrspLabel: "RRSP Contribution ($)",
      addYear: "Add Year",
      removeYear: "Remove",
      compareButton: "Compare Years",
      resultsTitle: "Multi-Year Comparison Results",
      yearColumn: "Year",
      incomeColumn: "Income",
      totalSavingsColumn: "Total Savings",
      loading: "Comparing...",
      resetButton: "Reset"
    },
    fr: {
      title: "Comparaison sur Plusieurs Années",
      yearLabel: "Année",
      incomeLabel: "Revenu Annuel ($)",
      spouseIncomeLabel: "Revenu du Conjoint ($)",
      childrenLabel: "Enfants",
      rrspLabel: "Contribution REER ($)",
      addYear: "Ajouter une Année",
      removeYear: "Supprimer",
      compareButton: "Comparer les Années",
      resultsTitle: "Résultats de la Comparaison sur Plusieurs Années",
      yearColumn: "Année",
      incomeColumn: "Revenu",
      totalSavingsColumn: "Économies Totales",
      loading: "Comparaison en cours...",
      resetButton: "Réinitialiser"
    }
  };

  const t = translations[language];

  const addYear = () => {
    const newId = Math.max(...yearsData.map(y => y.id)) + 1;
    const newYear = {
      id: newId,
      year: new Date().getFullYear() + (yearsData.length),
      income: '',
      spouseIncome: '',
      children: 0,
      rrspContribution: ''
    };
    setYearsData([...yearsData, newYear]);
  };

  const removeYear = (id) => {
    if (yearsData.length <= 1) return;
    setYearsData(yearsData.filter(year => year.id !== id));
  };

  const updateYearData = (id, field, value) => {
    setYearsData(yearsData.map(year => 
      year.id === id ? { ...year, [field]: value } : year
    ));
  };

  const handleCompare = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      // In a real implementation, we would call the backend API for each year
      // For now, we'll simulate the results
      const comparisonResults = [];
      
      for (const yearData of yearsData) {
        // Simulate API call for each year
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            income: parseFloat(yearData.income) || 0,
            spouseIncome: parseFloat(yearData.spouseIncome) || 0,
            children: parseInt(yearData.children) || 0,
            rrspContribution: parseFloat(yearData.rrspContribution) || 0,
            disability: false, // Not implemented in multi-year for simplicity
            workIncident: false // Not implemented in multi-year for simplicity
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          comparisonResults.push({
            year: yearData.year,
            income: parseFloat(yearData.income) || 0,
            totalSavings: result.totalSavings
          });
        } else {
          console.error(`Error calculating for year ${yearData.year}:`, response.statusText);
        }
      }
      
      setResults(comparisonResults);
    } catch (error) {
      console.error('Error in multi-year comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setYearsData([
      { id: 1, year: new Date().getFullYear(), income: '', spouseIncome: '', children: 0, rrspContribution: '' }
    ]);
    setResults(null);
  };

  return (
    <div className="multi-year-comparison">
      <h2>{t.title}</h2>
      
      <div className="years-container">
        {yearsData.map((yearData) => (
          <div key={yearData.id} className="year-entry">
            <div className="form-row">
              <div className="form-group">
                <label>{t.yearLabel}</label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={yearData.year}
                  onChange={(e) => updateYearData(yearData.id, 'year', parseInt(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label>{t.incomeLabel}</label>
                <input
                  type="number"
                  value={yearData.income}
                  onChange={(e) => updateYearData(yearData.id, 'income', e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label>{t.spouseIncomeLabel}</label>
                <input
                  type="number"
                  value={yearData.spouseIncome}
                  onChange={(e) => updateYearData(yearData.id, 'spouseIncome', e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label>{t.childrenLabel}</label>
                <input
                  type="number"
                  value={yearData.children}
                  onChange={(e) => updateYearData(yearData.id, 'children', e.target.value)}
                  min="0"
                  max="10"
                />
              </div>
              
              <div className="form-group">
                <label>{t.rrspLabel}</label>
                <input
                  type="number"
                  value={yearData.rrspContribution}
                  onChange={(e) => updateYearData(yearData.id, 'rrspContribution', e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              
              {yearsData.length > 1 && (
                <div className="form-group remove-btn-container">
                  <button 
                    type="button" 
                    onClick={() => removeYear(yearData.id)}
                    className="remove-year-btn"
                  >
                    {t.removeYear}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={addYear} className="add-year-btn">
          {t.addYear}
        </button>
        <button 
          type="button" 
          onClick={handleCompare} 
          disabled={isLoading}
          className="compare-btn"
        >
          {isLoading ? t.loading : t.compareButton}
        </button>
        <button type="button" onClick={handleReset} className="reset-btn">
          {t.resetButton}
        </button>
      </div>
      
      {results && (
        <div className="results-section">
          <h3>{t.resultsTitle}</h3>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>{t.yearColumn}</th>
                  <th>{t.incomeColumn}</th>
                  <th>{t.totalSavingsColumn}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.year}</td>
                    <td>${result.income.toLocaleString()}</td>
                    <td>${result.totalSavings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiYearComparison;