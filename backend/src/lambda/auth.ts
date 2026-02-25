import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes';

const app = express();
app.set('trust proxy', 1); // API Gateway sits in front
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/auth', authRoutes);

export const handler = serverless(app);

