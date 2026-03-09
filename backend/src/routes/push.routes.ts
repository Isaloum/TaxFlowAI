import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PushService } from '../services/push.service';

const router = Router();

// POST /notifications/push/expo   — register Expo push token
router.post('/expo', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    await PushService.registerExpoToken(req.user!.sub, req.user!.role, token);
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Register expo token error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /notifications/push/web   — register Web Push subscription
router.post('/web', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return res.status(400).json({ error: 'endpoint and keys required' });
    await PushService.registerWebPush(req.user!.sub, req.user!.role, { endpoint, keys });
    res.json({ ok: true });
  } catch (e: any) {
    // Push registration is non-critical — log but don't crash the user's session
    console.warn('Register web push error (non-critical):', e?.message);
    res.json({ ok: true, warn: 'push registration skipped' });
  }
});

// DELETE /notifications/push   — unregister token
router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    await PushService.removeToken(req.user!.sub, token);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /notifications/push/vapid-public — return VAPID public key for web push setup
router.get('/vapid-public', (_req: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY || '';
  if (!key) return res.status(503).json({ error: 'VAPID not configured' });
  res.json({ key });
});

export default router;
