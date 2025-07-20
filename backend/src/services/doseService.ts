import { DoseEntry } from '../models/DoseEntry';
import { Job } from '../models/Job';
import { Worker } from '../models/Worker';
import { logger } from '../utils/logger';

export interface DoseExtrapolationResult {
  currentDose: number;
  elapsedTimeMinutes: number;
  remainingTimeMinutes: number;
  forecastEndOfShift: number;
  forecastEndOfJob: number;
  hourlyRate: number;
  isOnTrack: boolean;
  warnings: string[];
}

export interface DoseSummary {
  totalDose: number;
  averageDose: number;
  variance: number;
  forecast: DoseExtrapolationResult;
  entryCount: number;
  lastEntry: Date | null;
}

/**
 * Calculate dose extrapolation for forecasting end-of-shift and end-of-job doses
 * @param jobId - The job ID to analyze
 * @param workerId - The worker ID to analyze
 * @returns Extrapolation result with forecasts and warnings
 */
export const calculateDoseExtrapolation = async (
  jobId: string,
  workerId: string
): Promise<DoseExtrapolationResult> => {
  try {
    // Get job details
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Get worker details for limits
    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      throw new Error('Worker not found');
    }

    // Get all dose entries for this worker and job
    const doseEntries = await DoseEntry.findAll({
      where: {
        worker_id: workerId,
        job_id: jobId,
      },
      order: [['timestamp', 'ASC']],
    });

    if (doseEntries.length === 0) {
      return {
        currentDose: 0,
        elapsedTimeMinutes: 0,
        remainingTimeMinutes: job.planned_duration_min,
        forecastEndOfShift: 0,
        forecastEndOfJob: 0,
        hourlyRate: 0,
        isOnTrack: true,
        warnings: ['No dose entries found for this job'],
      };
    }

    // Calculate current cumulative dose
    const currentDose = doseEntries.reduce((sum, entry) => sum + Number(entry.dose_mSv), 0);

    // Calculate elapsed time
    const now = new Date();
    const elapsedTimeMinutes = Math.max(0, (now.getTime() - job.start_time.getTime()) / (1000 * 60));
    const remainingTimeMinutes = Math.max(0, job.planned_duration_min - elapsedTimeMinutes);

    // Calculate hourly dose rate
    const hourlyRate = elapsedTimeMinutes > 0 ? (currentDose / elapsedTimeMinutes) * 60 : 0;

    // Forecast end-of-shift dose (8-hour shift)
    const shiftDurationMinutes = 8 * 60; // 8 hours
    const shiftElapsedMinutes = Math.min(elapsedTimeMinutes, shiftDurationMinutes);
    const shiftRemainingMinutes = Math.max(0, shiftDurationMinutes - shiftElapsedMinutes);
    const forecastEndOfShift = currentDose + (hourlyRate / 60) * shiftRemainingMinutes;

    // Forecast end-of-job dose
    const forecastEndOfJob = currentDose + (hourlyRate / 60) * remainingTimeMinutes;

    // Generate warnings
    const warnings: string[] = [];
    
    // Check against worker's annual limit
    if (forecastEndOfJob > worker.annual_limit_mSv * 0.1) { // 10% of annual limit
      warnings.push(`Forecast exceeds 10% of annual limit (${worker.annual_limit_mSv} mSv)`);
    }

    // Check for high dose rates
    if (hourlyRate > 2.0) { // 2 mSv/hour threshold
      warnings.push(`High dose rate detected: ${hourlyRate.toFixed(2)} mSv/hour`);
    }

    // Check if on track for job completion
    const isOnTrack = forecastEndOfJob <= worker.annual_limit_mSv * 0.2; // 20% of annual limit

    return {
      currentDose: Number(currentDose.toFixed(4)),
      elapsedTimeMinutes: Math.round(elapsedTimeMinutes),
      remainingTimeMinutes: Math.round(remainingTimeMinutes),
      forecastEndOfShift: Number(forecastEndOfShift.toFixed(4)),
      forecastEndOfJob: Number(forecastEndOfJob.toFixed(4)),
      hourlyRate: Number(hourlyRate.toFixed(4)),
      isOnTrack,
      warnings,
    };
  } catch (error) {
    logger.error('Error calculating dose extrapolation', { jobId, workerId, error });
    throw new Error('Failed to calculate dose extrapolation');
  }
};

/**
 * Get dose summary for a job
 * @param jobId - The job ID to get summary for
 * @returns Dose summary with statistics and forecast
 */
export const getDoseSummary = async (jobId: string): Promise<DoseSummary> => {
  try {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const doseEntries = await DoseEntry.findAll({
      where: { job_id: jobId },
      order: [['timestamp', 'ASC']],
    });

    if (doseEntries.length === 0) {
      return {
        totalDose: 0,
        averageDose: 0,
        variance: 0,
        forecast: await calculateDoseExtrapolation(jobId, job.supervisor_id),
        entryCount: 0,
        lastEntry: null,
      };
    }

    // Calculate statistics
    const doses = doseEntries.map(entry => Number(entry.dose_mSv));
    const totalDose = doses.reduce((sum, dose) => sum + dose, 0);
    const averageDose = totalDose / doses.length;
    
    // Calculate variance
    const variance = doses.reduce((sum, dose) => sum + Math.pow(dose - averageDose, 2), 0) / doses.length;

    // Get forecast for supervisor
    const forecast = await calculateDoseExtrapolation(jobId, job.supervisor_id);

    return {
      totalDose: Number(totalDose.toFixed(4)),
      averageDose: Number(averageDose.toFixed(4)),
      variance: Number(variance.toFixed(4)),
      forecast,
      entryCount: doseEntries.length,
              lastEntry: doseEntries[doseEntries.length - 1]?.timestamp || null,
    };
  } catch (error) {
    logger.error('Error getting dose summary', { jobId, error });
    throw new Error('Failed to get dose summary');
  }
};

/**
 * Create a new dose entry
 * @param doseData - The dose entry data
 * @returns The created dose entry
 */
export const createDoseEntry = async (doseData: {
  worker_id: string;
  job_id: string;
  timestamp: Date;
  dose_mSv: number;
  source_instrument: string;
  instrument_serial: string;
  location: string;
  notes?: string;
}): Promise<DoseEntry> => {
  try {
    // Validate dose value
    if (doseData.dose_mSv < 0 || doseData.dose_mSv > 1000) {
      throw new Error('Invalid dose value: must be between 0 and 1000 mSv');
    }

    // Validate timestamp is not in the future
    if (doseData.timestamp > new Date()) {
      throw new Error('Dose entry timestamp cannot be in the future');
    }

    // Log for audit trail
    logger.info('Creating dose entry', {
      workerId: doseData.worker_id,
      jobId: doseData.job_id,
      dose: doseData.dose_mSv,
      timestamp: doseData.timestamp,
    });

    const doseEntry = await DoseEntry.create(doseData);
    
    // Log successful creation
    logger.info('Dose entry created successfully', {
      id: doseEntry.id,
      workerId: doseEntry.worker_id,
      dose: doseEntry.dose_mSv,
    });

    return doseEntry;
  } catch (error) {
    logger.error('Failed to create dose entry', { doseData, error });
    throw error;
  }
}; 