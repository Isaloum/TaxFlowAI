import serverless from 'serverless-http';
import express from 'express';
import clientRoutes from '../routes/client.routes';
import accountantRoutes from '../routes/accountant.routes';

const app = express();
app.use(express.json());
app.use('/users/client', clientRoutes);
app.use('/users/accountant', accountantRoutes);

export const handler = serverless(app);
