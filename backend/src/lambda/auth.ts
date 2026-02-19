import serverless from 'serverless-http';
import express from 'express';
import authRoutes from '../routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

export const handler = serverless(app);
