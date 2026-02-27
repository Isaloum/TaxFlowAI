import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Ensure admins table exists (self-healing for first deploy)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).catch(() => {});

    // Auto-seed default admin on very first login if no admins exist yet
    const adminCount = await prisma.admin.count().catch(() => 0);
    if (adminCount === 0) {
      const defaultEmail    = process.env.ADMIN_EMAIL    || 'admin@isaloumapps.com';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
      const hash = await bcrypt.hash(defaultPassword, 12);
      await prisma.admin.create({ data: { email: defaultEmail, passwordHash: hash } }).catch(() => {});
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      signOptions
    );

    res.cookie('taxflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ message: 'Login successful', token, user: { id: admin.id, email: admin.email, role: 'admin' } });
  } catch (error: any) {
    console.error('Admin login error:', error);
    // Temporary: return actual error so we can diagnose
    res.status(500).json({
      error: 'Internal server error',
      detail: error?.message || String(error),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Platform-wide stats
// ─────────────────────────────────────────────────────────────────────────────
export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      totalAccountants,
      totalClients,
      totalDocuments,
      totalTaxYears,
      completedTaxYears,
      submittedTaxYears,
    ] = await Promise.all([
      prisma.accountant.count(),
      prisma.client.count(),
      prisma.document.count(),
      prisma.taxYear.count(),
      prisma.taxYear.count({ where: { status: 'completed' } }),
      prisma.taxYear.count({ where: { status: 'submitted' } }),
    ]);

    res.json({
      totalAccountants,
      totalClients,
      totalDocuments,
      totalTaxYears,
      completedTaxYears,
      submittedTaxYears,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/accountants
// All accountants with client counts + activity
// ─────────────────────────────────────────────────────────────────────────────
export const getAccountants = async (req: Request, res: Response) => {
  try {
    const accountants = await prisma.accountant.findMany({
      select: {
        id: true,
        email: true,
        firmName: true,
        phone: true,
        languagePref: true,
        createdAt: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            province: true,
            createdAt: true,
            taxYears: {
              orderBy: { year: 'desc' },
              take: 1,
              select: {
                year: true,
                status: true,
                completenessScore: true,
                submittedAt: true,
                documents: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = accountants.map((acct) => ({
      id: acct.id,
      email: acct.email,
      firmName: acct.firmName,
      phone: acct.phone,
      languagePref: acct.languagePref,
      createdAt: acct.createdAt,
      subscriptionStatus: acct.subscriptionStatus,
      trialEndsAt: acct.trialEndsAt,
      currentPeriodEnd: acct.currentPeriodEnd,
      clientCount: acct.clients.length,
      clients: acct.clients.map((c) => {
        const latest = c.taxYears[0];
        return {
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          province: c.province,
          createdAt: c.createdAt,
          latestYear: latest?.year ?? null,
          status: latest?.status ?? 'no_data',
          completenessScore: latest?.completenessScore ?? 0,
          documentCount: latest?.documents.length ?? 0,
          submittedAt: latest?.submittedAt ?? null,
        };
      }),
    }));

    res.json({ accountants: result });
  } catch (error) {
    console.error('Admin get accountants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/accountants/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAccountant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exists = await prisma.accountant.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Accountant not found' });

    // Clear reviewed_by FK using Prisma ORM (PgBouncer-safe, no raw SQL)
    await prisma.document.updateMany({ where: { reviewedBy: id }, data: { reviewedBy: null } });
    await prisma.accountant.delete({ where: { id }, select: { id: true } });

    res.json({ message: 'Accountant deleted' });
  } catch (error: any) {
    console.error('Admin delete accountant error:', error);
    res.status(500).json({ error: 'Internal server error', detail: error?.message || String(error), step: (error as any)._step });
  }
};
