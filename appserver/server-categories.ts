import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database/Database.js';
import { DatabaseConfig } from './types/database.js';
import { createLogger } from './shared/logger.js';

dotenv.config();

const logger = createLogger('CategoryServer');
const PORT = process.env.PORT || 3001;

// Database configuration
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
    logger.info('🚀 Starting Categories API Server...');

    // Create Express app
    const app = express();

    // Middleware
    app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Database connection
    const dbConfig = getDatabaseConfig();
    const db = new Database(dbConfig);
    logger.info('✅ Database connected');

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Categories API Server is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      });
    });

    // ===========================================
    // CATEGORIES API ROUTES
    // ===========================================

    /**
     * GET /api/categories
     * Lista todas as categorias
     */
    app.get('/api/categories', async (req, res) => {
      try {
        logger.info('📋 Listing categories');
        
        const { active, search } = req.query;
        
        let query = `
          SELECT 
            id, name, description, keywords, patterns, domains, 
            color, active, created_at, updated_at 
          FROM categories 
          WHERE 1=1
        `;
        const params: any[] = [];
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
        
        logger.info(`✅ Found ${result.rows.length} categories`);
        
        res.json({
          success: true,
          data: result.rows,
          meta: {
            total: result.rows.length,
            filters: { active, search }
          }
        });
      } catch (error) {
        logger.error('❌ Error listing categories:', (error as Error).message);
        res.status(500).json({
          success: false,
          error: 'Erro ao listar categorias'
        });
      }
    });

    /**
     * GET /api/categories/:id
     * Obter categoria por ID
     */
    app.get('/api/categories/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({
            success: false,
            error: 'ID da categoria deve ser um número válido'
          });
        }

        logger.info(`🔍 Getting category ${id}`);

        const result = await db.query(
          `SELECT 
            id, name, description, keywords, patterns, domains, 
            color, active, created_at, updated_at 
          FROM categories 
          WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }

        logger.info(`✅ Found category: ${result.rows[0].name}`);

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        logger.error('❌ Error getting category:', (error as Error).message);
        res.status(500).json({
          success: false,
          error: 'Erro ao obter categoria'
        });
      }
    });

    /**
     * POST /api/categories
     * Criar nova categoria
     */
    app.post('/api/categories', async (req, res) => {
      try {
        const { name, description, keywords = [], patterns = [], domains = [], color = '#3B82F6', active = true } = req.body;

        // Validação básica
        if (!name || !description) {
          return res.status(400).json({
            success: false,
            error: 'Nome e descrição são obrigatórios'
          });
        }

        logger.info(`➕ Creating category: ${name}`);

        const result = await db.query(
          `INSERT INTO categories (name, description, keywords, patterns, domains, color, active) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING id, name, description, keywords, patterns, domains, color, active, created_at, updated_at`,
          [name, description, JSON.stringify(keywords), JSON.stringify(patterns), JSON.stringify(domains), color, active]
        );

        logger.info(`✅ Category created with ID: ${result.rows[0].id}`);

        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: 'Categoria criada com sucesso'
        });
      } catch (error) {
        logger.error('❌ Error creating category:', (error as Error).message);
        
        if ((error as Error).message.includes('duplicate key')) {
          return res.status(409).json({
            success: false,
            error: 'Categoria com este nome já existe'
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Erro ao criar categoria'
        });
      }
    });

    /**
     * PUT /api/categories/:id
     * Atualizar categoria existente
     */
    app.put('/api/categories/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({
            success: false,
            error: 'ID da categoria deve ser um número válido'
          });
        }

        const updates = req.body;
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && ['name', 'description', 'color', 'active'].includes(key)) {
            fields.push(`${key} = $${paramIndex++}`);
            values.push(value);
          } else if (value !== undefined && ['keywords', 'patterns', 'domains'].includes(key)) {
            fields.push(`${key} = $${paramIndex++}`);
            values.push(JSON.stringify(value));
          }
        });

        if (fields.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Nenhum campo válido para atualizar fornecido'
          });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        logger.info(`✏️  Updating category ${id}`);

        const result = await db.query(
          `UPDATE categories 
           SET ${fields.join(', ')} 
           WHERE id = $${paramIndex} 
           RETURNING id, name, description, keywords, patterns, domains, color, active, created_at, updated_at`,
          values
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }

        logger.info(`✅ Category updated: ${result.rows[0].name}`);

        res.json({
          success: true,
          data: result.rows[0],
          message: 'Categoria atualizada com sucesso'
        });
      } catch (error) {
        logger.error('❌ Error updating category:', (error as Error).message);
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar categoria'
        });
      }
    });

    /**
     * DELETE /api/categories/:id
     * Deletar categoria (soft delete)
     */
    app.delete('/api/categories/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({
            success: false,
            error: 'ID da categoria deve ser um número válido'
          });
        }

        logger.info(`🗑️  Deleting category ${id}`);

        // Soft delete - apenas desativa a categoria
        const result = await db.query(
          `UPDATE categories 
           SET active = false, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 
           RETURNING id, name`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }

        logger.info(`✅ Category deactivated: ${result.rows[0].name}`);

        res.json({
          success: true,
          message: 'Categoria desativada com sucesso'
        });
      } catch (error) {
        logger.error('❌ Error deleting category:', (error as Error).message);
        res.status(500).json({
          success: false,
          error: 'Erro ao deletar categoria'
        });
      }
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`🎉 Categories API Server running on http://localhost:${PORT}`);
      logger.info(`📋 Available endpoints:`);
      logger.info(`   GET    /api/health`);
      logger.info(`   GET    /api/categories`);
      logger.info(`   GET    /api/categories/:id`);
      logger.info(`   POST   /api/categories`);
      logger.info(`   PUT    /api/categories/:id`);
      logger.info(`   DELETE /api/categories/:id`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('👋 Shutting down server...');
      await db.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('💥 Failed to start server:', (error as Error).message);
    process.exit(1);
  }
}

startServer();
