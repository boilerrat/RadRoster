import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('workers', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('worker', 'supervisor', 'rpo', 'admin'),
      allowNull: false,
      defaultValue: 'worker',
    },
    annual_limit_mSv: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      defaultValue: 50.0,
    },
    last_bioassay: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  await queryInterface.addIndex('workers', ['employee_id'], { unique: true });
  await queryInterface.addIndex('workers', ['role']);
  await queryInterface.addIndex('workers', ['is_active']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('workers');
} 