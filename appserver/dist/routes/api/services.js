"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServicesRoutes = createServicesRoutes;
const express_1 = require("express");
const logger_js_1 = require("../../shared/logger.js");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const logger = (0, logger_js_1.createLogger)('ServicesAPI');
// Validation schemas
const createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório').max(255),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    category: zod_1.z.string().min(1, 'Categoria é obrigatória').max(100),
    price: zod_1.z.number().min(0, 'Preço deve ser maior ou igual a zero'),
    unit: zod_1.z.string().max(50).default('hour'),
    estimated_time: zod_1.z.string().optional(),
    materials: zod_1.z.array(zod_1.z.string()).default([]),
    active: zod_1.z.boolean().default(true)
});
const updateServiceSchema = createServiceSchema.partial();
// Middleware for validation
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
            error: 'Serviço com este ID já existe'
        });
    }
    return res.status(500).json({
        success: false,
        error: `Erro interno: ${operation}`
    });
};
function createServicesRoutes(db) {
    const router = (0, express_1.Router)();
    /**
     * @route GET /api/services
     * @desc Listar todos os serviços
     */
    router.get('/', async (req, res) => {
        try {
            const { active, category, search, sort = 'name', order = 'ASC' } = req.query;
            let query = `
        SELECT 
          id, name, description, category, price, unit, 
          estimated_time, materials, active, created_at, updated_at 
        FROM services 
        WHERE 1=1
      `;
            const params = [];
            let paramIndex = 1;
            if (active !== undefined) {
                query += ` AND active = $${paramIndex++}`;
                params.push(active === 'true');
            }
            if (category) {
                query += ` AND category = $${paramIndex++}`;
                params.push(category);
            }
            if (search) {
                query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm);
            }
            // Validar campo de ordenação
            const validSortFields = ['name', 'category', 'price', 'created_at'];
            const sortField = validSortFields.includes(sort) ? sort : 'name';
            const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortField} ${sortOrder}`;
            const result = await db.query(query, params);
            res.json({
                success: true,
                data: result.rows,
                meta: {
                    total: result.rows.length,
                    filters: { active, category, search },
                    sort: { field: sortField, order: sortOrder }
                }
            });
        }
        catch (error) {
            handleError(error, 'listar serviços', res);
        }
    });
    /**
     * @route GET /api/services/:id
     * @desc Obter serviço por ID
     */
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query(`SELECT 
          id, name, description, category, price, unit, 
          estimated_time, materials, active, created_at, updated_at 
        FROM services 
        WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Serviço não encontrado'
                });
            }
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            handleError(error, 'obter serviço', res);
        }
    });
    /**
     * @route GET /api/services/category/:category
     * @desc Obter serviços por categoria
     */
    router.get('/category/:category', async (req, res) => {
        try {
            const { category } = req.params;
            const { active = 'true' } = req.query;
            const result = await db.query(`SELECT 
          id, name, description, category, price, unit, 
          estimated_time, materials, active, created_at, updated_at 
        FROM services 
        WHERE category = $1 AND active = $2
        ORDER BY name ASC`, [category, active === 'true']);
            res.json({
                success: true,
                data: result.rows,
                meta: {
                    category,
                    total: result.rows.length
                }
            });
        }
        catch (error) {
            handleError(error, 'obter serviços por categoria', res);
        }
    });
    /**
     * @route POST /api/services
     * @desc Criar novo serviço
     */
    router.post('/', validateBody(createServiceSchema), async (req, res) => {
        try {
            const { name, description, category, price, unit, estimated_time, materials, active } = req.body;
            const id = (0, uuid_1.v4)();
            const result = await db.query(`INSERT INTO services (id, name, description, category, price, unit, estimated_time, materials, active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id, name, description, category, price, unit, estimated_time, materials, active, created_at, updated_at`, [id, name, description, category, price, unit, estimated_time, JSON.stringify(materials), active]);
            logger.info('Service created', { id, name, category });
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Serviço criado com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'criar serviço', res);
        }
    });
    /**
     * @route PUT /api/services/:id
     * @desc Atualizar serviço existente
     */
    router.put('/:id', validateBody(updateServiceSchema), async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'materials') {
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
            const result = await db.query(`UPDATE services 
         SET ${fields.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, description, category, price, unit, estimated_time, materials, active, created_at, updated_at`, values);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Serviço não encontrado'
                });
            }
            logger.info('Service updated', { id, updates: Object.keys(updates) });
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Serviço atualizado com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'atualizar serviço', res);
        }
    });
    /**
     * @route DELETE /api/services/:id
     * @desc Deletar serviço (soft delete)
     */
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            // Soft delete - apenas desativa o serviço
            const result = await db.query(`UPDATE services 
         SET active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Serviço não encontrado'
                });
            }
            logger.info('Service deactivated', { id, name: result.rows[0].name });
            res.json({
                success: true,
                message: 'Serviço desativado com sucesso'
            });
        }
        catch (error) {
            handleError(error, 'deletar serviço', res);
        }
    });
    /**
     * @route PATCH /api/services/:id/toggle
     * @desc Alternar status ativo/inativo do serviço
     */
    router.patch('/:id/toggle', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query(`UPDATE services 
         SET active = NOT active, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name, active`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Serviço não encontrado'
                });
            }
            const service = result.rows[0];
            logger.info('Service status toggled', { id, name: service.name, active: service.active });
            res.json({
                success: true,
                data: { id: service.id, active: service.active },
                message: `Serviço ${service.active ? 'ativado' : 'desativado'} com sucesso`
            });
        }
        catch (error) {
            handleError(error, 'alternar status do serviço', res);
        }
    });
    return router;
}
