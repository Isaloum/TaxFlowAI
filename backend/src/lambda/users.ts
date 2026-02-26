import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import clientRoutes from '../routes/client.routes';
import accountantRoutes from '../routes/accountant.routes';

const app = express();
app.set('trust proxy', 1);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'https://www.isaloumapps.com,https://isaloumapps.com').split(',').map(o => o.trim());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use('/users/client', clientRoutes);
app.use('/users/accountant', accountantRoutes);

export const handler = serverless(app);
