import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Log notification to database
   */
  private static async logNotification(
    recipientId: string,
    type: 'email' | 'sms',
    channel: string,
    status: 'sent' | 'failed',
    metadata: any = {}
  ): Promise<void> {
    await prisma.notificationLog.create({
      data: {
        recipientId,
        type,
        channel,
        status,
        metadata
      }
    });
  }

  /**
   * Send document uploaded notification
   */
  static async notifyDocumentUploaded(
    clientId: string,
    docType: string,
    year: number
  ): Promise<void> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client || !client.emailNotifications) return;

      await EmailService.sendDocumentUploadedEmail(
        client.email,
        client.firstName,
        docType,
        year
      );

      await this.logNotification(clientId, 'email', 'document_uploaded', 'sent', {
        docType,
        year
      });
    } catch (error: any) {
      console.error('Notification error:', error);
      await this.logNotification(clientId, 'email', 'document_uploaded', 'failed');
    }
  }

  /**
   * Send document rejected notification
   */
  static async notifyDocumentRejected(
    documentId: string,
    reason: string
  ): Promise<void> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          taxYear: {
            include: { client: true }
          }
        }
      });

      if (!document) return;

      const client = document.taxYear.client;

      // Email
      if (client.emailNotifications) {
        await EmailService.sendDocumentRejectedEmail(
          client.email,
          client.firstName,
          document.docType,
          reason,
          document.taxYear.year
        );
        await this.logNotification(client.id, 'email', 'document_rejected', 'sent');
      }

      // SMS (optional)
      if (client.smsNotifications && client.phone) {
        await SMSService.sendDocumentRejectedSMS(client.phone, document.docType);
        await this.logNotification(client.id, 'sms', 'document_rejected', 'sent');
      }
    } catch (error: any) {
      console.error('Rejection notification error:', error);
    }
  }

  /**
   * Notify accountant: client submitted documents
   */
  static async notifyAccountantSubmission(
    clientId: string,
    year: number
  ): Promise<void> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { accountant: true }
      });

      if (!client) return;

      const accountant = client.accountant;
      const clientName = `${client.firstName} ${client.lastName}`;

      // Email
      if (accountant.emailNotifications) {
        await EmailService.sendSubmissionNotificationEmail(
          accountant.email,
          accountant.firmName,
          clientName,
          year,
          clientId
        );
        await this.logNotification(
          accountant.id,
          'email',
          'submission_notification',
          'sent'
        );
      }

      // SMS (urgent)
      if (accountant.smsNotifications && accountant.phone) {
        await SMSService.sendUrgentSubmissionSMS(
          accountant.phone,
          clientName,
          year
        );
        await this.logNotification(
          accountant.id,
          'sms',
          'submission_notification',
          'sent'
        );
      }
    } catch (error: any) {
      console.error('Submission notification error:', error);
    }
  }

  /**
   * Send missing documents reminder
   */
  static async sendMissingDocumentsReminder(
    clientId: string,
    year: number
  ): Promise<void> {
    try {
      const taxYear = await prisma.taxYear.findFirst({
        where: { clientId, year },
        include: {
          client: true,
          validations: true
        }
      });

      if (!taxYear || !taxYear.client.emailNotifications) return;

      // Get missing docs from validations
      const missingDocs = taxYear.validations
        .filter((v) => v.status === 'fail' && v.missingDocType)
        .map((v) => v.missingDocType!);

      if (missingDocs.length === 0) return;

      await EmailService.sendMissingDocumentsEmail(
        taxYear.client.email,
        taxYear.client.firstName,
        year,
        missingDocs
      );

      await this.logNotification(clientId, 'email', 'missing_documents', 'sent');
    } catch (error: any) {
      console.error('Missing docs reminder error:', error);
    }
  }

  /**
   * Send daily digest to accountant
   */
  static async sendDailyDigest(accountantId: string): Promise<void> {
    try {
      const accountant = await prisma.accountant.findUnique({
        where: { id: accountantId },
        include: {
          clients: {
            include: {
              taxYears: {
                where: { status: 'submitted' },
                orderBy: { submittedAt: 'desc' }
              }
            }
          }
        }
      });

      if (!accountant || !accountant.dailyDigest) return;

      const pendingClients = accountant.clients
        .filter((c) => c.taxYears.length > 0)
        .map((c) => ({
          name: `${c.firstName} ${c.lastName}`,
          year: c.taxYears[0].year,
          id: c.id
        }));

      if (pendingClients.length === 0) return;

      await EmailService.sendDailyDigestEmail(
        accountant.email,
        accountant.firmName,
        pendingClients.length,
        pendingClients
      );

      await this.logNotification(accountantId, 'email', 'daily_digest', 'sent');
    } catch (error: any) {
      console.error('Daily digest error:', error);
    }
  }
}
