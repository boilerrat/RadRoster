import dotenv from 'dotenv';
import path from 'path';
import { sequelize } from '../config/database';
import { User } from '../models';
import { logger } from '../utils/logger';

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdminUser = async (): Promise<void> => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync models (this will create tables if they don't exist)
    await sequelize.sync({ force: false });
    logger.info('Database models synchronized');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@radroster.com' },
    });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@radroster.com',
      password: 'Admin123!', // This will be hashed by the model hook
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true,
    });

    logger.info('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create a supervisor user for testing
    const supervisorUser = await User.create({
      email: 'supervisor@radroster.com',
      password: 'Supervisor123!',
      firstName: 'John',
      lastName: 'Supervisor',
      role: 'supervisor',
      isActive: true,
    });

    logger.info('Supervisor user created successfully:', {
      id: supervisorUser.id,
      email: supervisorUser.email,
      role: supervisorUser.role,
    });

    // Create an RPO user for testing
    const rpoUser = await User.create({
      email: 'rpo@radroster.com',
      password: 'Rpo123!@',
      firstName: 'Jane',
      lastName: 'RPO',
      role: 'rpo',
      isActive: true,
    });

    logger.info('RPO user created successfully:', {
      id: rpoUser.id,
      email: rpoUser.email,
      role: rpoUser.role,
    });

    logger.info('All test users created successfully');
    logger.info('Test credentials:');
    logger.info('Admin: admin@radroster.com / Admin123!');
    logger.info('Supervisor: supervisor@radroster.com / Supervisor123!');
    logger.info('RPO: rpo@radroster.com / Rpo123!@');

  } catch (error) {
    logger.error('Failed to create admin user:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run the script
createAdminUser(); 