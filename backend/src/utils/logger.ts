import winston from 'winston';

const logLevel = process.env['LOG_LEVEL'] || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'radroster-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

// Add file transport in production
if (process.env['NODE_ENV'] === 'production') {
  logger.add(new winston.transports.File({
    filename: process.env['LOG_FILE_PATH'] || './logs/app.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
} 