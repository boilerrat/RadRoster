import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models';

const router = Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Generate JWT tokens
const generateTokens = (userId: string, email: string, role: string) => {
  const accessSecret = process.env['JWT_SECRET'];
  const refreshSecret = process.env['JWT_REFRESH_SECRET'];

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(
    { id: userId, email, role },
    accessSecret,
    { expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m' } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign(
    { id: userId, email, role },
    refreshSecret,
    { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d' } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Validation error',
          details: error.details.map(d => d.message),
        },
      });
    }

    const { email, password } = value;

    // Find user in database
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logger.warn('Login attempt with invalid email:', { email });
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'Invalid credentials',
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login attempt for inactive user:', { email });
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'Account is deactivated',
        },
      });
    }

    // Check if user is locked
    if (user.isLocked()) {
      logger.warn('Login attempt for locked user:', { email });
      return res.status(423).json({
        success: false,
        error: {
          code: 423,
          message: 'Account is temporarily locked due to too many failed attempts',
        },
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      user.incrementFailedLoginAttempts();
      await user.save();
      
      logger.warn('Login attempt with invalid password for user:', { email });
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'Invalid credentials',
        },
      });
    }

    // Reset failed login attempts on successful login
    user.resetFailedLoginAttempts();
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    logger.info('User logged in successfully:', { email, role: user.role });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      },
      message: 'Login successful',
    });
      } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Validation error',
          details: error.details.map(d => d.message),
        },
      });
    }

    const { refreshToken } = value;

    // Verify refresh token
    const refreshSecret = process.env['JWT_REFRESH_SECRET'];
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      logger.warn('Token refresh for non-existent or inactive user:', { userId: decoded.id });
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'Invalid refresh token',
        },
      });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.id, decoded.email, decoded.role);

    logger.info('Token refreshed successfully:', { email: decoded.email });

    return res.json({
      success: true,
      data: {
        tokens,
      },
      message: 'Token refreshed successfully',
    });
      } catch (error) {
      logger.warn('Token refresh failed:', error);
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: 'Invalid refresh token',
        },
      });
    }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  // TODO: Implement token blacklisting if needed
  logger.info('User logged out:', { userId: req.user?.id });
  
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Get current user endpoint
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export { router as authRoutes }; 