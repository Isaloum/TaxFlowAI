import prisma from '../config/database';

// Lazy-init table on first use
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL,
      user_role TEXT NOT NULL,
      token_type TEXT NOT NULL,
      token TEXT NOT NULL,
      p256dh TEXT,
      auth TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, token_type, token)
    );
    CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id, user_role);
  `);
  tableReady = true;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export class PushService {
  // ─── Register / update token ───────────────────────────────────────────────

  static async registerExpoToken(userId: string, userRole: string, token: string) {
    await ensureTable();
    await prisma.$executeRawUnsafe(`
      INSERT INTO push_tokens (user_id, user_role, token_type, token, updated_at)
      VALUES ($1, $2, 'expo', $3, NOW())
      ON CONFLICT (user_id, token_type, token) DO UPDATE SET updated_at = NOW()
    `, userId, userRole, token);
  }

  static async registerWebPush(userId: string, userRole: string, sub: WebPushSubscription) {
    await ensureTable();
    await prisma.$executeRawUnsafe(`
      INSERT INTO push_tokens (user_id, user_role, token_type, token, p256dh, auth, updated_at)
      VALUES ($1, $2, 'web', $3, $4, $5, NOW())
      ON CONFLICT (user_id, token_type, token) DO UPDATE
        SET p256dh = $4, auth = $5, updated_at = NOW()
    `, userId, userRole, sub.endpoint, sub.keys.p256dh, sub.keys.auth);
  }

  static async removeToken(userId: string, token: string) {
    await ensureTable();
    await prisma.$executeRawUnsafe(
      `DELETE FROM push_tokens WHERE user_id = $1 AND token = $2`,
      userId, token
    );
  }

  // ─── Send to all tokens for a user ────────────────────────────────────────

  static async sendToUser(userId: string, userRole: string, title: string, body: string, data: Record<string, string> = {}) {
    await ensureTable();
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM push_tokens WHERE user_id = $1 AND user_role = $2`,
      userId, userRole
    );
    await Promise.allSettled(rows.map(row => {
      if (row.token_type === 'expo') return this.sendExpo(row.token, title, body, data);
      if (row.token_type === 'web')  return this.sendWeb(row, title, body, data);
      return Promise.resolve();
    }));
  }

  // ─── Expo push ─────────────────────────────────────────────────────────────

  private static async sendExpo(token: string, title: string, body: string, data: Record<string, string>) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: token, title, body, data, sound: 'default' }),
    });
    const json = await res.json() as any;
    if (json?.data?.status === 'error') {
      console.error('Expo push error:', json.data.message, 'token:', token);
      // If token is invalid, remove it
      if (json.data.details?.error === 'DeviceNotRegistered') {
        await prisma.$executeRawUnsafe(`DELETE FROM push_tokens WHERE token = $1`, token);
      }
    }
  }

  // ─── Web push ──────────────────────────────────────────────────────────────

  private static async sendWeb(row: any, title: string, body: string, data: Record<string, string>) {
    const vapidPublic  = process.env.VAPID_PUBLIC_KEY  || '';
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY || '';
    const vapidEmail   = process.env.VAPID_EMAIL || 'mailto:notifications@isaloumapps.com';

    if (!vapidPublic || !vapidPrivate) {
      console.warn('VAPID keys not configured, skipping web push');
      return;
    }

    // Use dynamic import to avoid bundling issues
    const webpush = await import('web-push');
    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

    const payload = JSON.stringify({ title, body, data });
    const subscription = { endpoint: row.token, keys: { p256dh: row.p256dh, auth: row.auth } };
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (err: any) {
      console.error('Web push error:', err.statusCode, err.body);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.$executeRawUnsafe(`DELETE FROM push_tokens WHERE token = $1`, row.token);
      }
    }
  }
}
