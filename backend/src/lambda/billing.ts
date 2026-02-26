import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import billingRoutes from '../routes/billing.routes';

const app = express();
app.set('trust proxy', 1);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'https://www.isaloumapps.com,https://isaloumapps.com').split(',').map(o => o.trim());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/billing', billingRoutes);

export const handler = serverless(app);
