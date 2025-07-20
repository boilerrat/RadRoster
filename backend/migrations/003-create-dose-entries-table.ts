import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('dose_entries', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    worker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dose_mSv: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
    },
    source_instrument: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    instrument_serial: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Create indexes
  await queryInterface.addIndex('dose_entries', ['worker_id']);
  await queryInterface.addIndex('dose_entries', ['job_id']);
  await queryInterface.addIndex('dose_entries', ['timestamp']);
  await queryInterface.addIndex('dose_entries', ['source_instrument']);
  await queryInterface.addIndex('dose_entries', ['instrument_serial']);
  // Composite index for efficient dose queries
  await queryInterface.addIndex('dose_entries', ['worker_id', 'timestamp']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('dose_entries');
} 