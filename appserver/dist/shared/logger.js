import winston from 'winston';
import path from 'path';
export function createLogger(service) {
    const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
        defaultMeta: { service },
        transports: [
            new winston.transports.File({
                filename: path.join('logs', 'error.log'),
                level: 'error',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
            new winston.transports.File({
                filename: path.join('logs', 'combined.log'),
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
        ],
    });
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.printf(({ level, message, service, timestamp }) => {
                return `${timestamp} [${service}] ${level}: ${message}`;
            }))
        }));
    }
    return logger;
}
//# sourceMappingURL=logger.js.map