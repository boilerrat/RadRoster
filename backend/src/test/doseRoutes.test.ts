import request from 'supertest';
import express from 'express';
import doseRoutes from '../routes/dose';

// Mock the dose service
jest.mock('../services/doseService', () => ({
  createDoseEntry: jest.fn(),
  getDoseSummary: jest.fn(),
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user', role: 'supervisor' };
    next();
  },
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock DoseEntry model
jest.mock('../models/DoseEntry', () => ({
  DoseEntry: {
    findAll: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/dose', doseRoutes);

describe('Dose Routes', () => {
  const mockDoseService = require('../services/doseService');
  const mockDoseEntry = require('../models/DoseEntry').DoseEntry;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dose/:jobId/summary', () => {
    it('should return dose summary for valid job ID', async () => {
      const mockSummary = {
        totalDose: 5.5,
        averageDose: 1.83,
        variance: 0.67,
        forecast: {
          currentDose: 5.5,
          elapsedTimeMinutes: 180,
          remainingTimeMinutes: 300,
          forecastEndOfShift: 7.5,
          forecastEndOfJob: 8.0,
          hourlyRate: 1.83,
          isOnTrack: true,
          warnings: [],
        },
        entryCount: 3,
        lastEntry: new Date('2024-01-01T11:00:00Z'),
      };

      mockDoseService.getDoseSummary.mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/api/dose/550e8400-e29b-41d4-a716-446655440000/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDose).toBe(5.5);
      expect(response.body.data.averageDose).toBe(1.83);
      expect(response.body.data.variance).toBe(0.67);
      expect(response.body.data.entryCount).toBe(3);
      expect(response.body.data.forecast).toEqual(mockSummary.forecast);
      expect(mockDoseService.getDoseSummary).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return 400 for invalid job ID format', async () => {
      const response = await request(app)
        .get('/api/dose/invalid-job-id/summary')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid job ID');
    });

    it('should return 400 when dose service throws error', async () => {
      mockDoseService.getDoseSummary.mockRejectedValue(new Error('Job not found'));

      const response = await request(app)
        .get('/api/dose/550e8400-e29b-41d4-a716-446655440000/summary')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DOSE_SUMMARY_ERROR');
      expect(response.body.error.message).toBe('Job not found');
    });

    it('should return 500 for unexpected errors', async () => {
      mockDoseService.getDoseSummary.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/dose/550e8400-e29b-41d4-a716-446655440000/summary')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toBe('Failed to get dose summary');
    });
  });

  describe('GET /api/dose/job/:jobId', () => {
    it('should return dose entries for valid job ID', async () => {
      const mockDoseEntries = [
        {
          id: 'entry-1',
          worker_id: 'worker-1',
          job_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: new Date('2024-01-01T09:00:00Z'),
          dose_mSv: 1.0,
          source_instrument: 'Dosimeter-A',
          instrument_serial: 'ABC123',
          location: 'Reactor Room',
          notes: 'Initial reading',
        },
        {
          id: 'entry-2',
          worker_id: 'worker-1',
          job_id: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          dose_mSv: 2.0,
          source_instrument: 'Dosimeter-A',
          instrument_serial: 'ABC123',
          location: 'Reactor Room',
          notes: 'Mid-shift reading',
        },
      ];

      mockDoseEntry.findAll.mockResolvedValue(mockDoseEntries);

      const response = await request(app)
        .get('/api/dose/job/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].dose_mSv).toBe(1.0);
      expect(response.body.data[1].dose_mSv).toBe(2.0);
    });

    it('should return 400 for invalid job ID format', async () => {
      const response = await request(app)
        .get('/api/dose/job/invalid-job-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid job ID');
    });
  });

  describe('POST /api/dose', () => {
    const validDoseEntry = {
      worker_id: '550e8400-e29b-41d4-a716-446655440001',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-01-01T09:00:00Z',
      dose_mSv: 1.5,
      source_instrument: 'Dosimeter-A',
      instrument_serial: 'ABC123',
      location: 'Reactor Room',
      notes: 'Initial reading',
    };

    it('should create dose entry with valid data', async () => {
      const mockCreatedEntry = {
        id: 'entry-1',
        ...validDoseEntry,
        created_at: new Date(),
      };

      mockDoseService.createDoseEntry.mockResolvedValue(mockCreatedEntry);

      const response = await request(app)
        .post('/api/dose')
        .send(validDoseEntry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.worker_id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(response.body.data.job_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(response.body.data.dose_mSv).toBe(1.5);
      expect(mockDoseService.createDoseEntry).toHaveBeenCalledWith({
        ...validDoseEntry,
        timestamp: new Date(validDoseEntry.timestamp),
      });
    });

    it('should return 400 for invalid dose value', async () => {
      const invalidEntry = {
        ...validDoseEntry,
        dose_mSv: -1, // Invalid negative dose
      };

      const response = await request(app)
        .post('/api/dose')
        .send(invalidEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteEntry = {
        worker_id: '550e8400-e29b-41d4-a716-446655440001',
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/dose')
        .send(incompleteEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when dose service throws error', async () => {
      mockDoseService.createDoseEntry.mockRejectedValue(new Error('Invalid dose value'));

      const response = await request(app)
        .post('/api/dose')
        .send(validDoseEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DOSE_CREATION_ERROR');
      expect(response.body.error.message).toBe('Invalid dose value');
    });
  });
}); 