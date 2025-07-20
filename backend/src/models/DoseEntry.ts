import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface DoseEntryAttributes {
  id: string;
  worker_id: string;
  job_id: string;
  timestamp: Date;
  dose_mSv: number;
  source_instrument: string;
  instrument_serial: string;
  location: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DoseEntryCreationAttributes extends Omit<DoseEntryAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class DoseEntry extends Model<DoseEntryAttributes, DoseEntryCreationAttributes> implements DoseEntryAttributes {
  public id!: string;
  public worker_id!: string;
  public job_id!: string;
  public timestamp!: Date;
  public dose_mSv!: number;
  public source_instrument!: string;
  public instrument_serial!: string;
  public location!: string;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DoseEntry.init(
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
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id',
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    dose_mSv: {
      type: DataTypes.DECIMAL(8, 4), // Critical precision for dose values
      allowNull: false,
      validate: {
        min: 0,
        max: 1000, // Safety limit
        isDecimal: true,
      },
    },
    source_instrument: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
      },
    },
    instrument_serial: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [3, 30],
        notEmpty: true,
      },
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
  },
  {
    sequelize,
    tableName: 'dose_entries',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['worker_id'],
      },
      {
        fields: ['job_id'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['source_instrument'],
      },
      {
        fields: ['instrument_serial'],
      },
      // Composite index for efficient dose queries
      {
        fields: ['worker_id', 'timestamp'],
      },
    ],
  }
); 