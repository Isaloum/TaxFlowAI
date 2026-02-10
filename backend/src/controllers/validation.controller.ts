import { Request, Response } from 'express';
import prisma from '../config/database';
import { RulesEngineService } from '../services/rules/rules-engine.service';

export class ValidationController {
  /**
   * GET /api/client/tax-years/:year/completeness
   * Get completeness status for a tax year
   */
  static async getCompleteness(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const year = parseInt(req.params.year);

      const taxYear = await prisma.taxYear.findUnique({
        where: { clientId_year: { clientId, year } },
        include: {
          documents: {
            select: {
              id: true,
              docType: true,
              docSubtype: true,
              extractionStatus: true,
              uploadedAt: true
            }
          },
          validations: {
            orderBy: { checkedAt: 'desc' }
          }
        }
      });

      if (!taxYear) {
        return res.status(404).json({ error: 'Tax year not found' });
      }

      res.json({
        year: taxYear.year,
        status: taxYear.status,
        completenessScore: taxYear.completenessScore,
        documentsUploaded: taxYear.documents.length,
        validations: taxYear.validations,
        lastChecked: taxYear.validations[0]?.checkedAt || null
      });
    } catch (error: any) {
      console.error('Completeness check error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/client/tax-years/:year/validate
   * Manually trigger validation
   */
  static async triggerValidation(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const year = parseInt(req.params.year);

      const taxYear = await prisma.taxYear.findUnique({
        where: { clientId_year: { clientId, year } }
      });

      if (!taxYear) {
        return res.status(404).json({ error: 'Tax year not found' });
      }

      // Run validation
      const result = await RulesEngineService.validateTaxYear(taxYear.id);

      res.json(result);
    } catch (error: any) {
      console.error('Validation error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/client/tax-years/:year/update-profile
   * Update tax year profile (income types, deductions, etc.)
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const year = parseInt(req.params.year);
      const profile = req.body;

      let taxYear = await prisma.taxYear.findUnique({
        where: { clientId_year: { clientId, year } }
      });

      if (!taxYear) {
        // Create tax year if doesn't exist
        taxYear = await prisma.taxYear.create({
          data: { clientId, year, profile, status: 'draft' }
        });
      } else {
        // Update profile
        taxYear = await prisma.taxYear.update({
          where: { id: taxYear.id },
          data: { profile }
        });
      }

      // Re-validate with new profile
      await RulesEngineService.validateTaxYear(taxYear.id);

      res.json({ taxYear, message: 'Profile updated and validated' });
    } catch (error: any) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
