import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import documentRoutes from '../routes/document.routes';

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/documents', documentRoutes);

export const handler = serverless(app);
