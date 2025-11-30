// server.js - Development server for TaxSyncQC frontend with React support
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Import the actual calculation functions
import { calculateCredits } from './src/credit-calculator.js';

// Import the new email/text parsing functionality
import { handleWebhookData } from '../../email-text-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for development
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the 'src' directory
app.use(express.static(join(__dirname, 'src')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// API endpoint for tax calculations (using actual calculation functions)
app.post('/api/calculate', async (req, res) => {
  try {
    const { income, spouseIncome, children, rrspContribution, disability, workIncident } = req.body;
    
    // Prepare input data in the format expected by calculateCredits
    const inputData = {
      income: income || 0,
      spouseIncome: spouseIncome || 0,
      children: children || 0,
      rrspContribution: rrspContribution || 0,
      disability: disability || false,
      workIncident: workIncident || false
    };
    
    // Calculate using the actual functions
    const calculatedResults = calculateCredits(inputData);
    
    res.json(calculatedResults);
  } catch (error) {
    console.error('Error calculating credits:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// API endpoint for parsing tax slip information from emails, text messages, or n8n webhooks
app.post('/api/parse-slip', async (req, res) => {
  try {
    const result = await handleWebhookData(req.body);
    
    if (result.success) {
      res.json({
        success: true,
        slip: result.slip,
        message: 'Tax slip information extracted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        warnings: result.warnings
      });
    }
  } catch (error) {
    console.error('Error parsing tax slip from source:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to parse tax slip information' 
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TaxSyncQC frontend server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});