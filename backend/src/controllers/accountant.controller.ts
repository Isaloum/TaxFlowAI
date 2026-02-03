import { Request, Response } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import prisma from '../config/database';
import { generateTemporaryPassword, sendClientInvitationEmail } from '../services/email.service';

const createClientSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  province: z.string().min(1, 'Province is required'),
  phone: z.string().min(1, 'Phone is required'),
  languagePref: z.enum(['fr', 'en']).default('fr'),
});

export const createClient = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can create clients' });
    }

    const validatedData = createClientSchema.parse(req.body);

    const existingClient = await prisma.client.findUnique({
      where: { email: validatedData.email },
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const accountant = await prisma.accountant.findUnique({
      where: { id: req.user.sub },
    });

    if (!accountant) {
      return res.status(404).json({ error: 'Accountant not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await argon2.hash(temporaryPassword);

    const client = await prisma.client.create({
      data: {
        accountantId: req.user.sub,
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        province: validatedData.province,
        phone: validatedData.phone,
        languagePref: validatedData.languagePref,
        isFirstLogin: true,
      },
    });

    try {
      await sendClientInvitationEmail(
        client.email,
        `${client.firstName} ${client.lastName}`,
        temporaryPassword,
        accountant.firmName,
        client.languagePref
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        province: client.province,
        phone: client.phone,
        languagePref: client.languagePref,
        isFirstLogin: client.isFirstLogin,
        createdAt: client.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view clients' });
    }

    const clients = await prisma.client.findMany({
      where: { accountantId: req.user.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        province: true,
        phone: true,
        languagePref: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view client details' });
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        accountantId: req.user.sub,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        province: true,
        phone: true,
        languagePref: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ client });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can delete clients' });
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        accountantId: req.user.sub,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
