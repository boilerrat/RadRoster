import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

import { sequelize } from '../config/database';
import { logger } from '../utils/logger';
import '../models'; // Import models to register them

const syncDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database synchronization...');
    
    // Sync all models with the database
    // force: true will drop existing tables and recreate them
    // In production, you should use migrations instead
    await sequelize.sync({ force: true });
    
    logger.info('Database synchronized successfully');
    logger.info('All tables created: workers, jobs, dose_entries, training_records, alerts');
    
    // Close the database connection
    await sequelize.close();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Failed to sync database:', error);
    process.exit(1);
  }
};

// Run the sync
syncDatabase(); 