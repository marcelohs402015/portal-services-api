"use strict";
// =====================================================
// Portal Services - Category Controller
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CategoryService_js_1 = require("../services/CategoryService.js");
const logger_js_1 = require("../shared/logger.js");
class CategoryController {
    constructor(db) {
        // GET /api/categories
        this.getAllCategories = async (req, res) => {
            try {
                const params = {
                    page: req.query.page ? parseInt(req.query.page) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                    offset: req.query.offset ? parseInt(req.query.offset) : undefined,
                    sort_by: req.query.sort_by,
                    sort_order: req.query.sort_order,
                    search: req.query.search,
                    active: req.query.active ? req.query.active === 'true' : undefined
                };
                const result = await this.service.getAllCategories(params);
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getAllCategories controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/categories/active
        this.getActiveCategories = async (req, res) => {
            try {
                const result = await this.service.getActiveCategories();
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getActiveCategories controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/categories/:id
        this.getCategoryById = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.getCategoryById(id);
                if (result.success) {
                    if (result.data) {
                        res.json(result);
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Categoria não encontrada'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getCategoryById controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // POST /api/categories
        this.createCategory = async (req, res) => {
            try {
                const result = await this.service.createCategory(req.body);
                if (result.success) {
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in createCategory controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // PUT /api/categories/:id
        this.updateCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.updateCategory(id, req.body);
                if (result.success) {
                    if (result.data) {
                        res.json(result);
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Categoria não encontrada'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in updateCategory controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // DELETE /api/categories/:id
        this.deleteCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.deleteCategory(id);
                if (result.success) {
                    res.json({
                        success: true,
                        message: 'Categoria excluída com sucesso'
                    });
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in deleteCategory controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // PATCH /api/categories/:id/soft-delete
        this.softDeleteCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.softDeleteCategory(id);
                if (result.success) {
                    if (result.data) {
                        res.json({
                            success: true,
                            message: 'Categoria desativada com sucesso',
                            data: result.data
                        });
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Categoria não encontrada'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in softDeleteCategory controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // PUT /api/categories/reorder
        this.updateCategoryOrder = async (req, res) => {
            try {
                const { categoryIds } = req.body;
                const result = await this.service.updateCategoryOrder(categoryIds);
                if (result.success) {
                    res.json({
                        success: true,
                        message: 'Ordem das categorias atualizada com sucesso'
                    });
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in updateCategoryOrder controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/categories/stats
        this.getCategoryStats = async (req, res) => {
            try {
                const result = await this.service.getCategoryStats();
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getCategoryStats controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        this.service = new CategoryService_js_1.CategoryService(db);
        this.logger = (0, logger_js_1.createLogger)('CategoryController');
    }
}
exports.CategoryController = CategoryController;
