import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: 'Access token required',
      },
    });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token:', { token: token.substring(0, 10) + '...' });
    res.status(403).json({
      success: false,
      error: {
        code: 403,
        message: 'Invalid or expired token',
      },
    });
  }
};

export const requireRole = (roles: string[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: 'Authentication required',
      },
    });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: {
        code: 403,
        message: 'Insufficient permissions',
      },
    });
    return;
  }

  next();
}; 