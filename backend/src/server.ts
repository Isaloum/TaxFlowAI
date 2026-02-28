import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import accountantRoutes from './routes/accountant.routes';
import clientRoutes from './routes/client.routes';
import documentRoutes from './routes/document.routes';
import validationRoutes from './routes/validation.routes';
import adminRoutes from './routes/admin.routes';
import billingRoutes from './routes/billing.routes';
import { startDailyDigestCron } from './jobs/daily-digest.cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS_ORIGINS: comma-separated list of allowed origins (takes priority)
// e.g. CORS_ORIGINS=https://isaloumapps.com,https://www.isaloumapps.com
const ALLOWED_ORIGINS = (() => {
  const origins = new Set<string>(['http://localhost:3000', 'http://localhost:4000']);

  // Add all explicitly listed origins (CORS_ORIGINS or ALLOWED_ORIGIN from SAM)
  const explicit = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGIN || '';
  explicit.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o));

  // Also derive from FRONTEND_URL — add both www and non-www
  const base = FRONTEND_URL.replace(/\/$/, '');
  origins.add(base);
  if (base.startsWith('https://www.')) {
    origins.add(base.replace('https://www.', 'https://'));
  } else if (base.startsWith('https://')) {
    origins.add(base.replace('https://', 'https://www.'));
  }

  return [...origins];
})();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server / mobile
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Global: 200 requests per 15 min per IP (auth routes have their own stricter limiter)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(globalLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'TaxFlowAI API is running' });
});

// Version endpoint — returns deploy timestamp so frontend can detect new deploys
app.get('/api/version', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ version: process.env.DEPLOY_VERSION || process.env.AWS_LAMBDA_FUNCTION_VERSION || 'dev' });
});

app.use('/api/auth',    authRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/accountant', accountantRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/client', documentRoutes);
app.use('/api/client', validationRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TaxFlowAI API server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
  
  // Start cron jobs
  startDailyDigestCron();
  console.log('⏰ Daily digest cron job started');
});

export default app;
