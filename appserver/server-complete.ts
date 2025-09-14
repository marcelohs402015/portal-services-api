import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database/Database.js';
import { DatabaseConfig } from './types/database.js';
import { createLogger } from './shared/logger.js';

// Carregar variáveis de ambiente
dotenv.config();

const logger = createLogger('CompleteServer');
const PORT = process.env.PORT || 3001;

// Configuração do banco de dados
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portalservicesdb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    ssl: (process.env.DB_SSL || 'false') === 'true'
  } as any;
}

async function startServer() {
  try {
    logger.info('🚀 Iniciando Postal Services Complete Server...');

    // Criar aplicação Express
    const app = express();

    // Middleware
    app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Conectar ao banco de dados
    const dbConfig = getDatabaseConfig();
    const db = new Database(dbConfig);
    logger.info('✅ Database connected');

    // ===========================================
    // HEALTH CHECK
    // ===========================================
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        database: 'postgresql'
      });
    });

    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Postal Services API funcionando!',
        timestamp: new Date().toISOString(),
        database: 'connected',
        apis: ['emails', 'categories', 'services', 'clients', 'calendar', 'quotations']
      });
    });

    // ===========================================
    // EMAILS API
    // ===========================================
    app.get('/api/emails', async (req, res) => {
      try {
        logger.info('📧 Listando emails');
        const result = await db.query(`
          SELECT id, subject, sender, recipient, body, status, created_at, updated_at 
          FROM emails 
          ORDER BY created_at DESC 
          LIMIT 50
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar emails:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar emails'
        });
      }
    });

    app.get('/api/emails/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`📧 Buscando email ${id}`);
        
        const result = await db.query(`
          SELECT * FROM emails WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Email não encontrado'
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        logger.error('Erro ao buscar email:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar email'
        });
      }
    });

    app.post('/api/emails', async (req, res) => {
      try {
        const { subject, sender, recipient, body, status = 'pending' } = req.body;
        logger.info(`📧 Criando email: ${subject}`);
        
        const result = await db.query(`
          INSERT INTO emails (subject, sender, recipient, body, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `, [subject, sender, recipient, body, status]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Email criado com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar email:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar email'
        });
      }
    });

    // ===========================================
    // CATEGORIES API
    // ===========================================
    app.get('/api/categories', async (req, res) => {
      try {
        logger.info('📋 Listando categorias');
        const result = await db.query(`
          SELECT id, name, description, color, active, created_at, updated_at 
          FROM categories 
          WHERE active = true 
          ORDER BY name ASC
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar categorias:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar categorias'
        });
      }
    });

    app.get('/api/categories/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`📋 Buscando categoria ${id}`);
        
        const result = await db.query(`
          SELECT * FROM categories WHERE id = $1
        `, [id]);
        
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
      } catch (error) {
        logger.error('Erro ao buscar categoria:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar categoria'
        });
      }
    });

    app.post('/api/categories', async (req, res) => {
      try {
        const { name, description, color = '#FF6B6B' } = req.body;
        logger.info(`📋 Criando categoria: ${name}`);
        
        const result = await db.query(`
          INSERT INTO categories (name, description, color, active, created_at, updated_at)
          VALUES ($1, $2, $3, true, NOW(), NOW())
          RETURNING *
        `, [name, description, color]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Categoria criada com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar categoria:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar categoria'
        });
      }
    });

    app.put('/api/categories/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, color, active } = req.body;
        logger.info(`📋 Atualizando categoria ${id}`);
        
        const result = await db.query(`
          UPDATE categories 
          SET name = COALESCE($1, name),
              description = COALESCE($2, description),
              color = COALESCE($3, color),
              active = COALESCE($4, active),
              updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `, [name, description, color, active, id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0],
          message: 'Categoria atualizada com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao atualizar categoria:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar categoria'
        });
      }
    });

    app.delete('/api/categories/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`📋 Deletando categoria ${id}`);
        
        const result = await db.query(`
          UPDATE categories 
          SET active = false, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }
        
        res.json({
          success: true,
          message: 'Categoria desativada com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao deletar categoria:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao deletar categoria'
        });
      }
    });

    // ===========================================
    // SERVICES API
    // ===========================================
    app.get('/api/services', async (req, res) => {
      try {
        logger.info('🔧 Listando serviços');
        const result = await db.query(`
          SELECT s.id, s.name, s.description, s.price, s.duration, s.active,
                 c.name as category_name, c.color as category_color,
                 s.created_at, s.updated_at
          FROM services s
          LEFT JOIN categories c ON s.category_id = c.id
          WHERE s.active = true
          ORDER BY s.name ASC
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar serviços:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar serviços'
        });
      }
    });

    app.get('/api/services/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`🔧 Buscando serviço ${id}`);
        
        const result = await db.query(`
          SELECT s.*, c.name as category_name, c.color as category_color
          FROM services s
          LEFT JOIN categories c ON s.category_id = c.id
          WHERE s.id = $1
        `, [id]);
        
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
      } catch (error) {
        logger.error('Erro ao buscar serviço:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar serviço'
        });
      }
    });

    app.post('/api/services', async (req, res) => {
      try {
        const { name, description, price, duration, category_id } = req.body;
        logger.info(`🔧 Criando serviço: ${name}`);
        
        const result = await db.query(`
          INSERT INTO services (name, description, price, duration, category_id, active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING *
        `, [name, description, price, duration, category_id]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Serviço criado com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar serviço:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar serviço'
        });
      }
    });

    // ===========================================
    // CLIENTS API
    // ===========================================
    app.get('/api/clients', async (req, res) => {
      try {
        logger.info('👥 Listando clientes');
        const result = await db.query(`
          SELECT id, name, email, phone, address, created_at, updated_at
          FROM clients
          ORDER BY name ASC
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar clientes:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar clientes'
        });
      }
    });

    app.get('/api/clients/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`👥 Buscando cliente ${id}`);
        
        const result = await db.query(`
          SELECT * FROM clients WHERE id = $1
        `, [id]);
        
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
        logger.error('Erro ao buscar cliente:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar cliente'
        });
      }
    });

    app.post('/api/clients', async (req, res) => {
      try {
        const { name, email, phone, address } = req.body;
        logger.info(`👥 Criando cliente: ${name}`);
        
        const result = await db.query(`
          INSERT INTO clients (name, email, phone, address, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *
        `, [name, email, phone, address]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Cliente criado com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar cliente:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar cliente'
        });
      }
    });

    // ===========================================
    // CALENDAR/APPOINTMENTS API
    // ===========================================
    app.get('/api/appointments', async (req, res) => {
      try {
        logger.info('📅 Listando agendamentos');
        const result = await db.query(`
          SELECT a.id, a.title, a.description, a.start_date, a.end_date, a.status,
                 c.name as client_name, c.email as client_email,
                 s.name as service_name,
                 a.created_at, a.updated_at
          FROM appointments a
          LEFT JOIN clients c ON a.client_id = c.id
          LEFT JOIN services s ON a.service_id = s.id
          ORDER BY a.start_date ASC
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar agendamentos:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar agendamentos'
        });
      }
    });

    app.get('/api/appointments/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`📅 Buscando agendamento ${id}`);
        
        const result = await db.query(`
          SELECT a.*, c.name as client_name, c.email as client_email,
                 s.name as service_name
          FROM appointments a
          LEFT JOIN clients c ON a.client_id = c.id
          LEFT JOIN services s ON a.service_id = s.id
          WHERE a.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Agendamento não encontrado'
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        logger.error('Erro ao buscar agendamento:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar agendamento'
        });
      }
    });

    app.post('/api/appointments', async (req, res) => {
      try {
        const { title, description, start_date, end_date, client_id, service_id, status = 'scheduled' } = req.body;
        logger.info(`📅 Criando agendamento: ${title}`);
        
        const result = await db.query(`
          INSERT INTO appointments (title, description, start_date, end_date, client_id, service_id, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING *
        `, [title, description, start_date, end_date, client_id, service_id, status]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Agendamento criado com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar agendamento:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar agendamento'
        });
      }
    });

    // ===========================================
    // QUOTATIONS API
    // ===========================================
    app.get('/api/quotations', async (req, res) => {
      try {
        logger.info('💰 Listando orçamentos');
        const result = await db.query(`
          SELECT q.id, q.title, q.description, q.total_amount, q.status,
                 c.name as client_name, c.email as client_email,
                 q.created_at, q.updated_at
          FROM quotations q
          LEFT JOIN clients c ON q.client_id = c.id
          ORDER BY q.created_at DESC
        `);
        
        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        logger.error('Erro ao listar orçamentos:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar orçamentos'
        });
      }
    });

    app.get('/api/quotations/:id', async (req, res) => {
      try {
        const { id } = req.params;
        logger.info(`💰 Buscando orçamento ${id}`);
        
        const result = await db.query(`
          SELECT q.*, c.name as client_name, c.email as client_email
          FROM quotations q
          LEFT JOIN clients c ON q.client_id = c.id
          WHERE q.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Orçamento não encontrado'
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        logger.error('Erro ao buscar orçamento:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar orçamento'
        });
      }
    });

    app.post('/api/quotations', async (req, res) => {
      try {
        const { title, description, total_amount, client_id, status = 'draft' } = req.body;
        logger.info(`💰 Criando orçamento: ${title}`);
        
        const result = await db.query(`
          INSERT INTO quotations (title, description, total_amount, client_id, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `, [title, description, total_amount, client_id, status]);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Orçamento criado com sucesso'
        });
      } catch (error) {
        logger.error('Erro ao criar orçamento:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar orçamento'
        });
      }
    });

    // ===========================================
    // STATS API
    // ===========================================
    app.get('/api/stats', async (req, res) => {
      try {
        logger.info('📊 Gerando estatísticas');
        
        // Contar registros
        const [clientsCount, servicesCount, appointmentsCount, quotationsCount, emailsCount] = await Promise.all([
          db.query('SELECT COUNT(*) as count FROM clients'),
          db.query('SELECT COUNT(*) as count FROM services WHERE active = true'),
          db.query('SELECT COUNT(*) as count FROM appointments'),
          db.query('SELECT COUNT(*) as count FROM quotations'),
          db.query('SELECT COUNT(*) as count FROM emails')
        ]);
        
        res.json({
          success: true,
          data: {
            clients: parseInt(clientsCount.rows[0].count),
            services: parseInt(servicesCount.rows[0].count),
            appointments: parseInt(appointmentsCount.rows[0].count),
            quotations: parseInt(quotationsCount.rows[0].count),
            emails: parseInt(emailsCount.rows[0].count)
          }
        });
      } catch (error) {
        logger.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao gerar estatísticas'
        });
      }
    });

    // ===========================================
    // ERROR HANDLING
    // ===========================================
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error.message, { stack: error.stack });
      
      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    });

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🎉 Postal Services Complete Server running on port ${PORT}`);
      logger.info(`📍 Health check: http://localhost:${PORT}/health`);
      logger.info(`📍 API base URL: http://localhost:${PORT}/api`);
      logger.info(`📋 Available APIs: emails, categories, services, clients, appointments, quotations, stats`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Received shutdown signal, closing server...');
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', (error as Error).message);
    process.exit(1);
  }
}

// Iniciar o servidor
if (require.main === module) {
  startServer().catch(error => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { startServer };
