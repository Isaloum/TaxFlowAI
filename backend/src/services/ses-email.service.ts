import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

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

  /**
   * Send a generic notification email
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
