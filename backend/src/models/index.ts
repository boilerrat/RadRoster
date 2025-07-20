import { sequelize } from '../config/database';
import { Worker } from './Worker';
import { Job } from './Job';
import { DoseEntry } from './DoseEntry';
import { TrainingRecord } from './TrainingRecord';
import { Alert } from './Alert';
import { User, initUserModel } from './User';
import { DeviceToken, initDeviceTokenModel } from './DeviceToken';

// Define associations
Worker.hasMany(DoseEntry, { foreignKey: 'worker_id', as: 'doseEntries' });
DoseEntry.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Worker.hasMany(TrainingRecord, { foreignKey: 'worker_id', as: 'trainingRecords' });
TrainingRecord.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Worker.hasMany(Alert, { foreignKey: 'worker_id', as: 'alerts' });
Alert.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Job.hasMany(DoseEntry, { foreignKey: 'job_id', as: 'doseEntries' });
DoseEntry.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

Worker.hasMany(Job, { foreignKey: 'supervisor_id', as: 'supervisedJobs' });
Job.belongsTo(Worker, { foreignKey: 'supervisor_id', as: 'supervisor' });

// Initialize User model
initUserModel(sequelize);

// Initialize DeviceToken model
initDeviceTokenModel(sequelize);

// Define associations
User.hasMany(DeviceToken, { foreignKey: 'userId', as: 'deviceTokens' });
DeviceToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  Worker,
  Job,
  DoseEntry,
  TrainingRecord,
  Alert,
  User,
  DeviceToken,
}; 