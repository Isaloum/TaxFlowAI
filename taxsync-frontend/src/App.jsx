import React, { useState } from 'react';
import TaxCalculator from './components/TaxCalculator';
import TaxSlipParser from './components/TaxSlipParser';
import './App.css';

function App() {
  const [language, setLanguage] = useState('en'); // Default to English
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'parser'

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>TaxSyncQC</h1>
          <p className="subtitle">Quebec + Federal Tax Credits Calculator</p>
          <div className="tab-navigation">
            <button 
              className={activeTab === 'calculator' ? 'active' : ''} 
              onClick={() => setActiveTab('calculator')}
            >
              {language === 'en' ? 'Tax Calculator' : 'Calculateur Fiscal'}
            </button>
            <button 
              className={activeTab === 'parser' ? 'active' : ''} 
              onClick={() => setActiveTab('parser')}
            >
              {language === 'en' ? 'Auto-Parser' : 'Analyseur Auto'}
            </button>
          </div>
          <div className="language-toggle">
            <button 
              className={language === 'fr' ? 'active' : ''} 
              onClick={() => setLanguage('fr')}
            >
              FR
            </button>
            <button 
              className={language === 'en' ? 'active' : ''} 
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <main>
        {activeTab === 'calculator' ? (
          <TaxCalculator language={language} />
        ) : (
          <TaxSlipParser language={language} />
        )}
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} TaxSyncQC - All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;