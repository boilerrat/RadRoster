import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface JobAttributes {
  id: string;
  site: string;
  job_number: string;
  description: string;
  start_time: Date;
  planned_duration_min: number;
  supervisor_id: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
}

export interface JobCreationAttributes extends Omit<JobAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public site!: string;
  public job_number!: string;
  public description!: string;
  public start_time!: Date;
  public planned_duration_min!: number;
  public supervisor_id!: string;
  public status!: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    site: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    job_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
        notEmpty: true,
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    planned_duration_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 1440, // 24 hours max
      },
    },
    supervisor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planned',
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['job_number'],
      },
      {
        fields: ['site'],
      },
      {
        fields: ['supervisor_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['start_time'],
      },
    ],
  }
); 