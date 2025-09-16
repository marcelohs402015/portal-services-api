"use strict";
// =====================================================
// Portal Services - Category Service
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const CategoryRepository_js_1 = require("../repositories/CategoryRepository.js");
const entities_js_1 = require("../types/entities.js");
const logger_js_1 = require("../shared/logger.js");
const zod_1 = require("zod");
class CategoryService {
    constructor(db) {
        this.repository = new CategoryRepository_js_1.CategoryRepository(db);
        this.logger = (0, logger_js_1.createLogger)('CategoryService');
    }
    async getAllCategories(params = {}) {
        try {
            this.logger.info('Getting all categories', { params });
            return await this.repository.findAll(params);
        }
        catch (error) {
            this.logger.error('Error getting all categories:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getCategoryById(id) {
        try {
            this.logger.info('Getting category by id', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Category ID is required'
                };
            }
            return await this.repository.findById(id);
        }
        catch (error) {
            this.logger.error('Error getting category by id:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getActiveCategories() {
        try {
            this.logger.info('Getting active categories');
            return await this.repository.findActive();
        }
        catch (error) {
            this.logger.error('Error getting active categories:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async createCategory(dto) {
        try {
            this.logger.info('Creating category', { name: dto.name });
            // Validar dados de entrada
            const validatedData = entities_js_1.CreateCategorySchema.parse(dto);
            // Verificar se já existe uma categoria com o mesmo nome
            const existingCategory = await this.repository.findByName(validatedData.name);
            if (existingCategory.success && existingCategory.data) {
                return {
                    success: false,
                    error: 'Já existe uma categoria com este nome'
                };
            }
            // Se não foi especificado sort_order, pegar o próximo
            if (!validatedData.sort_order) {
                const nextOrder = await this.repository.getNextSortOrder();
                validatedData.sort_order = nextOrder;
            }
            return await this.repository.create(validatedData);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessage = error.errors.map(e => e.message).join(', ');
                this.logger.error('Validation error creating category:', errorMessage);
                return {
                    success: false,
                    error: `Dados inválidos: ${errorMessage}`
                };
            }
            this.logger.error('Error creating category:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async updateCategory(id, dto) {
        try {
            this.logger.info('Updating category', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Category ID is required'
                };
            }
            // Validar dados de entrada
            const validatedData = entities_js_1.UpdateCategorySchema.parse(dto);
            // Se está alterando o nome, verificar se já existe
            if (validatedData.name) {
                const existingCategory = await this.repository.findByName(validatedData.name);
                if (existingCategory.success && existingCategory.data && existingCategory.data.id !== id) {
                    return {
                        success: false,
                        error: 'Já existe uma categoria com este nome'
                    };
                }
            }
            return await this.repository.update(id, validatedData);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessage = error.errors.map(e => e.message).join(', ');
                this.logger.error('Validation error updating category:', errorMessage);
                return {
                    success: false,
                    error: `Dados inválidos: ${errorMessage}`
                };
            }
            this.logger.error('Error updating category:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async deleteCategory(id) {
        try {
            this.logger.info('Deleting category', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Category ID is required'
                };
            }
            // Verificar se a categoria tem serviços associados
            const hasServices = await this.checkCategoryHasServices(id);
            if (hasServices) {
                return {
                    success: false,
                    error: 'Não é possível excluir uma categoria que possui serviços associados'
                };
            }
            return await this.repository.delete(id);
        }
        catch (error) {
            this.logger.error('Error deleting category:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async softDeleteCategory(id) {
        try {
            this.logger.info('Soft deleting category', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Category ID is required'
                };
            }
            return await this.repository.softDelete(id);
        }
        catch (error) {
            this.logger.error('Error soft deleting category:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async updateCategoryOrder(categoryIds) {
        try {
            this.logger.info('Updating category order', { categoryIds });
            if (!categoryIds || categoryIds.length === 0) {
                return {
                    success: false,
                    error: 'Lista de IDs de categorias é obrigatória'
                };
            }
            // Verificar se todos os IDs existem
            for (const id of categoryIds) {
                const exists = await this.repository.exists(id);
                if (!exists.success || !exists.data) {
                    return {
                        success: false,
                        error: `Categoria com ID ${id} não encontrada`
                    };
                }
            }
            // Atualizar sort_order para cada categoria
            const results = [];
            for (let i = 0; i < categoryIds.length; i++) {
                const result = await this.repository.updateSortOrder(categoryIds[i], i + 1);
                results.push(result);
            }
            return {
                success: true,
                data: results.every(r => r.success),
                message: 'Categorias reordenadas com sucesso'
            };
        }
        catch (error) {
            this.logger.error('Error updating category order:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getCategoryStats() {
        try {
            this.logger.info('Getting category stats');
            const [totalResult, activeResult] = await Promise.all([
                this.repository.count(),
                this.repository.count({ active: true })
            ]);
            if (!totalResult.success || !activeResult.success) {
                return {
                    success: false,
                    error: 'Erro ao obter estatísticas das categorias'
                };
            }
            return {
                success: true,
                data: {
                    total: totalResult.data || 0,
                    active: activeResult.data || 0,
                    inactive: (totalResult.data || 0) - (activeResult.data || 0)
                }
            };
        }
        catch (error) {
            this.logger.error('Error getting category stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async checkCategoryHasServices(categoryId) {
        try {
            const query = 'SELECT 1 FROM services WHERE category_id = $1 AND active = true LIMIT 1';
            const result = await this.repository['executeQuery'](query, [categoryId]);
            return result.length > 0;
        }
        catch (error) {
            this.logger.error('Error checking if category has services:', error);
            return false;
        }
    }
}
exports.CategoryService = CategoryService;
