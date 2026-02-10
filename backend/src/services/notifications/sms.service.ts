import twilio = require('twilio');

// Validate required environment variables
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn('Twilio credentials not configured. SMS notifications will be disabled.');
}

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER;

export class SMSService {
  /**
   * Send SMS notification
   */
  static async sendSMS(to: string, message: string): Promise<void> {
    if (!client || !FROM_PHONE) {
      console.warn('Twilio not configured, skipping SMS');
      return;
    }

    try {
      await client.messages.create({
        body: message,
        from: FROM_PHONE,
        to
      });
      console.log(`SMS sent to ${to}`);
    } catch (error: any) {
      console.error('SMS error:', error);
      throw error;
    }
  }

  /**
   * Notify accountant: urgent submission
   */
  static async sendUrgentSubmissionSMS(
    to: string,
    clientName: string,
    year: number
  ): Promise<void> {
    const message = `TaxFlowAI: ${clientName} submitted documents for ${year}. Review needed.`;
    await this.sendSMS(to, message);
  }

  /**
   * Notify client: document rejected
   */
  static async sendDocumentRejectedSMS(
    to: string,
    docType: string
  ): Promise<void> {
    const message = `TaxFlowAI: Your ${docType} was rejected. Check your email for details.`;
    await this.sendSMS(to, message);
  }
}
