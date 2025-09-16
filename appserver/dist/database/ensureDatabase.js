"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseExists = void 0;
const pg_1 = __importDefault(require("pg"));
const { Client } = pg_1.default;
const logger_js_1 = require("../shared/logger.js");
const logger = (0, logger_js_1.createLogger)('EnsureDatabase');
async function ensureDatabaseExists(databaseName, config) {
    const client = new Client({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        ssl: config.ssl,
        database: 'postgres' // Conecta ao banco padrão para criar o banco de dados
    });
    try {
        await client.connect();
        logger.info(`Conectado ao PostgreSQL como ${config.user}@${config.host}:${config.port}`);
        // Verifica se o banco de dados existe
        const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (result.rows.length === 0) {
            logger.info(`Criando banco de dados: ${databaseName}`);
            await client.query(`CREATE DATABASE "${databaseName}"`);
            logger.info(`Banco de dados ${databaseName} criado com sucesso`);
        }
        else {
            logger.info(`Banco de dados ${databaseName} já existe`);
        }
    }
    catch (error) {
        logger.error('Erro ao verificar/criar banco de dados:', error.message);
        throw error;
    }
    finally {
        await client.end();
    }
}
exports.ensureDatabaseExists = ensureDatabaseExists;
