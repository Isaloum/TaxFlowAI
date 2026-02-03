import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
};

export const sendClientInvitationEmail = async (
  clientEmail: string,
  clientName: string,
  temporaryPassword: string,
  accountantFirmName: string,
  languagePref: string
): Promise<void> => {
  const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
  const appName = process.env.APP_NAME || 'TaxSyncQC';

  const frenchSubject = `Bienvenue sur ${appName} - Votre compte a été créé`;
  const englishSubject = `Welcome to ${appName} - Your account has been created`;

  const frenchBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bienvenue sur ${appName}!</h2>
      <p>Bonjour ${clientName},</p>
      <p>Votre comptable de ${accountantFirmName} vous a créé un compte sur ${appName}.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Vos informations de connexion:</h3>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Mot de passe temporaire:</strong> ${temporaryPassword}</p>
      </div>

      <p><strong>⚠️ Important:</strong> Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.</p>
      
      <p>
        <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Se connecter maintenant
        </a>
      </p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Si vous avez des questions, veuillez contacter ${accountantFirmName}.
      </p>
    </div>
  `;

  const englishBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to ${appName}!</h2>
      <p>Hello ${clientName},</p>
      <p>Your accountant from ${accountantFirmName} has created an account for you on ${appName}.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your login credentials:</h3>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Temporary password:</strong> ${temporaryPassword}</p>
      </div>

      <p><strong>⚠️ Important:</strong> For security reasons, you will need to change this password on your first login.</p>
      
      <p>
        <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login now
        </a>
      </p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        If you have any questions, please contact ${accountantFirmName}.
      </p>
    </div>
  `;

  const subject = languagePref === 'fr' ? frenchSubject : englishSubject;
  const htmlBody = languagePref === 'fr' 
    ? `${frenchBody}<hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">${englishBody}`
    : `${englishBody}<hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">${frenchBody}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@taxsyncqc.com',
    to: clientEmail,
    subject,
    html: htmlBody,
  });
};
