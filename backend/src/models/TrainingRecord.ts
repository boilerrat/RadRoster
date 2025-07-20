import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface TrainingRecordAttributes {
  id: string;
  worker_id: string;
  course_name: string;
  course_code: string;
  completion_date: Date;
  expiry_date?: Date;
  certification_number?: string;
  instructor?: string;
  score?: number;
  is_valid: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface TrainingRecordCreationAttributes extends Omit<TrainingRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class TrainingRecord extends Model<TrainingRecordAttributes, TrainingRecordCreationAttributes> implements TrainingRecordAttributes {
  public id!: string;
  public worker_id!: string;
  public course_name!: string;
  public course_code!: string;
  public completion_date!: Date;
  public expiry_date?: Date;
  public certification_number?: string;
  public instructor?: string;
  public score?: number;
  public is_valid!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TrainingRecord.init(
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
    course_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: [2, 20],
        notEmpty: true,
      },
    },
    completion_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    certification_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    instructor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'training_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['worker_id'],
      },
      {
        fields: ['course_code'],
      },
      {
        fields: ['completion_date'],
      },
      {
        fields: ['expiry_date'],
      },
      {
        fields: ['is_valid'],
      },
      // Composite index for efficient training queries
      {
        fields: ['worker_id', 'course_code'],
      },
    ],
  }
); 