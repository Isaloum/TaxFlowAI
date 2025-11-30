// server.js - Development server for TaxSyncQC frontend with React support
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';

// Import the actual calculation functions
import { calculateCredits } from './src/credit-calculator.js';

// Import the new email/text parsing functionality
import { handleWebhookData } from '../../email-text-parser.js';

// Import PDF parsing functionality
import { extractTaxSlipFromPdf } from '../../pdf-parser.js';

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

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// API endpoint for parsing tax slip information from PDF files
app.post('/api/parse-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'PDF file is required' 
      });
    }
    
    // The PDF file is available as a buffer in req.file.buffer
    const pdfBuffer = req.file.buffer;
    
    const result = await extractTaxSlipFromPdf(pdfBuffer);
    
    if (result.success) {
      res.json({
        success: true,
        slip: result.slip,
        message: 'Tax slip information extracted from PDF successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        warnings: result.warnings
      });
    }
  } catch (error) {
    console.error('Error parsing tax slip from PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to parse tax slip information from PDF' 
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TaxSyncQC frontend server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});