// =====================================================
// Portal Services - Category Routes
// =====================================================

import { Router } from 'express';
import { Database } from '../database/Database.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { createLogger } from '../shared/logger.js';

export function createCategoryRoutes(db: Database): Router {
  const router = Router();
  const controller = new CategoryController(db);
  const logger = createLogger('CategoryRoutes');

  logger.info('Setting up category routes');

  // GET /api/categories - Listar todas as categorias
  router.get('/', controller.getAllCategories);

  // GET /api/categories/active - Listar categorias ativas
  router.get('/active', controller.getActiveCategories);

  // GET /api/categories/stats - Estatísticas das categorias
  router.get('/stats', controller.getCategoryStats);

  // GET /api/categories/:id - Buscar categoria por ID
  router.get('/:id', controller.getCategoryById);

  // POST /api/categories - Criar nova categoria
  router.post('/', controller.createCategory);

  // PUT /api/categories/:id - Atualizar categoria
  router.put('/:id', controller.updateCategory);

  // DELETE /api/categories/:id - Excluir categoria
  router.delete('/:id', controller.deleteCategory);

  // PATCH /api/categories/:id/soft-delete - Desativar categoria
  router.patch('/:id/soft-delete', controller.softDeleteCategory);

  // PUT /api/categories/reorder - Reordenar categorias
  router.put('/reorder', controller.updateCategoryOrder);

  return router;
}
