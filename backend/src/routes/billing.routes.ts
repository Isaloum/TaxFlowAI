import { Router, raw } from 'express';
import {
  getBillingStatus,
  createCheckoutSession,
  createPortalSession,
  stripeWebhook,
} from '../controllers/billing.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ── Stripe webhook — raw body required (before JSON middleware) ───────────────
router.post('/webhook', raw({ type: 'application/json' }), stripeWebhook);

// ── Protected accountant-only routes ────────────────────────────────────────
router.get( '/status',   authenticateToken, requireRole('accountant'), getBillingStatus);
router.post('/checkout', authenticateToken, requireRole('accountant'), createCheckoutSession);
router.post('/portal',   authenticateToken, requireRole('accountant'), createPortalSession);

export default router;
