import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Authorization header takes priority — role-specific token set by api-client
  const authHeader = req.headers['authorization'];
  let token: string | undefined = (authHeader && authHeader.split(' ')[1]) || undefined;

  // 2. Fall back to HttpOnly cookie (used by /auth/me and browser-only flows)
  if (!token) {
    token = (req as any).cookies?.taxflow_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: 'accountant' | 'client' | 'admin';
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: 'accountant' | 'client' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
