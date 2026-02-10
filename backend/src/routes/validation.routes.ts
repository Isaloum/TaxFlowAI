import express from 'express';
import { ValidationController } from '../controllers/validation.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('client'));

router.get(
  '/tax-years/:year/completeness',
  ValidationController.getCompleteness
);

router.post(
  '/tax-years/:year/validate',
  ValidationController.triggerValidation
);

router.post(
  '/tax-years/:year/update-profile',
  ValidationController.updateProfile
);

export default router;
