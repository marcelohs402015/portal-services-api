import { Router } from 'express';
import { createLogger } from '../../shared/logger.js';
import { z } from 'zod';
const logger = createLogger('CategoriesAPI');
// Validation schemas
const createCategorySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255),
    description: z.string().min(1, 'Descrição é obrigatória'),
    keywords: z.array(z.string()).default([]),
    patterns: z.array(z.string()).default([]),
    domains: z.array(z.string()).default([]),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').default('#3B82F6'),
    active: z.boolean().default(true)
});
const updateCategorySchema = createCategorySchema.partial();
// Middleware for validation
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    };
};
// Error handler
const handleError = (error, operation, res) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to ${operation}`, { error: errorMessage });
    if (errorMessage.includes('duplicate key')) {
        return res.status(409).json({
            success: false,
            error: 'Categoria com este nome já existe'
        });
    }
    return res.status(500).json({
        success: false,
        error: `Erro interno: ${operation}`
    });
};
export function createCategoriesRoutes(db) {
    const router = Router();
    /**
     * @route GET /api/categories
     * @desc Listar todas as categorias
     */
    router.get('/', async (req, res) => {
        try {
            const { active, search } = req.query;
            let query = `
        SELECT 
          id, name, description, keywords, patterns, domains, 
          color, active, created_at, updated_at 
        FROM categories 
        WHERE 1=1
      `;
            const params = [];
            let paramIndex = 1;
            if (active !== undefined) {
                query += ` AND active = $${paramIndex++}`;
                params.push(active === 'true');
            }
            if (search) {
                query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm);
            }
            query += ` ORDER BY name ASC`;
            const result = await db.query(query, params);
            res.json({
                success: true,
                data: result.rows,
                meta: {
                    total: result.rows.length,
                    filters: { active, search }
                }
            });
        }
        catch (error) {
            handleError(error, 'listar categorias', res);
        }
    });
    /**
     * @route GET /api/categories/:id
     * @desc Obter categoria por ID
     */
    router.get('/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID da categoria deve ser um número válido'
                });
            }
            const result = await db.query(`SELECT 
          id, name, description, keywords, patterns, domains, 
          color, active, created_at, updated_at 
        FROM categories 
        WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Categoria não encontrada'
                });
            }
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            handleError(error, 'obter categoria', res);
        }
    });
    /**
     * @route POST /api/categories
     * @desc Criar nova categoria
     */
    router.post('/', validateBody(createCategorySchema), async (req, res) => {
        try {
            const { name, description, keywords, patterns, domains, color, active } = req.body;
            const result = await db.query(`INSERT INTO categories (name, description, keywords, patterns, domains, color, active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, name, description, keywords, patterns, domains, color, active, created_at, updated_at`, [name, description, JSON.stringify(keywords), JSON.stringify(patterns), JSON.stringify(domains), color, active]);
            logger.info('Category created', { id: result.rows[0].id, name });
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Categoria criada com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'criar categoria', res);
        }
    });
    /**
     * @route PUT /api/categories/:id
     * @desc Atualizar categoria existente
     */
    router.put('/:id', validateBody(updateCategorySchema), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID da categoria deve ser um número válido'
                });
            }
            const updates = req.body;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (['keywords', 'patterns', 'domains'].includes(key)) {
                        fields.push(`${key} = $${paramIndex++}`);
                        values.push(JSON.stringify(value));
                    }
                    else {
                        fields.push(`${key} = $${paramIndex++}`);
                        values.push(value);
                    }
                }
            });
            if (fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Nenhum campo para atualizar fornecido'
                });
            }
            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);
            const result = await db.query(`UPDATE categories 
         SET ${fields.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, description, keywords, patterns, domains, color, active, created_at, updated_at`, values);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Categoria não encontrada'
                });
            }
            logger.info('Category updated', { id, updates: Object.keys(updates) });
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Categoria atualizada com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'atualizar categoria', res);
        }
    });
    /**
     * @route DELETE /api/categories/:id
     * @desc Deletar categoria (soft delete)
     */
    router.delete('/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID da categoria deve ser um número válido'
                });
            }
            // Soft delete - apenas desativa a categoria
            const result = await db.query(`UPDATE categories 
         SET active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Categoria não encontrada'
                });
            }
            logger.info('Category deactivated', { id, name: result.rows[0].name });
            res.json({
                success: true,
                message: 'Categoria desativada com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'deletar categoria', res);
        }
    });
    return router;
}
//# sourceMappingURL=categories.js.map