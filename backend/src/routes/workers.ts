import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { Worker } from '../models';

const router = Router();

// Validation schemas
const createWorkerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  employee_id: Joi.string().min(3).max(20).required(),
  role: Joi.string().valid('worker', 'supervisor', 'rpo', 'admin').required(),
  annual_limit_mSv: Joi.number().min(0).max(1000).precision(4).required(),
  last_bioassay: Joi.date().optional(),
  is_active: Joi.boolean().default(true),
});

const updateWorkerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  employee_id: Joi.string().min(3).max(20).optional(),
  role: Joi.string().valid('worker', 'supervisor', 'rpo', 'admin').optional(),
  annual_limit_mSv: Joi.number().min(0).max(1000).precision(4).optional(),
  last_bioassay: Joi.date().optional(),
  is_active: Joi.boolean().optional(),
});

// GET /api/workers - List all workers with pagination
router.get('/', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const role = req.query.role as string;
    const isActive = req.query.is_active as string;

    const whereClause: any = {};
    if (role) whereClause.role = role;
    if (isActive !== undefined) whereClause.is_active = isActive === 'true';

    const { count, rows } = await Worker.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    logger.info('Workers list retrieved', { 
      userId: (req as AuthRequest).user?.id,
      count: rows.length,
      total: count,
    });

    res.json({
      success: true,
      data: {
        workers: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving workers:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to retrieve workers',
      },
    });
  }
});

// GET /api/workers/:id - Get single worker
router.get('/:id', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Worker not found',
        },
      });
    }

    logger.info('Worker retrieved', { 
      userId: (req as AuthRequest).user?.id,
      workerId: id,
    });

    res.json({
      success: true,
      data: { worker },
    });
  } catch (error) {
    logger.error('Error retrieving worker:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to retrieve worker',
      },
    });
  }
});

// POST /api/workers - Create new worker
router.post('/', authenticateToken, requireRole(['rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = createWorkerSchema.validate(req.body);
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

    // Check if employee_id already exists
    const existingWorker = await Worker.findOne({
      where: { employee_id: value.employee_id },
    });

    if (existingWorker) {
      return res.status(409).json({
        success: false,
        error: {
          code: 409,
          message: 'Employee ID already exists',
        },
      });
    }

    const worker = await Worker.create(value);

    logger.info('Worker created', { 
      userId: (req as AuthRequest).user?.id,
      workerId: worker.id,
      employeeId: worker.employee_id,
    });

    res.status(201).json({
      success: true,
      data: { worker },
      message: 'Worker created successfully',
    });
  } catch (error) {
    logger.error('Error creating worker:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to create worker',
      },
    });
  }
});

// PUT /api/workers/:id - Update worker
router.put('/:id', authenticateToken, requireRole(['rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = updateWorkerSchema.validate(req.body);
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

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Worker not found',
        },
      });
    }

    // Check if employee_id is being changed and if it already exists
    if (value.employee_id && value.employee_id !== worker.employee_id) {
      const existingWorker = await Worker.findOne({
        where: { employee_id: value.employee_id },
      });

      if (existingWorker) {
        return res.status(409).json({
          success: false,
          error: {
            code: 409,
            message: 'Employee ID already exists',
          },
        });
      }
    }

    await worker.update(value);

    logger.info('Worker updated', { 
      userId: (req as AuthRequest).user?.id,
      workerId: id,
    });

    res.json({
      success: true,
      data: { worker },
      message: 'Worker updated successfully',
    });
  } catch (error) {
    logger.error('Error updating worker:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to update worker',
      },
    });
  }
});

// DELETE /api/workers/:id - Soft delete worker
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Worker not found',
        },
      });
    }

    // Soft delete by setting is_active to false
    await worker.update({ is_active: false });

    logger.info('Worker deactivated', { 
      userId: (req as AuthRequest).user?.id,
      workerId: id,
    });

    res.json({
      success: true,
      message: 'Worker deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deactivating worker:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to deactivate worker',
      },
    });
  }
});

export { router as workerRoutes }; 