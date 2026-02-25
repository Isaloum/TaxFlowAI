import { Router } from 'express';
import { getProfile, updateProfile, getTaxYearCompleteness, updateTaxYearProfile, submitForReview } from '../controllers/client.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('client'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/tax-years/:year/completeness', getTaxYearCompleteness);
router.put('/tax-years/:year/profile', updateTaxYearProfile);
router.post('/tax-years/:year/submit', submitForReview);

export default router;
