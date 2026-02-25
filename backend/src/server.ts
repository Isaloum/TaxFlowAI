import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import accountantRoutes from './routes/accountant.routes';
import clientRoutes from './routes/client.routes';
import documentRoutes from './routes/document.routes';
import validationRoutes from './routes/validation.routes';
import { startDailyDigestCron } from './jobs/daily-digest.cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'TaxFlowAI API is running' });
});

app.use('/api/auth', authRoutes);
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
