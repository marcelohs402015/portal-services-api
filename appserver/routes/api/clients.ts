import { Router, Request, Response, NextFunction } from 'express';
import { Database } from '../../database/Database.js';
import { createLogger } from '../../shared/logger.js';
import { z } from 'zod';

const logger = createLogger('ClientsAPI');

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email deve ter formato válido').max(255),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

const updateClientSchema = createClientSchema.partial();

// Middleware for validation
const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
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
const handleError = (error: unknown, operation: string, res: Response) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Failed to ${operation}`, { error: errorMessage });
  
  if (errorMessage.includes('duplicate key') && errorMessage.includes('email')) {
    return res.status(409).json({
      success: false,
      error: 'Cliente com este email já existe'
    });
  }
  
  return res.status(500).json({
    success: false,
    error: `Erro interno: ${operation}`
  });
};

export function createClientsRoutes(db: Database): Router {
  const router = Router();

  /**
   * @route GET /api/clients
   * @desc Listar todos os clientes
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { search, sort = 'name', order = 'ASC', page = '1', limit = '50' } = req.query;
      
      let query = `
        SELECT 
          id, name, email, phone, address, notes, created_at, updated_at 
        FROM clients 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++} OR phone ILIKE $${paramIndex++})`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Validar campo de ordenação
      const validSortFields = ['name', 'email', 'created_at'];
      const sortField = validSortFields.includes(sort as string) ? sort : 'name';
      const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
      
      query += ` ORDER BY ${sortField} ${sortOrder}`;

      // Paginação
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
      const offset = (pageNum - 1) * limitNum;

      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limitNum, offset);

      const result = await db.query(query, params);

      // Contar total de registros
      let countQuery = `SELECT COUNT(*) as total FROM clients WHERE 1=1`;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex++} OR email ILIKE $${countParamIndex++} OR phone ILIKE $${countParamIndex++})`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      
      res.json({
        success: true,
        data: result.rows,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          filters: { search },
          sort: { field: sortField, order: sortOrder }
        }
      });
    } catch (error) {
      handleError(error, 'listar clientes', res);
    }
  });

  /**
   * @route GET /api/clients/:id
   * @desc Obter cliente por ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID do cliente deve ser um número válido'
        });
      }

      const result = await db.query(
        `SELECT 
          id, name, email, phone, address, notes, created_at, updated_at 
        FROM clients 
        WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleError(error, 'obter cliente', res);
    }
  });

  /**
   * @route GET /api/clients/email/:email
   * @desc Obter cliente por email
   */
  router.get('/email/:email', async (req: Request, res: Response) => {
    try {
      const { email } = req.params;

      const result = await db.query(
        `SELECT 
          id, name, email, phone, address, notes, created_at, updated_at 
        FROM clients 
        WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleError(error, 'obter cliente por email', res);
    }
  });

  /**
   * @route POST /api/clients
   * @desc Criar novo cliente
   */
  router.post('/', validateBody(createClientSchema), async (req: Request, res: Response) => {
    try {
      const { name, email, phone, address, notes } = req.body;

      const result = await db.query(
        `INSERT INTO clients (name, email, phone, address, notes) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, phone, address, notes, created_at, updated_at`,
        [name, email, phone || null, address || null, notes || null]
      );

      logger.info('Client created', { id: result.rows[0].id, name, email });

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Cliente criado com sucesso'
      });
    } catch (error) {
      handleError(error, 'criar cliente', res);
    }
  });

  /**
   * @route PUT /api/clients/:id
   * @desc Atualizar cliente existente
   */
  router.put('/:id', validateBody(updateClientSchema), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID do cliente deve ser um número válido'
        });
      }

      const updates = req.body;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(value);
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

      const result = await db.query(
        `UPDATE clients 
         SET ${fields.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, email, phone, address, notes, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      logger.info('Client updated', { id, updates: Object.keys(updates) });

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Cliente atualizado com sucesso'
      });
    } catch (error) {
      handleError(error, 'atualizar cliente', res);
    }
  });

  /**
   * @route DELETE /api/clients/:id
   * @desc Deletar cliente
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID do cliente deve ser um número válido'
        });
      }

      // Verificar se o cliente tem orçamentos ou agendamentos
      const dependenciesCheck = await db.query(
        `SELECT 
          (SELECT COUNT(*) FROM quotations WHERE client_email = (SELECT email FROM clients WHERE id = $1)) as quotations,
          (SELECT COUNT(*) FROM appointments WHERE client_id = $1::text) as appointments`,
        [id]
      );

      const { quotations, appointments } = dependenciesCheck.rows[0];
      
      if (parseInt(quotations) > 0 || parseInt(appointments) > 0) {
        return res.status(409).json({
          success: false,
          error: 'Não é possível deletar cliente com orçamentos ou agendamentos associados',
          details: {
            quotations: parseInt(quotations),
            appointments: parseInt(appointments)
          }
        });
      }

      const result = await db.query(
        `DELETE FROM clients 
         WHERE id = $1 
         RETURNING id, name`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      logger.info('Client deleted', { id, name: result.rows[0].name });

      res.json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      handleError(error, 'deletar cliente', res);
    }
  });

  /**
   * @route GET /api/clients/:id/history
   * @desc Obter histórico de orçamentos e agendamentos do cliente
   */
  router.get('/:id/history', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID do cliente deve ser um número válido'
        });
      }

      // Verificar se cliente existe
      const clientResult = await db.query(
        'SELECT email FROM clients WHERE id = $1',
        [id]
      );

      if (clientResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      const clientEmail = clientResult.rows[0].email;

      // Buscar orçamentos
      const quotationsResult = await db.query(
        `SELECT id, services, subtotal, discount, total, status, valid_until, created_at 
         FROM quotations 
         WHERE client_email = $1 
         ORDER BY created_at DESC`,
        [clientEmail]
      );

      // Buscar agendamentos
      const appointmentsResult = await db.query(
        `SELECT id, service_ids, service_names, date, time, duration, status, created_at 
         FROM appointments 
         WHERE client_id = $1 
         ORDER BY date DESC, time DESC`,
        [id.toString()]
      );

      res.json({
        success: true,
        data: {
          quotations: quotationsResult.rows,
          appointments: appointmentsResult.rows
        },
        meta: {
          totalQuotations: quotationsResult.rows.length,
          totalAppointments: appointmentsResult.rows.length
        }
      });
    } catch (error) {
      handleError(error, 'obter histórico do cliente', res);
    }
  });

  return router;
}
