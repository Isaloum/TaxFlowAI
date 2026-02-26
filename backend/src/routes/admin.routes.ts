import { Router } from 'express';
import { adminLogin, getStats, getAccountants, deleteAccountant } from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public: admin login
router.post('/login', adminLogin);

// Protected: admin only
router.get('/stats',        authenticateToken, requireRole('admin'), getStats);
router.get('/accountants',  authenticateToken, requireRole('admin'), getAccountants);
router.delete('/accountants/:id', authenticateToken, requireRole('admin'), deleteAccountant);

export default router;
