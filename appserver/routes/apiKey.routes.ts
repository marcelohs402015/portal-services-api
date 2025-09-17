/**
 * API Key Routes
 * Rotas para gerenciamento de API Keys
 */

import { Router } from 'express';
import { apiKeyController } from '../controllers/ApiKeyController';
import { authenticateApiKey, requireAdmin, requirePermission } from '../middlewares/apiKey.middleware';
import { ApiPermission } from '../types/api.types';

const router = Router();

// Rotas públicas
router.get('/permissions', apiKeyController.listPermissions);

// Rotas protegidas - requerem autenticação
router.use(authenticateApiKey);

// Informações da API Key atual
router.get('/me', apiKeyController.getCurrentApiKey);

// Gerenciamento de API Keys (requer autenticação)
router.get('/', apiKeyController.listApiKeys);
router.post('/', apiKeyController.createApiKey);
router.get('/stats', apiKeyController.getStats);
router.patch('/:key/deactivate', apiKeyController.deactivateApiKey);
router.patch('/:key/activate', apiKeyController.activateApiKey);

export default router;
