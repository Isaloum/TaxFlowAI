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

export const getTaxYearCompleteness = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Clients only' });
    }

    const clientId = req.user.sub;
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { province: true },
    });

    let taxYear = await prisma.taxYear.findFirst({
      where: { clientId, year },
      include: { documents: true, validations: true },
    });

    if (!taxYear) {
      taxYear = await prisma.taxYear.create({
        data: { clientId, year },
        include: { documents: true, validations: true },
      });
    }

    return res.json({
      taxYear,
      province: client?.province || 'QC',
      completenessScore: taxYear.completenessScore,
      documents: taxYear.documents.map((d) => ({
        id: d.id,
        docType: d.docType,
        filename: d.originalFilename,
        uploadedAt: d.uploadedAt,
        reviewStatus: d.reviewStatus,
      })),
    });
  } catch (error) {
    console.error('Get completeness error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaxYearProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Clients only' });
    }

    const clientId = req.user.sub;
    const year = parseInt(req.params.year);
    const { profile } = req.body;

    if (isNaN(year) || !profile) {
      return res.status(400).json({ error: 'Invalid year or profile data' });
    }

    let taxYear = await prisma.taxYear.findFirst({
      where: { clientId, year },
    });

    if (!taxYear) {
      taxYear = await prisma.taxYear.create({
        data: { clientId, year, profile },
      });
    } else {
      taxYear = await prisma.taxYear.update({
        where: { id: taxYear.id },
        data: { profile },
      });
    }

    return res.json({ message: 'Profile saved', taxYear });
  } catch (error) {
    console.error('Update tax year profile error:', error);
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
