import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@taxflowai.com';

export class EmailService {
  /**
   * Send welcome email to new client
   */
  static async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to TaxFlowAI',
      html: `
        <h1>Welcome ${firstName}!</h1>
        <p>Your TaxFlowAI account has been created successfully.</p>
        <p>You can now upload your tax documents and track your submission progress in real-time.</p>
        <p><a href="${process.env.FRONTEND_URL}/client/dashboard">Go to Dashboard</a></p>
        <br>
        <p>Questions? Reply to this email.</p>
      `
    });
  }

  /**
   * Notify client: document uploaded successfully
   */
  static async sendDocumentUploadedEmail(
    to: string,
    firstName: string,
    docType: string,
    year: number
  ): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Document Uploaded: ${docType}`,
      html: `
        <h2>Hi ${firstName},</h2>
        <p>Your <strong>${docType}</strong> for tax year <strong>${year}</strong> has been uploaded successfully.</p>
        <p>We're processing it now and will update you once it's reviewed.</p>
        <p><a href="${process.env.FRONTEND_URL}/client/tax-year/${year}">View Documents</a></p>
      `
    });
  }

  /**
   * Notify client: document rejected
   */
  static async sendDocumentRejectedEmail(
    to: string,
    firstName: string,
    docType: string,
    reason: string,
    year: number
  ): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Action Required: ${docType} Rejected`,
      html: `
        <h2>Hi ${firstName},</h2>
        <p>Your <strong>${docType}</strong> was reviewed and needs to be re-uploaded.</p>
        <div style="background: #fee; border-left: 4px solid #c33; padding: 12px; margin: 16px 0;">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>Please upload a corrected version.</p>
        <p><a href="${process.env.FRONTEND_URL}/client/tax-year/${year}">Upload New Document</a></p>
      `
    });
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

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Reminder: Missing Documents for ${year}`,
      html: `
        <h2>Hi ${firstName},</h2>
        <p>You're almost done! We're still missing these documents for tax year ${year}:</p>
        <ul>${docList}</ul>
        <p><a href="${process.env.FRONTEND_URL}/client/tax-year/${year}">Upload Now</a></p>
      `
    });
  }

  /**
   * Notify accountant: client submitted documents
   */
  static async sendSubmissionNotificationEmail(
    to: string,
    accountantName: string,
    clientName: string,
    year: number,
    clientId: string
  ): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Submission: ${clientName} (${year})`,
      html: `
        <h2>Hi ${accountantName},</h2>
        <p><strong>${clientName}</strong> has submitted documents for tax year <strong>${year}</strong>.</p>
        <p><a href="${process.env.FRONTEND_URL}/accountant/client/${clientId}">Review Now</a></p>
      `
    });
  }

  /**
   * Daily digest for accountant: pending reviews
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
          `<li><a href="${process.env.FRONTEND_URL}/accountant/client/${c.id}">${c.name} (${c.year})</a></li>`
      )
      .join('');

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Daily Digest: ${pendingCount} Clients Pending Review`,
      html: `
        <h2>Hi ${accountantName},</h2>
        <p>You have <strong>${pendingCount}</strong> clients with pending document reviews:</p>
        <ul>${clientList}</ul>
        <p><a href="${process.env.FRONTEND_URL}/accountant/dashboard">Go to Dashboard</a></p>
      `
    });
  }
}
