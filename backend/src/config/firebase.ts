import admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize Firebase Admin SDK
const initializeFirebase = (): void => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      logger.info('Firebase already initialized');
      return;
    }

    // Check if all required Firebase environment variables are set
    const requiredVars = [
      'FCM_PROJECT_ID',
      'FCM_PRIVATE_KEY_ID',
      'FCM_PRIVATE_KEY',
      'FCM_CLIENT_EMAIL',
      'FCM_CLIENT_ID',
      'FCM_CLIENT_CERT_URL',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.warn('Firebase environment variables missing:', missingVars);
      logger.warn('Firebase Cloud Messaging will not be available');
      logger.warn('Run "npm run setup:firebase" for setup instructions');
      return;
    }

    // For development, we'll use environment variables
    // In production, you should use a service account JSON file
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env['FCM_PROJECT_ID'],
      private_key_id: process.env['FCM_PRIVATE_KEY_ID'],
      private_key: process.env['FCM_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
      client_email: process.env['FCM_CLIENT_EMAIL'],
      client_id: process.env['FCM_CLIENT_ID'],
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env['FCM_CLIENT_CERT_URL'],
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env['FCM_PROJECT_ID'] || '',
    });

    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    logger.warn('Firebase Cloud Messaging will not be available');
  }
};

// Initialize Firebase when this module is imported
initializeFirebase();

export default admin; 