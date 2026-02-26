import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import { SESEmailService } from '../services/ses-email.service';

const app = express();
app.set('trust proxy', 1);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'https://www.isaloumapps.com,https://isaloumapps.com').split(',').map(o => o.trim());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

const router = Router();

// Send welcome email endpoint
router.post('/welcome', async (req, res) => {
  try {
    const { to, name } = req.body;
    
    if (!to || !name) {
      return res.status(400).json({ error: 'Missing required fields: to and name' });
    }
    
    await SESEmailService.sendWelcomeEmail(to, name);
    res.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending welcome email:', error);
    res.status(500).json({ 
      error: 'Failed to send welcome email', 
      details: errorMessage,
      retryable: true
    });
  }
});

// Send document processed email endpoint
router.post('/document-processed', async (req, res) => {
  try {
    const { to, documentName, classification } = req.body;
    
    if (!to || !documentName || !classification) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, documentName, and classification' 
      });
    }
    
    await SESEmailService.sendDocumentProcessedEmail(to, documentName, classification);
    res.json({ success: true, message: 'Document processed email sent' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending document processed email:', error);
    res.status(500).json({ 
      error: 'Failed to send document processed email', 
      details: errorMessage,
      retryable: true
    });
  }
});

app.use('/notifications', router);

export const handler = serverless(app);
