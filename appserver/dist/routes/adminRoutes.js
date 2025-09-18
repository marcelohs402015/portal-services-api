"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_js_1 = require("../shared/logger.js");
const logger = (0, logger_js_1.createLogger)('AdminRoutes');
const router = (0, express_1.Router)();
// Middleware para proteger as rotas de administração
const adminAuthMiddleware = (req, res, next) => {
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    const requestSecret = req.headers['x-admin-secret'];
    if (!adminSecret) {
        logger.warn('A chave secreta de administração (ADMIN_SECRET_KEY) não está configurada.');
        return res.status(500).json({
            success: false,
            error: 'Administração não configurada no servidor.',
        });
    }
    if (adminSecret === requestSecret) {
        logger.info(`Acesso de administrador autorizado para o IP: ${req.ip}`);
        return next();
    }
    logger.warn(`Tentativa de acesso não autorizado à rota de administração do IP: ${req.ip}`);
    res.status(403).json({
        success: false,
        error: 'Acesso negado. Chave de administração inválida.',
    });
};
// Endpoint de status do banco de dados
router.get('/database-status', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Conexão com banco não encontrada'
            });
        }
        // Teste simples de conexão
        const result = await db.query('SELECT NOW() as current_time, version() as version');
        res.status(200).json({
            success: true,
            message: 'Banco de dados conectado com sucesso',
            data: {
                current_time: result.rows[0].current_time,
                version: result.rows[0].version
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Erro ao verificar status do banco:', { error: errorMessage });
        res.status(500).json({
            success: false,
            error: 'Erro ao conectar com banco de dados',
            details: errorMessage
        });
    }
});
// Endpoint para executar query personalizada (cuidado!)
router.post('/execute-query', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Conexão com banco não encontrada'
            });
        }
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query SQL é obrigatória'
            });
        }
        logger.warn('Executando query personalizada:', { query: query.substring(0, 100) });
        const result = await db.query(query);
        res.status(200).json({
            success: true,
            message: 'Query executada com sucesso',
            data: {
                rows: result.rows,
                rowCount: result.rowCount
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Falha ao executar query:', { error: errorMessage });
        res.status(500).json({
            success: false,
            error: 'Falha ao executar query',
            details: errorMessage
        });
    }
});
// Endpoint para verificar status das tabelas
router.get('/tables-status', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Conexão com banco não encontrada'
            });
        }
        // Contar registros nas principais tabelas
        const tables = ['categories', 'clients', 'services', 'quotations', 'appointments', 'emails'];
        const counts = {};
        for (const table of tables) {
            try {
                const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
                counts[table] = parseInt(result.rows[0].count);
            }
            catch (error) {
                counts[table] = -1; // Indica que a tabela não existe ou erro
            }
        }
        res.status(200).json({
            success: true,
            message: 'Status das tabelas obtido com sucesso',
            data: { counts }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Falha ao verificar status das tabelas:', { error: errorMessage });
        res.status(500).json({
            success: false,
            error: 'Falha ao verificar status das tabelas',
            details: errorMessage
        });
    }
});
exports.default = router;
