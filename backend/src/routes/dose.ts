import { Router, Response } from 'express';
import Joi from 'joi';
import { createDoseEntry, getDoseSummary } from '../services/doseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const doseEntrySchema = Joi.object({
  worker_id: Joi.string().uuid().required(),
  job_id: Joi.string().uuid().required(),
  timestamp: Joi.date().max('now').required(),
  dose_mSv: Joi.number().min(0).max(1000).precision(4).required(),
  source_instrument: Joi.string().min(2).max(50).required(),
  instrument_serial: Joi.string().min(3).max(30).required(),
  location: Joi.string().min(2).max(100).required(),
  notes: Joi.string().max(1000).optional(),
});

const doseSummaryParamsSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
});

/**
 * POST /api/dose
 * Create a new dose entry
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body
    const { error, value } = doseEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid dose entry data',
          details: error.details.map(detail => detail.message),
        },
      });
    }

    // Create dose entry
    const doseEntry = await createDoseEntry({
      ...value,
      timestamp: new Date(value.timestamp),
    });

    logger.info('Dose entry created via API', {
      id: doseEntry.id,
      workerId: doseEntry.worker_id,
      jobId: doseEntry.job_id,
      dose: doseEntry.dose_mSv,
      userId: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: doseEntry.id,
        worker_id: doseEntry.worker_id,
        job_id: doseEntry.job_id,
        timestamp: doseEntry.timestamp,
        dose_mSv: doseEntry.dose_mSv,
        source_instrument: doseEntry.source_instrument,
        instrument_serial: doseEntry.instrument_serial,
        location: doseEntry.location,
        notes: doseEntry.notes,
        created_at: doseEntry.created_at,
      },
      message: 'Dose entry created successfully',
    });
  } catch (error) {
    logger.error('Failed to create dose entry via API', { error, body: req.body });
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DOSE_CREATION_ERROR',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create dose entry',
      },
    });
  }
});

/**
 * GET /api/dose/:jobId/summary
 * Get dose summary for a job
 */
router.get('/:jobId/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Validate job ID parameter
    const { error, value } = doseSummaryParamsSchema.validate({ jobId: req.params['jobId'] });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid job ID',
          details: error.details.map(detail => detail.message),
        },
      });
    }

    const { jobId } = value;

    // Get dose summary
    const summary = await getDoseSummary(jobId);

    logger.info('Dose summary retrieved via API', {
      jobId,
      entryCount: summary.entryCount,
      totalDose: summary.totalDose,
      userId: req.user?.id,
    });

    return res.json({
      success: true,
      data: {
        totalDose: summary.totalDose,
        averageDose: summary.averageDose,
        variance: summary.variance,
        forecast: {
          currentDose: summary.forecast.currentDose,
          elapsedTimeMinutes: summary.forecast.elapsedTimeMinutes,
          remainingTimeMinutes: summary.forecast.remainingTimeMinutes,
          forecastEndOfShift: summary.forecast.forecastEndOfShift,
          forecastEndOfJob: summary.forecast.forecastEndOfJob,
          hourlyRate: summary.forecast.hourlyRate,
          isOnTrack: summary.forecast.isOnTrack,
          warnings: summary.forecast.warnings,
        },
        entryCount: summary.entryCount,
        lastEntry: summary.lastEntry,
      },
      message: 'Dose summary retrieved successfully',
    });
  } catch (error) {
    logger.error('Failed to get dose summary via API', { 
      jobId: req.params['jobId'], 
      error 
    });
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DOSE_SUMMARY_ERROR',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get dose summary',
      },
    });
  }
});

/**
 * GET /api/dose/job/:jobId
 * Get all dose entries for a job
 */
router.get('/job/:jobId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Validate job ID parameter
    const { error, value } = doseSummaryParamsSchema.validate({ jobId: req.params['jobId'] });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid job ID',
          details: error.details.map(detail => detail.message),
        },
      });
    }

    const { jobId } = value;

    // Import DoseEntry model
    const { DoseEntry } = await import('../models/DoseEntry');

    // Get dose entries for the job
    const doseEntries = await DoseEntry.findAll({
      where: { job_id: jobId },
      order: [['timestamp', 'DESC']],
      attributes: [
        'id',
        'worker_id',
        'job_id',
        'timestamp',
        'dose_mSv',
        'source_instrument',
        'instrument_serial',
        'location',
        'notes',
        'created_at',
      ],
    });

    logger.info('Dose entries retrieved via API', {
      jobId,
      entryCount: doseEntries.length,
      userId: req.user?.id,
    });

    return res.json({
      success: true,
      data: doseEntries,
      message: 'Dose entries retrieved successfully',
    });
  } catch (error) {
    logger.error('Failed to get dose entries via API', { 
      jobId: req.params['jobId'], 
      error 
    });

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get dose entries',
      },
    });
  }
});

export default router; 