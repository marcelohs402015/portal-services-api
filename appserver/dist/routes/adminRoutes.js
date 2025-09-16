"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_js_1 = require("../shared/logger.js");
const ensureDatabase_js_1 = require("../database/ensureDatabase.js");
const migrations_js_1 = require("../database/migrations.js");
const seedData_js_1 = require("../database/seedData.js");
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
// Endpoint para configurar o banco de dados e rodar as migrações
router.post('/setup-database', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            throw new Error('A conexão com o banco de dados não foi encontrada na aplicação.');
        }
        const dbConfig = db.getConfig();
        logger.info('Iniciando a criação e verificação do banco de dados...');
        await (0, ensureDatabase_js_1.ensureDatabaseExists)(dbConfig.database, {
            user: dbConfig.user,
            password: dbConfig.password,
            host: dbConfig.host,
            port: dbConfig.port,
            ssl: dbConfig.ssl,
        });
        logger.info('Banco de dados verificado com sucesso.');
        logger.info('Iniciando a execução das migrações...');
        await (0, migrations_js_1.runMigrations)(db);
        logger.info('Migrações do banco de dados concluídas com sucesso.');
        // Seed default data
        logger.info('Carregando dados padrão...');
        const dataSeeder = new seedData_js_1.DataSeeder(db);
        await dataSeeder.seedDefaultData();
        logger.info('Dados padrão carregados com sucesso.');
        res.status(200).json({
            success: true,
            message: 'Banco de dados, migrações e dados padrão configurados com sucesso!',
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Falha ao configurar o banco de dados:', { error: errorMessage, stack: error.stack });
        res.status(500).json({
            success: false,
            error: 'Falha ao configurar o banco de dados.',
            details: errorMessage,
        });
    }
});
// Endpoint para recarregar dados padrão
router.post('/reload-default-data', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            throw new Error('A conexão com o banco de dados não foi encontrada na aplicação.');
        }
        const { force } = req.body;
        logger.info('Iniciando recarregamento de dados padrão...');
        const dataSeeder = new seedData_js_1.DataSeeder(db);
        if (force) {
            await dataSeeder.forceReseed();
            logger.info('Dados padrão recarregados com força (dados existentes foram removidos).');
        }
        else {
            await dataSeeder.seedDefaultData();
            logger.info('Dados padrão recarregados (apenas se banco estiver vazio).');
        }
        res.status(200).json({
            success: true,
            message: force
                ? 'Dados padrão recarregados com sucesso (dados existentes foram removidos)!'
                : 'Dados padrão recarregados com sucesso (apenas se banco estiver vazio)!',
            force: force || false
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Falha ao recarregar dados padrão:', { error: errorMessage, stack: error.stack });
        res.status(500).json({
            success: false,
            error: 'Falha ao recarregar dados padrão.',
            details: errorMessage,
        });
    }
});
// Endpoint para verificar status dos dados
router.get('/data-status', adminAuthMiddleware, async (req, res) => {
    try {
        const db = req.app.get('db');
        if (!db) {
            throw new Error('A conexão com o banco de dados não foi encontrada na aplicação.');
        }
        const dataSeeder = new seedData_js_1.DataSeeder(db);
        const hasData = await dataSeeder.hasData();
        // Contar registros em cada tabela
        const categoriesResult = await db.query('SELECT COUNT(*) as count FROM categories');
        const servicesResult = await db.query('SELECT COUNT(*) as count FROM services');
        const templatesResult = await db.query('SELECT COUNT(*) as count FROM email_templates');
        const settingsResult = await db.query('SELECT COUNT(*) as count FROM system_settings');
        res.status(200).json({
            success: true,
            data: {
                hasData,
                counts: {
                    categories: parseInt(categoriesResult.rows[0].count),
                    services: parseInt(servicesResult.rows[0].count),
                    emailTemplates: parseInt(templatesResult.rows[0].count),
                    systemSettings: parseInt(settingsResult.rows[0].count)
                }
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('Falha ao verificar status dos dados:', { error: errorMessage, stack: error.stack });
        res.status(500).json({
            success: false,
            error: 'Falha ao verificar status dos dados.',
            details: errorMessage,
        });
    }
});
exports.default = router;
