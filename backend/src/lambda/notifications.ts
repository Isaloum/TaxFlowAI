import serverless from 'serverless-http';
import express from 'express';
import { Router } from 'express';
import { SESEmailService } from '../services/ses-email.service';

const app = express();
app.use(express.json());

const router = Router();

// Send welcome email endpoint
router.post('/welcome', async (req, res) => {
  try {
    const { to, name } = req.body;
    await SESEmailService.sendWelcomeEmail(to, name);
    res.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

// Send document processed email endpoint
router.post('/document-processed', async (req, res) => {
  try {
    const { to, documentName, classification } = req.body;
    await SESEmailService.sendDocumentProcessedEmail(to, documentName, classification);
    res.json({ success: true, message: 'Document processed email sent' });
  } catch (error) {
    console.error('Error sending document processed email:', error);
    res.status(500).json({ error: 'Failed to send document processed email' });
  }
});

app.use('/notifications', router);

export const handler = serverless(app);
