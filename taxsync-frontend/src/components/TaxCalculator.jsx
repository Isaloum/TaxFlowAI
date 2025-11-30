import React, { useState } from 'react';
import RRSPOptimizerChart from './RRSPOptimizerChart.jsx';
import './TaxCalculator.css';

const TaxCalculator = ({ language }) => {
  const [formData, setFormData] = useState({
    income: '',
    spouseIncome: '',
    children: 0,
    rrspContribution: '',
    disability: false,
    workIncident: false
  });
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: "Quebec + Federal Tax Credits Calculator",
      incomeLabel: "Your Annual Income ($)",
      spouseIncomeLabel: "Spouse's Annual Income ($)",
      childrenLabel: "Number of Children",
      rrspLabel: "RRSP Contribution ($)",
      disabilityLabel: "Disability Tax Credit",
      workIncidentLabel: "Work Incident Tax Credit",
      calculateButton: "Calculate Tax Credits",
      resultsTitle: "Your Tax Credits Summary",
      quebecCredits: "Quebec Credits:",
      federalCredits: "Federal Credits:",
      solidarityCredit: "Quebec Solidarity Credit:",
      workPremium: "Quebec Work Premium:",
      basicPersonal: "Federal Basic Personal Amount Savings:",
      cwb: "Canada Workers Benefit:",
      totalSavings: "Total Estimated Savings:",
      loading: "Calculating...",
      resetButton: "Reset"
    },
    fr: {
      title: "Calculateur de Crédits d'Impôt Québec + Fédéral",
      incomeLabel: "Revenu Annuel ($)",
      spouseIncomeLabel: "Revenu Annuel du Conjoint ($)",
      childrenLabel: "Nombre d'Enfants",
      rrspLabel: "Contribution REER ($)",
      disabilityLabel: "Crédit d'Impôt pour Handicap",
      workIncidentLabel: "Crédit d'Impôt pour Incident de Travail",
      calculateButton: "Calculer les Crédits d'Impôt",
      resultsTitle: "Résumé de vos Crédits d'Impôt",
      quebecCredits: "Crédits Québec:",
      federalCredits: "Crédits Fédéraux:",
      solidarityCredit: "Crédit de Solidarité Québec:",
      workPremium: "Prime pour le Travail Québec:",
      basicPersonal: "Économies sur le Montant Personnel de Base Fédéral:",
      cwb: "Allocation Canadienne pour les Travailleurs:",
      totalSavings: "Économies Totales Estimées:",
      loading: "Calcul en cours...",
      resetButton: "Réinitialiser"
    }
  };

  const t = translations[language];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the backend API to calculate credits
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income: parseFloat(formData.income) || 0,
          spouseIncome: parseFloat(formData.spouseIncome) || 0,
          children: parseInt(formData.children) || 0,
          rrspContribution: parseFloat(formData.rrspContribution) || 0,
          disability: formData.disability,
          workIncident: formData.workIncident
        })
      });
      
      if (response.ok) {
        const calculatedResults = await response.json();
        setResults(calculatedResults);
      } else {
        console.error('Error calculating credits:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling calculation API:', error);
    }
    
    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      income: '',
      spouseIncome: '',
      children: 0,
      rrspContribution: '',
      disability: false,
      workIncident: false
    });
    setResults(null);
  };

  return (
    <div className="tax-calculator">
      <h2>{t.title}</h2>
      
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="form-group">
          <label htmlFor="income">{t.incomeLabel}</label>
          <input
            type="number"
            id="income"
            name="income"
            value={formData.income}
            onChange={handleInputChange}
            min="0"
            step="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="spouseIncome">{t.spouseIncomeLabel}</label>
          <input
            type="number"
            id="spouseIncome"
            name="spouseIncome"
            value={formData.spouseIncome}
            onChange={handleInputChange}
            min="0"
            step="100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="children">{t.childrenLabel}</label>
          <input
            type="number"
            id="children"
            name="children"
            value={formData.children}
            onChange={handleInputChange}
            min="0"
            max="10"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rrspContribution">{t.rrspLabel}</label>
          <input
            type="number"
            id="rrspContribution"
            name="rrspContribution"
            value={formData.rrspContribution}
            onChange={handleInputChange}
            min="0"
            step="100"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="disability"
              checked={formData.disability}
              onChange={handleInputChange}
            />
            {t.disabilityLabel}
          </label>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="workIncident"
              checked={formData.workIncident}
              onChange={handleInputChange}
            />
            {t.workIncidentLabel}
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="calculate-btn">
            {isLoading ? t.loading : t.calculateButton}
          </button>
          <button type="button" onClick={handleReset} className="reset-btn">
            {t.resetButton}
          </button>
        </div>
      </form>
      
      {results && (
        <div className="results-section">
          <h3>{t.resultsTitle}</h3>
          <div className="results-grid">
            <div className="result-card quebec">
              <h4>{t.quebecCredits}</h4>
              <ul>
                <li>{t.solidarityCredit}: <strong>${results.quebec.solidarityCredit.toFixed(2)}</strong></li>
                <li>{t.workPremium}: <strong>${results.quebec.workPremium.toFixed(2)}</strong></li>
              </ul>
            </div>
            
            <div className="result-card federal">
              <h4>{t.federalCredits}</h4>
              <ul>
                <li>{t.basicPersonal}: <strong>${results.federal.basicPersonalSavings.toFixed(2)}</strong></li>
                <li>{t.cwb}: <strong>${results.federal.cwb.toFixed(2)}</strong></li>
              </ul>
            </div>
          </div>
          
          <div className="total-savings">
            <h4>{t.totalSavings} <strong>${results.totalSavings.toFixed(2)}</strong></h4>
          </div>
          
          {/* RRSP Optimizer Chart */}
          <div className="rrsp-optimizer-section">
            <RRSPOptimizerChart 
              language={language} 
              income={parseFloat(formData.income) || 0} 
              contribution={parseFloat(formData.rrspContribution) || 0} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;