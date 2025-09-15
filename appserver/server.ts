import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { createLogger } from './shared/logger';

// Criar logger
const logger = createLogger('portal-services-server');

// Carregar variáveis de ambiente
dotenv.config();

const { Pool } = pkg;

console.log('🚀 Iniciando Portal Services Server...');

const app = express();
const PORT = process.env.PORT || 3001;

// Database config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

console.log('🔧 Configuração do banco:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middlewares configurados');

// Test database connection
pool.query('SELECT 1').then(() => {
  console.log('✅ Banco de dados conectado');
  logger.info('Database connection established');
}).catch(err => {
  console.log('❌ Erro na conexão com banco:', err.message);
  logger.error('Database connection failed', { error: err.message });
});

// Health check
app.get('/health', (req, res) => {
  console.log('📋 Health check solicitado');
  res.json({
    success: true,
    message: 'Portal Services API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Health Check',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// GET /api/categories - Lista todas as categorias
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📋 Listando categorias...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    console.log(`✅ Encontradas ${result.rows.length} categorias`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    logger.error('Error listing categories', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/categories/:id - Obter categoria por ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    console.log(`🔍 Buscando categoria ID: ${id}`);
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    console.log(`✅ Categoria encontrada: ${result.rows[0].name}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categoria:', error);
    logger.error('Error fetching category', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/categories - Criar nova categoria
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, color = '#3B82F6', active = true } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Nome e descrição são obrigatórios'
      });
    }

    console.log(`➕ Criando categoria: ${name}`);
    const result = await pool.query(
      'INSERT INTO categories (name, description, color, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, color, active]
    );

    console.log(`✅ Categoria criada com ID: ${result.rows[0].id}`);
    logger.info('Category created', { id: result.rows[0].id, name });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    logger.error('Error creating category', { error: (error as Error).message });
    
    if ((error as Error).message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Categoria com este nome já existe'
      });
    }
    
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/categories/:id - Atualizar categoria
app.put('/api/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    const { name, description, color, active } = req.body;
    
    console.log(`✏️  Atualizando categoria ID: ${id}`);
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, color = $3, active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, color, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    console.log(`✅ Categoria atualizada: ${result.rows[0].name}`);
    logger.info('Category updated', { id, name: result.rows[0].name });
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Categoria atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    logger.error('Error updating category', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/categories/:id - Deletar categoria (soft delete)
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    console.log(`🗑️  Desativando categoria ID: ${id}`);
    const result = await pool.query(
      'UPDATE categories SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    console.log(`✅ Categoria desativada: ${result.rows[0].name}`);
    logger.info('Category deactivated', { id, name: result.rows[0].name });
    res.json({
      success: true,
      message: 'Categoria desativada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao desativar categoria:', error);
    logger.error('Error deactivating category', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/clients - Lista todos os clientes
app.get('/api/clients', async (req, res) => {
  try {
    console.log('📋 Listando clientes...');
    const result = await pool.query('SELECT * FROM clients ORDER BY name ASC');
    console.log(`✅ Encontrados ${result.rows.length} clientes`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
    logger.error('Error listing clients', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/services - Lista todos os serviços
app.get('/api/services', async (req, res) => {
  try {
    console.log('📋 Listando serviços...');
    const result = await pool.query('SELECT * FROM services ORDER BY name ASC');
    console.log(`✅ Encontrados ${result.rows.length} serviços`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar serviços:', error);
    logger.error('Error listing services', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', error);
  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎉 Portal Services Server rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/categories`);
  console.log(`   GET    /api/categories/:id`);
  console.log(`   POST   /api/categories`);
  console.log(`   PUT    /api/categories/:id`);
  console.log(`   DELETE /api/categories/:id`);
  console.log(`   GET    /api/clients`);
  console.log(`   GET    /api/services`);
  console.log(`\n🧪 Para testar:`);
  console.log(`   Health: GET http://localhost:${PORT}/health`);
  console.log(`   Categories: GET http://localhost:${PORT}/api/categories`);
  console.log(`   Clients: GET http://localhost:${PORT}/api/clients`);
  console.log(`   Services: GET http://localhost:${PORT}/api/services`);
  
  logger.info('Server started', { port: PORT, environment: process.env.NODE_ENV });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Encerrando servidor...');
  logger.info('Server shutting down');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Encerrando servidor (SIGTERM)...');
  logger.info('Server shutting down (SIGTERM)');
  await pool.end();
  process.exit(0);
});
