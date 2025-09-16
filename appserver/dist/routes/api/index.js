"use strict";
// =====================================================
// Portal Services - API Routes Index
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAPIRoutes = void 0;
const express_1 = require("express");
const categories_js_1 = require("../categories.js");
const services_js_1 = require("../services.js");
const clients_js_1 = require("../clients.js");
const quotationsRoutes_real_js_1 = require("../quotationsRoutes.real.js");
const appointmentsRoutes_real_js_1 = require("../appointmentsRoutes.real.js");
const emailRoutes_real_js_1 = require("../emailRoutes.real.js");
const statsSimple_js_1 = require("../statsSimple.js");
const logger_js_1 = require("../../shared/logger.js");
function createAPIRoutes(db) {
    const router = (0, express_1.Router)();
    const logger = (0, logger_js_1.createLogger)('APIRoutes');
    logger.info('Setting up API routes');
    // Health check
    router.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'API funcionando!',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });
    // Mount entity routes
    router.use('/categories', (0, categories_js_1.createCategoryRoutes)(db));
    router.use('/services', (0, services_js_1.createServiceRoutes)(db));
    router.use('/clients', (0, clients_js_1.createClientRoutes)(db));
    router.use('/', (0, quotationsRoutes_real_js_1.createQuotationsRoutesReal)(db));
    router.use('/', (0, appointmentsRoutes_real_js_1.createAppointmentsRoutesReal)(db));
    router.use('/', (0, emailRoutes_real_js_1.createEmailRoutesReal)(db));
    router.use('/', (0, statsSimple_js_1.createStatsRoutesSimple)(db));
    return router;
}
exports.createAPIRoutes = createAPIRoutes;
