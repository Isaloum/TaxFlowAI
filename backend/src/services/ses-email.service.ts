import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import crypto from 'crypto';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
};

export class SESEmailService {
  /**
   * Send a welcome email to a new user
   * @param to - Recipient email address
   * @param name - Recipient name
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const params = {
      Source: process.env.SES_EMAIL || 'notifications@isaloumapps.com',
      Destination: { 
        ToAddresses: [to] 
      },
      Message: {
        Subject: { 
          Data: 'Welcome to TaxFlowAI',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TaxFlowAI!</h1>
                </div>
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}! 👋</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for joining TaxFlowAI - your AI-powered tax document management assistant.
                  </p>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Start organizing your tax documents with our intelligent classification system. 
                    Upload your T4, RL-1, T5, and other tax forms, and let our AI do the work for you.
                  </p>
                  <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h3 style="color: #1f2937; margin-top: 0;">What you can do:</h3>
                    <ul style="color: #4b5563; line-height: 1.8;">
                      <li>Upload and classify tax documents automatically</li>
                      <li>Organize documents by tax year</li>
                      <li>Securely store and retrieve your files</li>
                      <li>Get email notifications on processing status</li>
                    </ul>
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://isaloumapps.com" 
                       style="background-color: #667eea; color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 6px; font-weight: bold; 
                              display: inline-block;">
                      Get Started
                    </a>
                  </div>
                  <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    Questions? Contact us at notifications@isaloumapps.com
                  </p>
                </div>
              </div>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    try {
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      console.log(`Welcome email sent successfully to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send welcome email to ${to}:`, errorMessage, error);
      throw new Error(`Failed to send welcome email to ${to}: ${errorMessage}`);
    }
  }

  /**
   * Send a notification email when a document is processed
   * @param to - Recipient email address
   * @param documentName - Name of the processed document
   * @param classification - Classification result
   */
  static async sendDocumentProcessedEmail(
    to: string, 
    documentName: string, 
    classification: string
  ): Promise<void> {
    const params = {
      Source: process.env.SES_EMAIL || 'notifications@isaloumapps.com',
      Destination: { 
        ToAddresses: [to] 
      },
      Message: {
        Subject: { 
          Data: `Document Processed: ${documentName}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✅ Document Processed</h1>
                </div>
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your document has been successfully processed and classified!
                  </p>
                  <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <h3 style="color: #1f2937; margin-top: 0;">Document Details:</h3>
                    <p style="color: #4b5563; margin: 10px 0;">
                      <strong>File:</strong> ${documentName}
                    </p>
                    <p style="color: #4b5563; margin: 10px 0;">
                      <strong>Classification:</strong> <span style="color: #10b981; font-weight: bold;">${classification}</span>
                    </p>
                  </div>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your document is now securely stored and organized in your tax year folder.
                    You can access it anytime from your dashboard.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://isaloumapps.com/client/documents" 
                       style="background-color: #667eea; color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 6px; font-weight: bold; 
                              display: inline-block;">
                      View Documents
                    </a>
                  </div>
                  <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    Questions? Contact us at notifications@isaloumapps.com
                  </p>
                </div>
              </div>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    try {
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      console.log(`Document processed email sent successfully to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send document processed email to ${to} for document ${documentName}:`, errorMessage, error);
      throw new Error(`Failed to send document processed email to ${to} for document "${documentName}": ${errorMessage}`);
    }
  }

  static async sendClientInvitationEmail(
    clientEmail: string,
    clientName: string,
    temporaryPassword: string,
    accountantFirmName: string,
    languagePref: string
  ): Promise<void> {
    const loginUrl = process.env.LOGIN_URL || 'https://www.isaloumapps.com/login';
    const appName = 'TaxFlowAI';
    const FROM = process.env.SES_EMAIL || 'notifications@isaloumapps.com';

    const frenchBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bienvenue sur ${appName}!</h2>
        <p>Bonjour ${clientName},</p>
        <p>Votre comptable de <strong>${accountantFirmName}</strong> vous a créé un compte.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Vos informations de connexion:</h3>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Mot de passe temporaire:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${temporaryPassword}</code></p>
        </div>
        <p><strong>⚠️ Important:</strong> Vous devrez changer ce mot de passe lors de votre première connexion.</p>
        <p><a href="${loginUrl}" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Se connecter maintenant</a></p>
      </div>
    `;

    const englishBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to ${appName}!</h2>
        <p>Hello ${clientName},</p>
        <p>Your accountant from <strong>${accountantFirmName}</strong> has created an account for you.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your login credentials:</h3>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Temporary password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${temporaryPassword}</code></p>
        </div>
        <p><strong>⚠️ Important:</strong> You will need to change this password on your first login.</p>
        <p><a href="${loginUrl}" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Login now</a></p>
      </div>
    `;

    const subject = languagePref === 'fr'
      ? `Bienvenue sur ${appName} - Votre compte a été créé`
      : `Welcome to ${appName} - Your account has been created`;

    const htmlBody = languagePref === 'fr'
      ? `${frenchBody}<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">${englishBody}`
      : `${englishBody}<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">${frenchBody}`;

    const command = new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [clientEmail] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
      },
    });

    try {
      await sesClient.send(command);
      console.log(`Invitation email sent to ${clientEmail}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send invitation email to ${clientEmail}:`, msg);
      throw new Error(`Failed to send invitation email: ${msg}`);
    }
  }

  /**
   * Send a generic notification email
  static async sendTaxReturnCompletedEmail(
    clientEmail: string,
    clientName: string,
    year: number,
    languagePref: string
  ): Promise<void> {
    const loginUrl = process.env.LOGIN_URL || 'https://www.isaloumapps.com/login';
    const FROM = process.env.SES_EMAIL || 'notifications@isaloumapps.com';

    const frBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#16a34a;">✅ Votre déclaration ${year} est complète!</h2>
        <p>Bonjour ${clientName},</p>
        <p>Bonne nouvelle! Votre comptable a terminé le traitement de votre déclaration de revenus ${year}.</p>
        <p>Tous vos documents ont été examinés et approuvés. Votre dossier est maintenant complet.</p>
        <p><a href="${loginUrl}" style="background-color:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Voir mon dossier</a></p>
        <p style="color:#6b7280;font-size:13px;">Merci de faire confiance à TaxFlowAI!</p>
      </div>`;

    const enBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#16a34a;">✅ Your ${year} tax return is complete!</h2>
        <p>Hello ${clientName},</p>
        <p>Great news! Your accountant has finished processing your ${year} tax return.</p>
        <p>All your documents have been reviewed and approved. Your file is now complete.</p>
        <p><a href="${loginUrl}" style="background-color:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View my file</a></p>
        <p style="color:#6b7280;font-size:13px;">Thank you for trusting TaxFlowAI!</p>
      </div>`;

    const subject = languagePref === 'fr'
      ? `✅ Votre déclaration ${year} est complète — TaxFlowAI`
      : `✅ Your ${year} tax return is complete — TaxFlowAI`;

    const htmlBody = languagePref === 'fr'
      ? `${frBody}<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">${enBody}`
      : `${enBody}<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">${frBody}`;

    const command = new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [clientEmail] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
      },
    });

    try {
      await sesClient.send(command);
      console.log(`Completion email sent to ${clientEmail}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send completion email to ${clientEmail}:`, msg);
    }
  }

   * @param to - Recipient email address
   * @param subject - Email subject
   * @param htmlBody - HTML body content
   */
  static async sendNotificationEmail(
    to: string,
    subject: string,
    htmlBody: string
  ): Promise<void> {
    const params = {
      Source: process.env.SES_EMAIL || 'notifications@isaloumapps.com',
      Destination: { 
        ToAddresses: [to] 
      },
      Message: {
        Subject: { 
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    try {
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      console.log(`Notification email sent successfully to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send notification email to ${to} with subject "${subject}":`, errorMessage, error);
      throw new Error(`Failed to send notification email to ${to} with subject "${subject}": ${errorMessage}`);
    }
  }
}
