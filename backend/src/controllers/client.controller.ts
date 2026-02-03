import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  province: z.string().min(1, 'Province is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  languagePref: z.enum(['fr', 'en']).optional(),
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can view their profile' });
    }

    const client = await prisma.client.findUnique({
      where: { id: req.user.sub },
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
        accountant: {
          select: {
            firmName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ client });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can update their profile' });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const updatedClient = await prisma.client.update({
      where: { id: req.user.sub },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        province: true,
        phone: true,
        languagePref: true,
        isFirstLogin: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      client: updatedClient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
