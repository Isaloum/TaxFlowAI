import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerAccountant, login, changePassword, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register-accountant', registerAccountant);
router.post('/login', loginLimiter, login);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);
router.post('/forgot-password', loginLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
