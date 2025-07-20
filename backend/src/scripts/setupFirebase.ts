import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const setupFirebase = (): void => {
  logger.info('=== Firebase Cloud Messaging Setup ===');
  logger.info('');
  
  // Check if Firebase environment variables are set
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
    logger.warn('Missing Firebase environment variables:');
    missingVars.forEach(varName => {
      logger.warn(`  - ${varName}`);
    });
    logger.info('');
    logger.info('To set up Firebase Cloud Messaging:');
    logger.info('');
    logger.info('1. Go to Firebase Console: https://console.firebase.google.com/');
    logger.info('2. Create a new project or select existing project');
    logger.info('3. Go to Project Settings > Service Accounts');
    logger.info('4. Click "Generate new private key"');
    logger.info('5. Download the JSON file');
    logger.info('6. Extract the following values from the JSON:');
    logger.info('   - project_id → FCM_PROJECT_ID');
    logger.info('   - private_key_id → FCM_PRIVATE_KEY_ID');
    logger.info('   - private_key → FCM_PRIVATE_KEY');
    logger.info('   - client_email → FCM_CLIENT_EMAIL');
    logger.info('   - client_id → FCM_CLIENT_ID');
    logger.info('   - client_x509_cert_url → FCM_CLIENT_CERT_URL');
    logger.info('');
    logger.info('7. Add these values to your .env file');
    logger.info('');
    logger.info('Example .env entries:');
    logger.info('FCM_PROJECT_ID=your-project-id');
    logger.info('FCM_PRIVATE_KEY_ID=abc123def456');
    logger.info('FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
    logger.info('FCM_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com');
    logger.info('FCM_CLIENT_ID=123456789012345678901');
    logger.info('FCM_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com');
    logger.info('');
    logger.info('Note: The private key should be wrapped in quotes and have \\n for line breaks');
  } else {
    logger.info('✅ All Firebase environment variables are set!');
    logger.info('');
    logger.info('Firebase Configuration:');
    logger.info(`  Project ID: ${process.env['FCM_PROJECT_ID']}`);
    logger.info(`  Client Email: ${process.env['FCM_CLIENT_EMAIL']}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Test the Firebase connection by running the server');
    logger.info('2. Set up your mobile app with FCM');
    logger.info('3. Test push notifications using the /api/notifications/test endpoint');
  }
  
  logger.info('');
  logger.info('=== End Firebase Setup ===');
};

// Run the setup
setupFirebase(); 