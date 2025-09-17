"use strict";
// =====================================================
// Portal Services - Category Routes
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryRoutes = createCategoryRoutes;
const express_1 = require("express");
const CategoryController_js_1 = require("../controllers/CategoryController.js");
const logger_js_1 = require("../shared/logger.js");
function createCategoryRoutes(db) {
    const router = (0, express_1.Router)();
    const controller = new CategoryController_js_1.CategoryController(db);
    const logger = (0, logger_js_1.createLogger)('CategoryRoutes');
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
