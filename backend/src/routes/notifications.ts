import { Router, Response } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { DeviceToken } from '../models';
import {
  sendPushNotification,
  sendDoseAlert,
  validateDeviceToken,
} from '../services/notificationService';

const router = Router();

// Validation schemas
const registerDeviceSchema = Joi.object({
  deviceToken: Joi.string().required(),
  deviceType: Joi.string().valid('ios', 'android', 'web').default('android'),
});

const testNotificationSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
});

const doseAlertSchema = Joi.object({
  workerId: Joi.string().required(),
  workerName: Joi.string().required(),
  doseValue: Joi.number().positive().required(),
  limit: Joi.number().positive().required(),
  alertType: Joi.string().valid('warning', 'critical', 'exceeded').required(),
});

// Register device token
router.post('/register-device', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Validate input
    const { error, value } = registerDeviceSchema.validate(req.body);
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

    const { deviceToken, deviceType } = value;
    const userId = req.user!.id;

    // Validate the device token with Firebase
    const isValidToken = await validateDeviceToken(deviceToken);
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Invalid device token',
        },
      });
    }

    // Check if device token already exists
    const existingToken = await DeviceToken.findOne({
      where: { deviceToken },
    });

    if (existingToken) {
      // Update existing token
      existingToken.userId = userId;
      existingToken.deviceType = deviceType;
      existingToken.isActive = true;
      existingToken.markAsUsed();
      await existingToken.save();

      logger.info('Device token updated:', { userId, deviceType });
    } else {
      // Create new device token
      await DeviceToken.create({
        userId,
        deviceToken,
        deviceType,
        isActive: true,
        lastUsedAt: new Date(),
      });

      logger.info('Device token registered:', { userId, deviceType });
    }

    return res.json({
      success: true,
      message: 'Device token registered successfully',
    });
      } catch (error) {
      logger.error('Failed to register device token:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

// Unregister device token
router.delete('/unregister-device', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = registerDeviceSchema.validate(req.body);
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

    const { deviceToken } = value;
    const userId = req.user!.id;

    // Find and deactivate the device token
    const deviceTokenRecord = await DeviceToken.findOne({
      where: { deviceToken, userId },
    });

    if (deviceTokenRecord) {
      deviceTokenRecord.deactivate();
      await deviceTokenRecord.save();

      logger.info('Device token unregistered:', { userId });
    }

    return res.json({
      success: true,
      message: 'Device token unregistered successfully',
    });
      } catch (error) {
      logger.error('Failed to unregister device token:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

// Send test notification
router.post('/test', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = testNotificationSchema.validate(req.body);
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

    const { title, body, data } = value;
    const userId = req.user!.id;

    // Get user's active device tokens
    const deviceTokens = await DeviceToken.findAll({
      where: { userId, isActive: true },
    });

    if (deviceTokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'No active device tokens found for user',
        },
      });
    }

    // Send notification to all user's devices
    const results = await Promise.all(
      deviceTokens.map(async (deviceToken) => {
        const success = await sendPushNotification(deviceToken.deviceToken, {
          title,
          body,
          data,
        });

        if (success) {
          deviceToken.markAsUsed();
          await deviceToken.save();
        }

        return { deviceTokenId: deviceToken.id, success };
      }),
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info('Test notification sent:', { userId, successCount, failureCount });

    return res.json({
      success: true,
      data: {
        sentTo: results.length,
        successCount,
        failureCount,
        results,
      },
      message: 'Test notification sent',
    });
      } catch (error) {
      logger.error('Failed to send test notification:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

// Send dose alert notification
router.post('/dose-alert', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = doseAlertSchema.validate(req.body);
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

    const alertData = value;
    const userId = req.user!.id;

    // Get user's active device tokens
    const deviceTokens = await DeviceToken.findAll({
      where: { userId, isActive: true },
    });

    if (deviceTokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: 'No active device tokens found for user',
        },
      });
    }

    // Send dose alert to all user's devices
    const results = await Promise.all(
      deviceTokens.map(async (deviceToken) => {
        const success = await sendDoseAlert(deviceToken.deviceToken, alertData);

        if (success) {
          deviceToken.markAsUsed();
          await deviceToken.save();
        }

        return { deviceTokenId: deviceToken.id, success };
      }),
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info('Dose alert sent:', { userId, alertData, successCount, failureCount });

    return res.json({
      success: true,
      data: {
        sentTo: results.length,
        successCount,
        failureCount,
        results,
      },
      message: 'Dose alert sent',
    });
      } catch (error) {
      logger.error('Failed to send dose alert:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

// Get user's device tokens
router.get('/devices', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const deviceTokens = await DeviceToken.findAll({
      where: { userId },
      attributes: ['id', 'deviceType', 'isActive', 'lastUsedAt', 'createdAt'],
    });

    return res.json({
      success: true,
      data: {
        devices: deviceTokens,
      },
    });
      } catch (error) {
      logger.error('Failed to get device tokens:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    }
});

export { router as notificationRoutes }; 