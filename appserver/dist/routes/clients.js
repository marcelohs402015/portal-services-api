"use strict";
// =====================================================
// Portal Services - Client Routes
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRoutes = createClientRoutes;
const express_1 = require("express");
const ClientController_js_1 = require("../controllers/ClientController.js");
const logger_js_1 = require("../shared/logger.js");
function createClientRoutes(db) {
    const router = (0, express_1.Router)();
    const controller = new ClientController_js_1.ClientController(db);
    const logger = (0, logger_js_1.createLogger)('ClientRoutes');
    logger.info('Setting up client routes');
    // GET /api/clients - Listar todos os clientes
    router.get('/', controller.getAllClients);
    // GET /api/clients/active - Listar clientes ativos
    router.get('/active', controller.getActiveClients);
    // GET /api/clients/search - Buscar clientes
    router.get('/search', controller.searchClients);
    // GET /api/clients/stats - Estatísticas dos clientes
    router.get('/stats', controller.getClientStats);
    // GET /api/clients/email/:email - Buscar cliente por email
    router.get('/email/:email', controller.getClientByEmail);
    // GET /api/clients/phone/:phone - Buscar cliente por telefone
    router.get('/phone/:phone', controller.getClientByPhone);
    // GET /api/clients/document/:document - Buscar cliente por documento
    router.get('/document/:document', controller.getClientByDocument);
    // GET /api/clients/:id - Buscar cliente por ID
    router.get('/:id', controller.getClientById);
    // POST /api/clients - Criar novo cliente
    router.post('/', controller.createClient);
    // PUT /api/clients/:id - Atualizar cliente
    router.put('/:id', controller.updateClient);
    // DELETE /api/clients/:id - Excluir cliente
    router.delete('/:id', controller.deleteClient);
    // PATCH /api/clients/:id/soft-delete - Desativar cliente
    router.patch('/:id/soft-delete', controller.softDeleteClient);
    return router;
}
