import admin from '../config/firebase';
import { logger } from '../utils/logger';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface DoseAlertData {
  workerId: string;
  workerName: string;
  doseValue: number;
  limit: number;
  alertType: 'warning' | 'critical' | 'exceeded';
}

export interface JobNotificationData {
  jobId: string;
  jobTitle: string;
  site: string;
  startTime: string;
  supervisorName: string;
}

export interface SystemAlertData {
  alertType: 'maintenance' | 'system_update' | 'emergency';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Send a push notification to a single device
 */
export const sendPushNotification = async (
  deviceToken: string,
  payload: NotificationPayload,
): Promise<boolean> => {
  try {
    // Check if Firebase is initialized
    if (admin.apps.length === 0) {
      logger.warn('Firebase not initialized, skipping push notification');
      return false;
    }

    const message = {
      token: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      ...(payload.data && { data: payload.data }),
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'dose-alerts',
          priority: 'high' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info('Push notification sent successfully:', { messageId: response });
    return true;
  } catch (error) {
    logger.error('Failed to send push notification:', error);
    return false;
  }
};

/**
 * Send dose alert notification
 */
export const sendDoseAlert = async (
  deviceToken: string,
  alertData: DoseAlertData,
): Promise<boolean> => {
  const { workerName, doseValue, limit, alertType } = alertData;
  
  let title: string;
  let body: string;
  
  switch (alertType) {
    case 'warning':
      title = 'Dose Warning';
      body = `${workerName} is approaching dose limit (${doseValue}mSv/${limit}mSv)`;
      break;
    case 'critical':
      title = 'Dose Critical';
      body = `${workerName} is near dose limit (${doseValue}mSv/${limit}mSv)`;
      break;
    case 'exceeded':
      title = 'Dose Limit Exceeded';
      body = `${workerName} has exceeded dose limit (${doseValue}mSv/${limit}mSv)`;
      break;
    default:
      title = 'Dose Alert';
      body = `${workerName}: ${doseValue}mSv dose recorded`;
  }

  return sendPushNotification(deviceToken, {
    title,
    body,
    data: {
      type: 'dose_alert',
      workerId: alertData.workerId,
      alertType,
      doseValue: doseValue.toString(),
      limit: limit.toString(),
    },
  });
};

/**
 * Send job notification
 */
export const sendJobNotification = async (
  deviceToken: string,
  jobData: JobNotificationData,
): Promise<boolean> => {
  return sendPushNotification(deviceToken, {
    title: 'New Job Assignment',
    body: `You have been assigned to: ${jobData.jobTitle} at ${jobData.site}`,
    data: {
      type: 'job_notification',
      jobId: jobData.jobId,
      site: jobData.site,
      startTime: jobData.startTime,
      supervisorName: jobData.supervisorName,
    },
  });
};

/**
 * Send system alert
 */
export const sendSystemAlert = async (
  deviceToken: string,
  alertData: SystemAlertData,
): Promise<boolean> => {
  return sendPushNotification(deviceToken, {
    title: 'System Alert',
    body: alertData.message,
    data: {
      type: 'system_alert',
      alertType: alertData.alertType,
      priority: alertData.priority,
    },
  });
};

/**
 * Send notification to multiple devices
 */
export const sendMulticastNotification = async (
  deviceTokens: string[],
  payload: NotificationPayload,
): Promise<{ successCount: number; failureCount: number }> => {
  try {
    // Send to each device individually since sendMulticast is not available
    const results = await Promise.all(
      deviceTokens.map(async (deviceToken) => {
        try {
          await sendPushNotification(deviceToken, payload);
          return { success: true };
        } catch (error) {
          logger.error('Failed to send to device:', { deviceToken: deviceToken.substring(0, 10) + '...', error });
          return { success: false };
        }
      }),
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info('Multicast notification sent:', {
      successCount,
      failureCount,
    });

    return {
      successCount,
      failureCount,
    };
  } catch (error) {
    logger.error('Failed to send multicast notification:', error);
    return { successCount: 0, failureCount: deviceTokens.length };
  }
};

/**
 * Validate device token
 */
export const validateDeviceToken = async (deviceToken: string): Promise<boolean> => {
  try {
    // Check if Firebase is initialized
    if (admin.apps.length === 0) {
      logger.warn('Firebase not initialized, skipping token validation');
      return false;
    }

    // Try to send a test message to validate the token
    const message = {
      token: deviceToken,
      notification: {
        title: 'Test',
        body: 'Token validation',
      },
      data: {
        type: 'token_validation',
      },
    };

    await admin.messaging().send(message);
    return true;
  } catch (error) {
    logger.warn('Invalid device token:', { deviceToken: deviceToken.substring(0, 10) + '...' });
    return false;
  }
}; 