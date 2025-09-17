"use strict";
/**
 * API Key Routes
 * Rotas para gerenciamento de API Keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApiKeyController_1 = require("../controllers/ApiKeyController");
const apiKey_middleware_1 = require("../middlewares/apiKey.middleware");
const router = (0, express_1.Router)();
// Rotas públicas
router.get('/permissions', ApiKeyController_1.apiKeyController.listPermissions);
// Rotas protegidas - requerem autenticação
router.use(apiKey_middleware_1.authenticateApiKey);
// Informações da API Key atual
router.get('/me', ApiKeyController_1.apiKeyController.getCurrentApiKey);
// Gerenciamento de API Keys (requer autenticação)
router.get('/', ApiKeyController_1.apiKeyController.listApiKeys);
router.post('/', ApiKeyController_1.apiKeyController.createApiKey);
router.get('/stats', ApiKeyController_1.apiKeyController.getStats);
router.patch('/:key/deactivate', ApiKeyController_1.apiKeyController.deactivateApiKey);
router.patch('/:key/activate', ApiKeyController_1.apiKeyController.activateApiKey);
exports.default = router;
