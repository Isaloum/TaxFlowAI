import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const FROM_EMAIL = process.env.SES_EMAIL || 'notifications@isaloumapps.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.isaloumapps.com';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Html: { Data: html, Charset: 'UTF-8' } },
    },
  });
  await sesClient.send(command);
}

export class EmailService {
  /**
   * Notify client: document uploaded successfully
   */
  static async sendDocumentUploadedEmail(
    to: string,
    firstName: string,
    docType: string,
    year: number
  ): Promise<void> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#2563eb;">Document Received — TaxFlowAI</h2>
        <p>Hi ${firstName},</p>
        <p>Your <strong>${docType}</strong> for tax year <strong>${year}</strong> has been uploaded and is now under review.</p>
        <p><a href="${FRONTEND_URL}/client/tax-year/${year}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">View Documents</a></p>
        <p style="color:#6b7280;font-size:13px;">Thank you for using TaxFlowAI.</p>
      </div>`;
    await sendEmail(to, `Document Received: ${docType} (${year})`, html);
  }

  /**
   * Notify client: document rejected — action required
   */
  static async sendDocumentRejectedEmail(
    to: string,
    firstName: string,
    docType: string,
    reason: string,
    year: number
  ): Promise<void> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#dc2626;">Action Required — TaxFlowAI</h2>
        <p>Hi ${firstName},</p>
        <p>Your <strong>${docType}</strong> for tax year <strong>${year}</strong> needs to be re-uploaded.</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px;margin:16px 0;border-radius:4px;">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>Please log in and upload a corrected version.</p>
        <p><a href="${FRONTEND_URL}/client/tax-year/${year}" style="background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Re-upload Now</a></p>
        <p style="color:#6b7280;font-size:13px;">Thank you for using TaxFlowAI.</p>
      </div>`;
    await sendEmail(to, `Action Required: ${docType} Needs Re-upload (${year})`, html);
  }

  /**
   * Notify client: missing documents reminder
   */
  static async sendMissingDocumentsEmail(
    to: string,
    firstName: string,
    year: number,
    missingDocs: string[]
  ): Promise<void> {
    const docList = missingDocs.map((doc) => `<li>${doc}</li>`).join('');
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#d97706;">Reminder: Missing Documents — TaxFlowAI</h2>
        <p>Hi ${firstName},</p>
        <p>You still have missing documents for tax year <strong>${year}</strong>:</p>
        <ul style="color:#374151;">${docList}</ul>
        <p>Please upload them as soon as possible so your accountant can complete your return.</p>
        <p><a href="${FRONTEND_URL}/client/tax-year/${year}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Upload Now</a></p>
        <p style="color:#6b7280;font-size:13px;">Thank you for using TaxFlowAI.</p>
      </div>`;
    await sendEmail(to, `Reminder: Missing Documents for ${year}`, html);
  }

  /**
   * Notify accountant: client submitted documents for review
   */
  static async sendSubmissionNotificationEmail(
    to: string,
    accountantName: string,
    clientName: string,
    year: number,
    clientId: string
  ): Promise<void> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#2563eb;">New Submission Ready — TaxFlowAI</h2>
        <p>Hi ${accountantName},</p>
        <p><strong>${clientName}</strong> has submitted their documents for tax year <strong>${year}</strong> and is ready for your review.</p>
        <p><a href="${FRONTEND_URL}/accountant/client/${clientId}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Review Now</a></p>
        <p style="color:#6b7280;font-size:13px;">TaxFlowAI — Accountant Portal</p>
      </div>`;
    await sendEmail(to, `New Submission: ${clientName} (${year})`, html);
  }

  /**
   * Daily digest for accountant: clients pending review
   */
  static async sendDailyDigestEmail(
    to: string,
    accountantName: string,
    pendingCount: number,
    clients: Array<{ name: string; year: number; id: string }>
  ): Promise<void> {
    const clientList = clients
      .map(
        (c) =>
          `<li><a href="${FRONTEND_URL}/accountant/client/${c.id}" style="color:#2563eb;">${c.name} — ${c.year}</a></li>`
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#2563eb;">Daily Digest — TaxFlowAI</h2>
        <p>Hi ${accountantName},</p>
        <p>You have <strong>${pendingCount}</strong> client${pendingCount !== 1 ? 's' : ''} waiting for review:</p>
        <ul style="color:#374151;line-height:2;">${clientList}</ul>
        <p><a href="${FRONTEND_URL}/accountant/dashboard" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Go to Dashboard</a></p>
        <p style="color:#6b7280;font-size:13px;">TaxFlowAI — Accountant Portal</p>
      </div>`;
    await sendEmail(to, `Daily Digest: ${pendingCount} Client${pendingCount !== 1 ? 's' : ''} Pending Review`, html);
  }
}
