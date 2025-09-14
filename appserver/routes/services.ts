// =====================================================
// Portal Services - Service Routes
// =====================================================

import { Router } from 'express';
import { Database } from '../database/Database.js';
import { ServiceController } from '../controllers/ServiceController.js';
import { createLogger } from '../shared/logger.js';

export function createServiceRoutes(db: Database): Router {
  const router = Router();
  const controller = new ServiceController(db);
  const logger = createLogger('ServiceRoutes');

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
