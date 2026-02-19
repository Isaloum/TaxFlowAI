import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/auth', authRoutes);

export const handler = serverless(app);
