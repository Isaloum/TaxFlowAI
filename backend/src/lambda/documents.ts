import serverless from 'serverless-http';
import express from 'express';
import documentRoutes from '../routes/document.routes';

const app = express();
app.use(express.json());
app.use('/documents', documentRoutes);

export const handler = serverless(app);
