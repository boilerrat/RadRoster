import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Import migrations
import * as createWorkersTable from '../../migrations/001-create-workers-table';
import * as createJobsTable from '../../migrations/002-create-jobs-table';
import * as createDoseEntriesTable from '../../migrations/003-create-dose-entries-table';

const migrations = [
  { name: '001-create-workers-table', up: createWorkersTable.up, down: createWorkersTable.down },
  { name: '002-create-jobs-table', up: createJobsTable.up, down: createJobsTable.down },
  { name: '003-create-dose-entries-table', up: createDoseEntriesTable.up, down: createDoseEntriesTable.down },
];

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedMigrationNames = (executedMigrations as any[]).map(m => m.name);

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedMigrationNames.includes(migration.name)) {
        logger.info(`Running migration: ${migration.name}`);
        
        await sequelize.transaction(async (transaction) => {
          await migration.up({ queryInterface: sequelize.getQueryInterface(), transaction });
          
          await sequelize.query(
            'INSERT INTO migrations (name) VALUES (?)',
            {
              replacements: [migration.name],
              transaction,
            }
          );
        });

        logger.info(`Migration completed: ${migration.name}`);
      } else {
        logger.info(`Migration already executed: ${migration.name}`);
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

async function rollbackMigrations(count: number = 1): Promise<void> {
  try {
    logger.info(`Rolling back ${count} migration(s)...`);

    // Get executed migrations in reverse order
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT ?',
      { replacements: [count] }
    );

    for (const executedMigration of executedMigrations as any[]) {
      const migration = migrations.find(m => m.name === executedMigration.name);
      
      if (migration) {
        logger.info(`Rolling back migration: ${migration.name}`);
        
        await sequelize.transaction(async (transaction) => {
          await migration.down({ queryInterface: sequelize.getQueryInterface(), transaction });
          
          await sequelize.query(
            'DELETE FROM migrations WHERE name = ?',
            {
              replacements: [migration.name],
              transaction,
            }
          );
        });

        logger.info(`Rollback completed: ${migration.name}`);
      }
    }

    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const count = parseInt(process.argv[3]) || 1;

  if (command === 'up') {
    runMigrations()
      .then(() => {
        logger.info('Migrations completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Migration failed:', error);
        process.exit(1);
      });
  } else if (command === 'down') {
    rollbackMigrations(count)
      .then(() => {
        logger.info('Rollback completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Rollback failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: npm run migrate:up or npm run migrate:down [count]');
    process.exit(1);
  }
}

export { runMigrations, rollbackMigrations }; 