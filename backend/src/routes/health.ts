import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
    },
  });
});

// Detailed health check with database
router.get('/detailed', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        database: 'connected',
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 503,
        message: 'Service unhealthy',
        details: {
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    });
  }
});

export { router as healthRoutes }; 