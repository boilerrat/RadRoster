import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { Job, Worker } from '../models';

const router = Router();

// Validation schemas
const createJobSchema = Joi.object({
  site: Joi.string().min(2).max(100).required(),
  job_number: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(10).max(1000).required(),
  start_time: Joi.date().required(),
  planned_duration_min: Joi.number().integer().min(1).max(1440).required(),
  supervisor_id: Joi.string().uuid().required(),
  status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled').default('planned'),
});

const updateJobSchema = Joi.object({
  site: Joi.string().min(2).max(100).optional(),
  job_number: Joi.string().min(3).max(20).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  start_time: Joi.date().optional(),
  planned_duration_min: Joi.number().integer().min(1).max(1440).optional(),
  supervisor_id: Joi.string().uuid().optional(),
  status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled').optional(),
});

// GET /api/jobs - List all jobs with pagination
router.get('/', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const site = req.query.site as string;
    const supervisorId = req.query.supervisor_id as string;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (site) whereClause.site = { [require('sequelize').Op.iLike]: `%${site}%` };
    if (supervisorId) whereClause.supervisor_id = supervisorId;

    const { count, rows } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Worker,
          as: 'supervisor',
          attributes: ['id', 'name', 'employee_id'],
        },
      ],
      limit,
      offset,
      order: [['start_time', 'DESC']],
    });

    logger.info('Jobs list retrieved', { 
      userId: (req as AuthRequest).user?.id,
      count: rows.length,
      total: count,
    });

    res.json({
      success: true,
      data: {
        jobs: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving jobs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to retrieve jobs',
      },
    });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: Worker,
          as: 'supervisor',
          attributes: ['id', 'name', 'employee_id'],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Job not found',
        },
      });
    }

    logger.info('Job retrieved', { 
      userId: (req as AuthRequest).user?.id,
      jobId: id,
    });

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    logger.error('Error retrieving job:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to retrieve job',
      },
    });
  }
});

// POST /api/jobs - Create new job
router.post('/', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = createJobSchema.validate(req.body);
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

    // Check if job_number already exists
    const existingJob = await Job.findOne({
      where: { job_number: value.job_number },
    });

    if (existingJob) {
      return res.status(409).json({
        success: false,
        error: {
          code: 409,
          message: 'Job number already exists',
        },
      });
    }

    // Verify supervisor exists and is active
    const supervisor = await Worker.findByPk(value.supervisor_id);
    if (!supervisor || !supervisor.is_active) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Invalid supervisor ID',
        },
      });
    }

    const job = await Job.create(value);

    logger.info('Job created', { 
      userId: (req as AuthRequest).user?.id,
      jobId: job.id,
      jobNumber: job.job_number,
    });

    res.status(201).json({
      success: true,
      data: { job },
      message: 'Job created successfully',
    });
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to create job',
      },
    });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', authenticateToken, requireRole(['supervisor', 'rpo', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = updateJobSchema.validate(req.body);
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

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Job not found',
        },
      });
    }

    // Check if job_number is being changed and if it already exists
    if (value.job_number && value.job_number !== job.job_number) {
      const existingJob = await Job.findOne({
        where: { job_number: value.job_number },
      });

      if (existingJob) {
        return res.status(409).json({
          success: false,
          error: {
            code: 409,
            message: 'Job number already exists',
          },
        });
      }
    }

    // Verify supervisor exists if being changed
    if (value.supervisor_id) {
      const supervisor = await Worker.findByPk(value.supervisor_id);
      if (!supervisor || !supervisor.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Invalid supervisor ID',
          },
        });
      }
    }

    await job.update(value);

    logger.info('Job updated', { 
      userId: (req as AuthRequest).user?.id,
      jobId: id,
    });

    res.json({
      success: true,
      data: { job },
      message: 'Job updated successfully',
    });
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to update job',
      },
    });
  }
});

// DELETE /api/jobs/:id - Delete job (only if no dose entries)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'Job not found',
        },
      });
    }

    // Check if job has dose entries
    const doseEntryCount = await job.countDoseEntries();
    if (doseEntryCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Cannot delete job with existing dose entries',
        },
      });
    }

    await job.destroy();

    logger.info('Job deleted', { 
      userId: (req as AuthRequest).user?.id,
      jobId: id,
    });

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to delete job',
      },
    });
  }
});

export { router as jobRoutes }; 