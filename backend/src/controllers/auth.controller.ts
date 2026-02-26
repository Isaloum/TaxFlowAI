import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { SESEmailService } from '../services/ses-email.service';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const registerAccountantSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firmName: z.string().min(1, 'Firm name is required'),
  phone: z.string().min(1, 'Phone is required'),
  languagePref: z.enum(['fr', 'en']).default('fr'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const registerAccountant = async (req: Request, res: Response) => {
  try {
    const validatedData = registerAccountantSchema.parse(req.body);

    const existingAccountant = await prisma.accountant.findUnique({
      where: { email: validatedData.email },
    });

    if (existingAccountant) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    const accountant = await prisma.accountant.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firmName: validatedData.firmName,
        phone: validatedData.phone,
        languagePref: validatedData.languagePref,
      },
    });

    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    const token = jwt.sign(
      {
        sub: accountant.id.toString(),
        email: accountant.email,
        role: 'accountant',
      },
      JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      message: 'Accountant registered successfully',
      token,
      user: {
        id: accountant.id,
        email: accountant.email,
        firmName: accountant.firmName,
        phone: accountant.phone,
        languagePref: accountant.languagePref,
        role: 'accountant',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register accountant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const accountant = await prisma.accountant.findUnique({
      where: { email: validatedData.email },
      select: { id: true, email: true, passwordHash: true, firmName: true, phone: true, languagePref: true },
    });

    if (accountant) {
      const isValidPassword = await bcrypt.compare(validatedData.password, accountant.passwordHash);

      if (isValidPassword) {
        const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
        const token = jwt.sign(
          { sub: accountant.id.toString(), email: accountant.email, role: 'accountant' },
          JWT_SECRET,
          signOptions
        );

        return res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: accountant.id,
            email: accountant.email,
            firmName: accountant.firmName,
            phone: accountant.phone,
            languagePref: accountant.languagePref,
            role: 'accountant',
          },
        });
      }
    }

    const client = await prisma.client.findFirst({
      where: { email: validatedData.email },
      select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true, province: true, phone: true, languagePref: true, isFirstLogin: true },
    });

    if (client) {
      const isValidPassword = await bcrypt.compare(validatedData.password, client.passwordHash);

      if (isValidPassword) {
        const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
        const token = jwt.sign(
          { sub: client.id.toString(), email: client.email, role: 'client' },
          JWT_SECRET,
          signOptions
        );

        return res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: client.id,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            province: client.province,
            phone: client.phone,
            languagePref: client.languagePref,
            isFirstLogin: client.isFirstLogin,
            role: 'client',
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    if (req.user.role === 'accountant') {
      const accountant = await prisma.accountant.findUnique({
        where: { id: req.user.sub },
      });

      if (!accountant) {
        return res.status(404).json({ error: 'Accountant not found' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, accountant.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12);

      await prisma.accountant.update({
        where: { id: req.user.sub },
        data: { passwordHash: newPasswordHash },
      });
    } else if (req.user.role === 'client') {
      const client = await prisma.client.findUnique({
        where: { id: req.user.sub },
        select: { id: true, passwordHash: true },
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, client.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12);

      await prisma.client.update({
        where: { id: req.user.sub },
        data: { 
          passwordHash: newPasswordHash,
          isFirstLogin: false,
        },
      });
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful' });
};

/**
 * POST /auth/forgot-password
 * Sends a password reset link to the user's email (valid 1 hour)
 * Always returns 200 — never reveal whether email exists (security)
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const token = require('crypto').randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Try accountant first, then client
    const accountant = await prisma.accountant.findUnique({ where: { email } });
    if (accountant) {
      await prisma.accountant.update({
        where: { email },
        data: { passwordResetToken: token, passwordResetExpiry: expiry },
      });
      SESEmailService.sendPasswordResetEmail(email, accountant.firmName, token).catch(
        (e) => console.error('[forgot] email error:', e?.message)
      );
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const client = await prisma.client.findUnique({ where: { email } });
    if (client) {
      await prisma.client.update({
        where: { email },
        data: { passwordResetToken: token, passwordResetExpiry: expiry },
      });
      SESEmailService.sendPasswordResetEmail(
        email, `${client.firstName} ${client.lastName}`, token
      ).catch((e) => console.error('[forgot] email error:', e?.message));
    }

    // Always 200 — don't reveal if email exists
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /auth/reset-password
 * Validates the token and sets the new password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const now = new Date();

    // Check accountant
    const accountant = await prisma.accountant.findFirst({
      where: { passwordResetToken: token, passwordResetExpiry: { gt: now } },
    });
    if (accountant) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.accountant.update({
        where: { id: accountant.id },
        data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
      });
      return res.json({ message: 'Password reset successfully. You can now log in.' });
    }

    // Check client
    const client = await prisma.client.findFirst({
      where: { passwordResetToken: token, passwordResetExpiry: { gt: now } },
    });
    if (client) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.client.update({
        where: { id: client.id },
        data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
      });
      return res.json({ message: 'Password reset successfully. You can now log in.' });
    }

    return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};