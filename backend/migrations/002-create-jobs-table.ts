import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('jobs', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    site: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    job_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    planned_duration_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supervisor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planned',
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
  await queryInterface.addIndex('jobs', ['job_number'], { unique: true });
  await queryInterface.addIndex('jobs', ['site']);
  await queryInterface.addIndex('jobs', ['supervisor_id']);
  await queryInterface.addIndex('jobs', ['status']);
  await queryInterface.addIndex('jobs', ['start_time']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('jobs');
} 