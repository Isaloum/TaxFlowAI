import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';

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

    const passwordHash = await argon2.hash(validatedData.password);

    const accountant = await prisma.accountant.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firmName: validatedData.firmName,
        phone: validatedData.phone,
        languagePref: validatedData.languagePref,
      },
    });

    const token = jwt.sign(
      {
        sub: accountant.id.toString(),
        email: accountant.email,
        role: 'accountant',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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
    });

    if (accountant) {
      const isValidPassword = await argon2.verify(accountant.passwordHash, validatedData.password);

      if (isValidPassword) {
        const token = jwt.sign(
          {
            sub: accountant.id.toString(),
            email: accountant.email,
            role: 'accountant',
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
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

    const client = await prisma.client.findUnique({
      where: { email: validatedData.email },
    });

    if (client) {
      const isValidPassword = await argon2.verify(client.passwordHash, validatedData.password);

      if (isValidPassword) {
        const token = jwt.sign(
          {
            sub: client.id.toString(),
            email: client.email,
            role: 'client',
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
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

      const isValidPassword = await argon2.verify(accountant.passwordHash, validatedData.currentPassword);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newPasswordHash = await argon2.hash(validatedData.newPassword);

      await prisma.accountant.update({
        where: { id: req.user.sub },
        data: { passwordHash: newPasswordHash },
      });
    } else if (req.user.role === 'client') {
      const client = await prisma.client.findUnique({
        where: { id: req.user.sub },
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const isValidPassword = await argon2.verify(client.passwordHash, validatedData.currentPassword);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newPasswordHash = await argon2.hash(validatedData.newPassword);

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