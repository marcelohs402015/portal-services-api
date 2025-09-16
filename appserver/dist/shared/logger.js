"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
function createLogger(service) {
    const logger = winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
        defaultMeta: { service },
        transports: [
            new winston_1.default.transports.File({
                filename: path_1.default.join('logs', 'error.log'),
                level: 'error',
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }),
            new winston_1.default.transports.File({
                filename: path_1.default.join('logs', 'combined.log'),
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }),
        ],
    });
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ level, message, service, timestamp }) => {
                return `${timestamp} [${service}] ${level}: ${message}`;
            }))
        }));
    }
    return logger;
}
exports.createLogger = createLogger;
