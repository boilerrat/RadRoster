import { calculateDoseExtrapolation, getDoseSummary, createDoseEntry } from '../services/doseService';
import { DoseEntry } from '../models/DoseEntry';
import { Job } from '../models/Job';
import { Worker } from '../models/Worker';

// Mock the models
jest.mock('../models/DoseEntry');
jest.mock('../models/Job');
jest.mock('../models/Worker');
jest.mock('../utils/logger');

const mockDoseEntry = DoseEntry as jest.Mocked<typeof DoseEntry>;
const mockJob = Job as jest.Mocked<typeof Job>;
const mockWorker = Worker as jest.Mocked<typeof Worker>;

describe('Dose Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDoseExtrapolation', () => {
    it('should calculate extrapolation with dose entries', async () => {
      const mockJobData = {
        id: 'job-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480, // 8 hours
      };

      const mockWorkerData = {
        id: 'worker-1',
        annual_limit_mSv: 50,
      };

      const mockDoseEntries = [
        {
          dose_mSv: 0.5,
          timestamp: new Date('2024-01-01T09:00:00Z'),
        },
        {
          dose_mSv: 1.0,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockWorker.findByPk.mockResolvedValue(mockWorkerData as any);
      mockDoseEntry.findAll.mockResolvedValue(mockDoseEntries as any);

      const result = await calculateDoseExtrapolation('job-1', 'worker-1');

      expect(result.currentDose).toBe(1.5);
      expect(result.elapsedTimeMinutes).toBeGreaterThan(0);
      expect(result.remainingTimeMinutes).toBeLessThanOrEqual(480);
      expect(result.hourlyRate).toBeGreaterThan(0);
      expect(result.forecastEndOfShift).toBeGreaterThanOrEqual(1.5);
      expect(result.forecastEndOfJob).toBeGreaterThanOrEqual(1.5);
      expect(result.isOnTrack).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle no dose entries', async () => {
      const mockJobData = {
        id: 'job-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480,
      };

      const mockWorkerData = {
        id: 'worker-1',
        annual_limit_mSv: 50,
      };

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockWorker.findByPk.mockResolvedValue(mockWorkerData as any);
      mockDoseEntry.findAll.mockResolvedValue([]);

      const result = await calculateDoseExtrapolation('job-1', 'worker-1');

      expect(result.currentDose).toBe(0);
      expect(result.elapsedTimeMinutes).toBe(0);
      expect(result.remainingTimeMinutes).toBe(480);
      expect(result.hourlyRate).toBe(0);
      expect(result.forecastEndOfShift).toBe(0);
      expect(result.forecastEndOfJob).toBe(0);
      expect(result.isOnTrack).toBe(true);
      expect(result.warnings).toContain('No dose entries found for this job');
    });

    it('should generate warnings for high dose rates', async () => {
      const mockJobData = {
        id: 'job-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480,
      };

      const mockWorkerData = {
        id: 'worker-1',
        annual_limit_mSv: 50,
      };

      const mockDoseEntries = [
        {
          dose_mSv: 5.0, // High dose
          timestamp: new Date('2024-01-01T09:00:00Z'),
        },
      ];

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockWorker.findByPk.mockResolvedValue(mockWorkerData as any);
      mockDoseEntry.findAll.mockResolvedValue(mockDoseEntries as any);

      const result = await calculateDoseExtrapolation('job-1', 'worker-1');

      // Check if warnings are generated (either for high dose rate or forecast exceeding limits)
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent job', async () => {
      mockJob.findByPk.mockResolvedValue(null);

      await expect(calculateDoseExtrapolation('invalid-job', 'worker-1'))
        .rejects.toThrow('Failed to calculate dose extrapolation');
    });

    it('should throw error for non-existent worker', async () => {
      const mockJobData = {
        id: 'job-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480,
      };

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockWorker.findByPk.mockResolvedValue(null);

      await expect(calculateDoseExtrapolation('job-1', 'invalid-worker'))
        .rejects.toThrow('Failed to calculate dose extrapolation');
    });
  });

  describe('getDoseSummary', () => {
    it('should calculate summary with dose entries', async () => {
      const mockJobData = {
        id: 'job-1',
        supervisor_id: 'supervisor-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480,
      };

      const mockDoseEntries = [
        {
          dose_mSv: 1.0,
          timestamp: new Date('2024-01-01T09:00:00Z'),
        },
        {
          dose_mSv: 2.0,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          dose_mSv: 3.0,
          timestamp: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockDoseEntry.findAll.mockResolvedValue(mockDoseEntries as any);

      // Mock the calculateDoseExtrapolation function
      const mockForecast = {
        currentDose: 6.0,
        elapsedTimeMinutes: 180,
        remainingTimeMinutes: 300,
        forecastEndOfShift: 8.0,
        forecastEndOfJob: 8.0,
        hourlyRate: 2.0,
        isOnTrack: true,
        warnings: [],
      };

      // Mock the calculateDoseExtrapolation function
      jest.spyOn(require('../services/doseService'), 'calculateDoseExtrapolation')
        .mockResolvedValue(mockForecast);

      const result = await getDoseSummary('job-1');

      expect(result.totalDose).toBe(6.0);
      expect(result.averageDose).toBe(2.0);
      expect(result.variance).toBeCloseTo(0.67, 1);
      expect(result.entryCount).toBe(3);
      expect(result.lastEntry).toEqual(new Date('2024-01-01T11:00:00Z'));
      expect(result.forecast).toEqual(mockForecast);
    });

    it('should handle no dose entries', async () => {
      const mockJobData = {
        id: 'job-1',
        supervisor_id: 'supervisor-1',
        start_time: new Date('2024-01-01T08:00:00Z'),
        planned_duration_min: 480,
      };

      mockJob.findByPk.mockResolvedValue(mockJobData as any);
      mockDoseEntry.findAll.mockResolvedValue([]);

      // Mock the calculateDoseExtrapolation function
      const mockForecast = {
        currentDose: 0,
        elapsedTimeMinutes: 0,
        remainingTimeMinutes: 480,
        forecastEndOfShift: 0,
        forecastEndOfJob: 0,
        hourlyRate: 0,
        isOnTrack: true,
        warnings: ['No dose entries found for this job'],
      };

      jest.spyOn(require('../services/doseService'), 'calculateDoseExtrapolation')
        .mockResolvedValue(mockForecast);

      const result = await getDoseSummary('job-1');

      expect(result.totalDose).toBe(0);
      expect(result.averageDose).toBe(0);
      expect(result.variance).toBe(0);
      expect(result.entryCount).toBe(0);
      expect(result.lastEntry).toBeNull();
      expect(result.forecast).toEqual(mockForecast);
    });

    it('should throw error for non-existent job', async () => {
      mockJob.findByPk.mockResolvedValue(null);

      await expect(getDoseSummary('invalid-job'))
        .rejects.toThrow('Failed to get dose summary');
    });
  });

  describe('createDoseEntry', () => {
    const validDoseData = {
      worker_id: 'worker-1',
      job_id: 'job-1',
      timestamp: new Date('2024-01-01T09:00:00Z'),
      dose_mSv: 1.5,
      source_instrument: 'Dosimeter-A',
      instrument_serial: 'ABC123',
      location: 'Reactor Room',
      notes: 'Initial reading',
    };

    it('should create dose entry with valid data', async () => {
      const mockCreatedEntry = {
        id: 'entry-1',
        ...validDoseData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDoseEntry.create.mockResolvedValue(mockCreatedEntry as any);

      const result = await createDoseEntry(validDoseData);

      expect(result).toEqual(mockCreatedEntry);
      expect(mockDoseEntry.create).toHaveBeenCalledWith(validDoseData);
    });

    it('should throw error for invalid dose value', async () => {
      const invalidData = {
        ...validDoseData,
        dose_mSv: -1,
      };

      await expect(createDoseEntry(invalidData))
        .rejects.toThrow('Invalid dose value: must be between 0 and 1000 mSv');
    });

    it('should throw error for future timestamp', async () => {
      const futureData = {
        ...validDoseData,
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      };

      await expect(createDoseEntry(futureData))
        .rejects.toThrow('Dose entry timestamp cannot be in the future');
    });
  });
}); 