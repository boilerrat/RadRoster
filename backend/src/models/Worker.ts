import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface WorkerAttributes {
  id: string;
  name: string;
  employee_id: string;
  role: 'worker' | 'supervisor' | 'rpo' | 'admin';
  annual_limit_mSv: number;
  last_bioassay?: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface WorkerCreationAttributes extends Omit<WorkerAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Worker extends Model<WorkerAttributes, WorkerCreationAttributes> implements WorkerAttributes {
  public id!: string;
  public name!: string;
  public employee_id!: string;
  public role!: 'worker' | 'supervisor' | 'rpo' | 'admin';
  public annual_limit_mSv!: number;
  public last_bioassay?: Date;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Worker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    employee_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM('worker', 'supervisor', 'rpo', 'admin'),
      allowNull: false,
      defaultValue: 'worker',
    },
    annual_limit_mSv: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      validate: {
        min: 0,
        max: 1000, // Safety limit
      },
      defaultValue: 50.0, // Standard annual limit
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
  },
  {
    sequelize,
    tableName: 'workers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
); 