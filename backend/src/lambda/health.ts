import serverless from 'serverless-http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import prisma from '../config/database';

const app = express();
// CORS: Using wildcard for health checks as they contain non-sensitive status information
// For production APIs with sensitive data, restrict to specific origins
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check endpoint for database connectivity
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    // Test database connection by executing a simple query
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    // Get database connection info (without sensitive data)
    const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
    
    // Safely extract version info
    if (!result || result.length === 0) {
      throw new Error('No version information returned from database');
    }
    
    const dbVersion = result[0]?.version || 'Unknown';
    
    // Extract PostgreSQL version safely
    const versionParts = dbVersion.split(' ');
    const safeVersion = versionParts.length >= 2 
      ? versionParts.slice(0, 2).join(' ')
      : dbVersion;

    res.status(200).json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        version: safeVersion,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// General health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'taxflowai-backend',
    timestamp: new Date().toISOString(),
  });
});

export const handler = serverless(app);
