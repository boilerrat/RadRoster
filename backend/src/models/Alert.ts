import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface AlertAttributes {
  id: string;
  worker_id: string;
  type: 'dose_limit' | 'training_expired' | 'bioassay_due' | 'job_overdue' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  triggered_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
  is_active: boolean;
  metadata?: object;
  created_at?: Date;
  updated_at?: Date;
}

export interface AlertCreationAttributes extends Omit<AlertAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: string;
  public worker_id!: string;
  public type!: 'dose_limit' | 'training_expired' | 'bioassay_due' | 'job_overdue' | 'system_alert';
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public title!: string;
  public message!: string;
  public triggered_at!: Date;
  public resolved_at?: Date;
  public resolved_by?: string;
  public is_active!: boolean;
  public metadata?: object;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    worker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('dose_limit', 'training_expired', 'bioassay_due', 'job_overdue', 'system_alert'),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
        notEmpty: true,
      },
    },
    triggered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    resolved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'workers',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['worker_id'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['severity'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['triggered_at'],
      },
      // Composite indexes for efficient alert queries
      {
        fields: ['worker_id', 'is_active'],
      },
      {
        fields: ['type', 'severity'],
      },
    ],
  }
); 