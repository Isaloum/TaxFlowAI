import React, { useState } from 'react';
import './TaxCalculator.css'; // Reuse existing styles

const TaxSlipParser = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const translations = {
    en: {
      title: "Tax Slip Auto-Parser",
      subtitle: "Extract tax slip information from emails, text messages, PDFs, or n8n data",
      inputLabel: "Paste email content, text message, or webhook data:",
      inputPlaceholder: "Paste your tax slip information here (RL-1, T4, etc.)...",
      parseButton: "Extract Tax Information",
      pdfLabel: "Or upload a PDF file:",
      pdfPlaceholder: "Select a PDF file containing tax slip information",
      pdfButton: "Upload and Extract",
      resultsTitle: "Extracted Tax Slip Information",
      incomeLabel: "Employment Income:",
      sourceLabel: "Slip Type:",
      sinLabel: "SIN:",
      qppLabel: "QPP Contributions:",
      cppLabel: "CPP Contributions:",
      eiLabel: "EI Premiums:",
      ppipLabel: "PPIP Premiums:",
      unionDuesLabel: "Union Dues:",
      loading: "Extracting information...",
      uploading: "Uploading PDF...",
      noData: "No tax slip information found in the provided text",
      errors: "Errors:",
      warnings: "Warnings:",
      resetButton: "Reset",
      fileSelected: "File selected: "
    },
    fr: {
      title: "Analyseur Automatique de Feuilles de Salaire",
      subtitle: "Extrait les informations fiscales des courriels, SMS, PDF ou données n8n",
      inputLabel: "Collez le contenu du courriel, message texte ou données webhook:",
      inputPlaceholder: "Collez vos informations de feuille de salaire ici (RL-1, T4, etc.)...",
      parseButton: "Extraire les Informations Fiscales",
      pdfLabel: "Ou téléchargez un fichier PDF:",
      pdfPlaceholder: "Sélectionnez un fichier PDF contenant des informations de feuille de salaire",
      pdfButton: "Télécharger et Extraire",
      resultsTitle: "Informations de Feuille de Salaire Extraites",
      incomeLabel: "Revenu d'emploi:",
      sourceLabel: "Type de Feuille:",
      sinLabel: "NAS:",
      qppLabel: "Cotisations RQAP:",
      cppLabel: "Cotisations RPC:",
      eiLabel: "Prestations d'AE:",
      ppipLabel: "Prestations IPPP:",
      unionDuesLabel: "Cotisations syndicales:",
      loading: "Extraction des informations...",
      uploading: "Téléchargement du PDF...",
      noData: "Aucune information de feuille de salaire trouvée dans le texte fourni",
      errors: "Erreurs:",
      warnings: "Avertissements:",
      resetButton: "Réinitialiser",
      fileSelected: "Fichier sélectionné: "
    }
  };

  const t = translations[language];

  const handleParse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Call the backend API to parse the tax slip information
      const response = await fetch('/api/parse-slip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.slip);
      } else {
        setError(data.error || t.noData);
        if (data.warnings && data.warnings.length > 0) {
          setError(prev => prev + '\n' + t.warnings + ' ' + data.warnings.join(', '));
        }
      }
    } catch (err) {
      setError(`${t.errors} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setError(t.errors + ' Please select a PDF file.');
      }
    }
  };

  const handlePdfParse = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t.errors + ' Please select a PDF file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.slip);
      } else {
        setError(data.error || t.noData);
        if (data.warnings && data.warnings.length > 0) {
          setError(prev => prev + '\n' + t.warnings + ' ' + data.warnings.join(', '));
        }
      }
    } catch (err) {
      setError(`${t.errors} ${err.message}`);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResults(null);
    setError('');
  };

  return (
    <div className="tax-slip-parser">
      <h2>{t.title}</h2>
      <p className="subtitle">{t.subtitle}</p>
      
      <form onSubmit={handleParse} className="parser-form">
        <div className="form-group">
          <label htmlFor="inputText">{t.inputLabel}</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.inputPlaceholder}
            rows="8"
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="parse-btn">
            {isLoading ? t.loading : t.parseButton}
          </button>
          <button type="button" onClick={handleReset} className="reset-btn">
            {t.resetButton}
          </button>
        </div>
      </form>
      
      {/* PDF Upload Section */}
      <div className="pdf-upload-section">
        <h3>{t.pdfLabel}</h3>
        <div className="form-group">
          <label htmlFor="pdfFile">{t.pdfPlaceholder}</label>
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="file-input-wrapper">
            <button 
              type="button" 
              className="file-select-btn"
              onClick={() => document.getElementById('pdfFile').click()}
            >
              {selectedFile ? `${t.fileSelected}${selectedFile.name}` : t.pdfPlaceholder}
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handlePdfParse} 
            disabled={isLoading || !selectedFile} 
            className="parse-btn"
          >
            {isLoading ? t.uploading : t.pdfButton}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-section">
          <h3>{t.errors}</h3>
          <p className="error-message">{error}</p>
        </div>
      )}
      
      {results && (
        <div className="results-section">
          <h3>{t.resultsTitle}</h3>
          <div className="results-grid">
            <div className="result-card">
              <ul>
                <li><strong>{t.sourceLabel}</strong> {results.source}</li>
                <li><strong>{t.incomeLabel}</strong> ${results.employmentIncome !== null ? results.employmentIncome : 'N/A'}</li>
                <li><strong>{t.sinLabel}</strong> {results.sin || 'N/A'}</li>
                {results.qpp !== null && <li><strong>{t.qppLabel}</strong> ${results.qpp}</li>}
                {results.cpp !== null && <li><strong>{t.cppLabel}</strong> ${results.cpp}</li>}
                {results.ei !== null && <li><strong>{t.eiLabel}</strong> ${results.ei}</li>}
                {results.ppip !== null && <li><strong>{t.ppipLabel}</strong> ${results.ppip}</li>}
                {results.unionDues !== null && <li><strong>{t.unionDuesLabel}</strong> ${results.unionDues}</li>}
              </ul>
            </div>
          </div>
          
          {results.warnings && results.warnings().length > 0 && (
            <div className="warnings-section">
              <h4>{t.warnings}</h4>
              <ul>
                {results.warnings().map((warning, index) => (
                  <li key={index} className="warning-item">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxSlipParser;