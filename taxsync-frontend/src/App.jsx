import React, { useState } from 'react';
import TaxCalculator from './components/TaxCalculator';
import './App.css';

function App() {
  const [language, setLanguage] = useState('en'); // Default to English

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>TaxSyncQC</h1>
          <p className="subtitle">Quebec + Federal Tax Credits Calculator</p>
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
        <TaxCalculator language={language} />
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} TaxSyncQC - All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;