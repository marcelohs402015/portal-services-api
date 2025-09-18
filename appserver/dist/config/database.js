"use strict";
/**
 * Database Configuration
 * Configuração unificada para conexão com PostgreSQL
 * Suporta tanto DATABASE_URL (Render/Produção) quanto variáveis individuais (Local)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.queryWithRetry = queryWithRetry;
exports.closePool = closePool;
exports.healthCheck = healthCheck;
exports.getDatabaseInfo = getDatabaseInfo;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../shared/logger");
// Carregar variáveis de ambiente
dotenv_1.default.config();
const logger = (0, logger_1.createLogger)('database-config');
/**
 * Cria configuração do banco usando DATABASE_URL
 */
function createDatabaseConfig() {
    // Verificar se DATABASE_URL está presente
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
        console.error('❌ DATABASE_URL não encontrada!');
        console.error('Configure a variável DATABASE_URL no Render ou arquivo .env');
        throw new Error('DATABASE_URL é obrigatória para conexão com banco');
    }
    console.log('🔗 Usando DATABASE_URL para conexão');
    console.log('🔍 DATABASE_URL detectada:', process.env.DATABASE_URL.substring(0, 20) + '...');
    const config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false } // Necessário para Render
            : false,
        // Pool settings otimizados
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    };
    // Log da conexão (sem expor senha)
    const urlParts = process.env.DATABASE_URL.split('@');
    const hostInfo = urlParts[1] || 'unknown';
    console.log(`📍 Conectando ao banco: ${hostInfo.split('/')[0]}`);
    return config;
}
/**
 * Pool de conexões do PostgreSQL
 */
exports.pool = new pg_1.Pool(createDatabaseConfig());
/**
 * Testa a conexão com o banco
 */
async function testConnection() {
    try {
        const result = await exports.pool.query('SELECT NOW()');
        const dbTime = result.rows[0].now;
        console.log('✅ Banco de dados conectado com sucesso');
        console.log(`⏰ Hora do banco: ${dbTime}`);
        logger.info('Database connection established', {
            timestamp: dbTime,
            environment: process.env.NODE_ENV
        });
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error);
        logger.error('Database connection failed', {
            error: error.message
        });
        // Em produção, não queremos que a aplicação continue sem banco
        if (process.env.NODE_ENV === 'production') {
            console.error('🛑 Aplicação não pode continuar sem conexão com banco em produção');
            process.exit(1);
        }
        return false;
    }
}
/**
 * Executa query com retry automático
 */
async function queryWithRetry(text, params, maxRetries = 3) {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await exports.pool.query(text, params);
        }
        catch (error) {
            lastError = error;
            // Se é erro de conexão, tenta reconectar
            if (lastError.message.includes('connection')) {
                console.log(`⚠️ Tentativa ${i + 1}/${maxRetries} de reconexão...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff exponencial
                continue;
            }
            // Se é outro tipo de erro, não tenta novamente
            throw error;
        }
    }
    throw lastError;
}
/**
 * Fecha o pool de conexões (graceful shutdown)
 */
async function closePool() {
    try {
        await exports.pool.end();
        console.log('🔌 Pool de conexões fechado');
        logger.info('Database connection pool closed');
    }
    catch (error) {
        console.error('❌ Erro ao fechar pool:', error);
        logger.error('Error closing database pool', {
            error: error.message
        });
    }
}
/**
 * Health check do banco
 */
async function healthCheck() {
    const startTime = Date.now();
    try {
        await exports.pool.query('SELECT 1');
        const latency = Date.now() - startTime;
        return {
            connected: true,
            latency
        };
    }
    catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}
// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('📛 SIGTERM recebido, fechando conexões...');
    await closePool();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('📛 SIGINT recebido, fechando conexões...');
    await closePool();
    process.exit(0);
});
// Export configuração para debug (sem senha)
function getDatabaseInfo() {
    if (!process.env.DATABASE_URL) {
        return { type: 'DATABASE_URL', error: 'DATABASE_URL não configurada' };
    }
    const url = process.env.DATABASE_URL;
    const parts = url.split('@');
    const hostInfo = parts[1] || 'unknown';
    return {
        type: 'DATABASE_URL',
        host: hostInfo.split('/')[0],
        ssl: process.env.NODE_ENV === 'production'
    };
}
