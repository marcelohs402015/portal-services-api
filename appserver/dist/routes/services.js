"use strict";
// =====================================================
// Portal Services - Service Routes
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceRoutes = createServiceRoutes;
const express_1 = require("express");
const ServiceController_js_1 = require("../controllers/ServiceController.js");
const logger_js_1 = require("../shared/logger.js");
function createServiceRoutes(db) {
    const router = (0, express_1.Router)();
    const controller = new ServiceController_js_1.ServiceController(db);
    const logger = (0, logger_js_1.createLogger)('ServiceRoutes');
    logger.info('Setting up service routes');
    // GET /api/services - Listar todos os serviços
    router.get('/', controller.getAllServices);
    // GET /api/services/active - Listar serviços ativos
    router.get('/active', controller.getActiveServices);
    // GET /api/services/requiring-quote - Listar serviços que requerem orçamento
    router.get('/requiring-quote', controller.getServicesRequiringQuote);
    // GET /api/services/search - Buscar serviços
    router.get('/search', controller.searchServices);
    // GET /api/services/stats - Estatísticas dos serviços
    router.get('/stats', controller.getServiceStats);
    // GET /api/services/category/:categoryId - Listar serviços por categoria
    router.get('/category/:categoryId', controller.getServicesByCategory);
    // GET /api/services/:id - Buscar serviço por ID
    router.get('/:id', controller.getServiceById);
    // POST /api/services - Criar novo serviço
    router.post('/', controller.createService);
    // PUT /api/services/:id - Atualizar serviço
    router.put('/:id', controller.updateService);
    // DELETE /api/services/:id - Excluir serviço
    router.delete('/:id', controller.deleteService);
    // PATCH /api/services/:id/soft-delete - Desativar serviço
    router.patch('/:id/soft-delete', controller.softDeleteService);
    return router;
}
