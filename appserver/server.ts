import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from './shared/logger';
import apiKeyRoutes from './routes/apiKey.routes';
import { authenticateApiKey, optionalApiKey, requirePermission } from './middlewares/apiKey.middleware';
import { ApiPermission } from './types/api.types';
import { globalRateLimit } from './middlewares/rateLimiter.middleware';
import { pool, testConnection, getDatabaseInfo } from './config/database';

// Criar logger
const logger = createLogger('portal-services-server');

// Carregar variáveis de ambiente
dotenv.config();

console.log('🚀 Iniciando Portal Services Server...');
console.log('🔧 Informações do banco:', getDatabaseInfo());

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use(globalRateLimit);

// Log de requisições
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

console.log('✅ Middlewares configurados');

// Test database connection
testConnection().then(connected => {
  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('🛑 Não foi possível conectar ao banco em produção');
    process.exit(1);
  }
});

// Health check (rota pública)
app.get('/health', async (req, res) => {
  console.log('📋 Health check solicitado');
  
  // Importar healthCheck dinamicamente para evitar dependência circular
  const { healthCheck } = await import('./config/database');
  const dbStatus = await healthCheck();
  
  res.json({
    success: true,
    message: 'Portal Services API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.connected,
      latency: dbStatus.latency,
      ...(dbStatus.error && { error: dbStatus.error })
    }
  });
});

// API Routes

// Rotas de API Keys
app.use('/api/keys', apiKeyRoutes);

// Health check da API (rota pública)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Health Check',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Rota temporária para obter API Key de teste
app.get('/api/test-key', (req, res) => {
  res.json({
    success: true,
    message: 'Use esta API Key para testes no Bruno',
    apiKey: 'psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    usage: 'Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    permissions: [
      'read:categories',
      'create:categories', 
      'update:categories',
      'delete:categories',
      'read:clients',
      'create:clients',
      'update:clients', 
      'delete:clients',
      'read:services',
      'create:services',
      'update:services',
      'delete:services',
      'read:quotations',
      'create:quotations',
      'update:quotations',
      'delete:quotations',
      'read:appointments',
      'create:appointments',
      'update:appointments',
      'delete:appointments',
      'read:emails',
      'create:emails',
      'update:emails',
      'delete:emails',
      'read:stats',
      'admin:all'
    ]
  });
});

// Rota de debug para testar API Key
app.post('/api/debug-key', (req, res) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.split(' ')[1];
  
  res.json({
    success: true,
    debug: {
      authHeader,
      apiKey,
      apiKeyLength: apiKey?.length,
      startsWithPsk: apiKey?.startsWith('psk_'),
      headers: req.headers
    }
  });
});

// ====== ROTAS PROTEGIDAS - REQUEREM AUTENTICAÇÃO ======
// Adicione authenticate como middleware para proteger rotas

// GET /api/categories - Lista todas as categorias (autenticação opcional para leitura)
app.get('/api/categories', optionalApiKey, async (req, res) => {
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

// GET /api/categories/:id - Obter categoria por ID (autenticação opcional)
app.get('/api/categories/:id', optionalApiKey, async (req, res) => {
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

// POST /api/categories - Criar nova categoria (requer autenticação e permissão)
app.post('/api/categories', authenticateApiKey, requirePermission(ApiPermission.CREATE_CATEGORIES), async (req, res) => {
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

// PUT /api/categories/:id - Atualizar categoria (requer autenticação e permissão)
app.put('/api/categories/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_CATEGORIES), async (req, res) => {
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

// DELETE /api/categories/:id - Deletar categoria (soft delete) (requer autenticação e permissão)
app.delete('/api/categories/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_CATEGORIES), async (req, res) => {
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

// =====================================================
// CLIENTS ROUTES
// =====================================================

// GET /api/clients - Lista todos os clientes (autenticação opcional)
app.get('/api/clients', optionalApiKey, async (req, res) => {
  try {
    console.log('👥 Listando clientes...');
    
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (req.query.name) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${req.query.name}%`);
    }

    if (req.query.email) {
      query += ` AND email ILIKE $${paramIndex++}`;
      params.push(`%${req.query.email}%`);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
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

// GET /api/clients/:id - Obter cliente por ID
app.get('/api/clients/:id', optionalApiKey, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 Buscando cliente ID: ${id}`);
    
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    console.log(`✅ Cliente encontrado: ${result.rows[0].name}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    logger.error('Error fetching client', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/clients - Criar novo cliente
app.post('/api/clients', authenticateApiKey, requirePermission(ApiPermission.CREATE_CLIENTS), async (req, res) => {
  try {
    const { name, email, phone, address, notes = '' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome e email são obrigatórios'
      });
    }

    console.log(`➕ Criando cliente: ${name}`);
    const result = await pool.query(
      'INSERT INTO clients (name, email, phone, address, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, address, notes]
    );

    console.log(`✅ Cliente criado com ID: ${result.rows[0].id}`);
    logger.info('Client created', { id: result.rows[0].id, name });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Cliente criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    logger.error('Error creating client', { error: (error as Error).message });
    
    if ((error as Error).message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Cliente com este email já existe'
      });
    }
    
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
app.put('/api/clients/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_CLIENTS), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone, address, notes } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhuma alteração para atualizar' });
    }

    values.push(id);
    console.log(`✏️ Atualizando cliente ID: ${id}`);
    const result = await pool.query(
      `UPDATE clients SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    console.log(`✅ Cliente atualizado: ${result.rows[0].name}`);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    logger.error('Error updating client', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/clients/:id - Deletar cliente
app.delete('/api/clients/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_CLIENTS), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deletando cliente ID: ${id}`);
    
    const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    console.log(`✅ Cliente deletado com sucesso`);
    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar cliente:', error);
    logger.error('Error deleting client', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/services - Lista todos os serviços
app.get('/api/services', optionalApiKey, async (req, res) => {
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

// =====================================================
// EMAIL ROUTES
// =====================================================

// GET /api/emails - Lista todos os emails com filtros e paginação
app.get('/api/emails', async (req, res) => {
  try {
    console.log('📧 Listando emails...');
    
    let query = 'SELECT * FROM emails ORDER BY date DESC';
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause based on query parameters
    const conditions: string[] = [];

    if (req.query.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(req.query.category);
    }

    if (req.query.sender) {
      conditions.push(`sender ILIKE $${paramIndex++}`);
      params.push(`%${req.query.sender}%`);
    }

    if (req.query.processed !== undefined) {
      conditions.push(`processed = $${paramIndex++}`);
      params.push(req.query.processed === 'true');
    }

    if (req.query.responded !== undefined) {
      conditions.push(`responded = $${paramIndex++}`);
      params.push(req.query.responded === 'true');
    }

    if (req.query.subject) {
      conditions.push(`subject ILIKE $${paramIndex++}`);
      params.push(`%${req.query.subject}%`);
    }

    if (conditions.length > 0) {
      query = query.replace('ORDER BY', `WHERE ${conditions.join(' AND ')} ORDER BY`);
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM emails';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
      // Re-add the same parameters for count query (excluding limit/offset)
      if (req.query.category) {
        countParams.push(req.query.category);
      }
      if (req.query.sender) {
        countParams.push(`%${req.query.sender}%`);
      }
      if (req.query.processed !== undefined) {
        countParams.push(req.query.processed === 'true');
      }
      if (req.query.responded !== undefined) {
        countParams.push(req.query.responded === 'true');
      }
      if (req.query.subject) {
        countParams.push(`%${req.query.subject}%`);
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Encontrados ${result.rows.length} emails (página ${page}/${totalPages})`);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar emails:', error);
    logger.error('Error listing emails', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/emails/:id - Obter email por ID
app.get('/api/emails/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    console.log(`🔍 Buscando email ID: ${id}`);
    const result = await pool.query('SELECT * FROM emails WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    console.log(`✅ Email encontrado: ${result.rows[0].subject}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar email:', error);
    logger.error('Error fetching email', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/emails - Criar novo email
app.post('/api/emails', authenticateApiKey, requirePermission(ApiPermission.CREATE_EMAILS), async (req, res) => {
  try {
    const {
      gmail_id,
      subject,
      sender_email,
      sender_name,
      date,
      body = '',
      category = null,
      processed = false
    } = req.body;

    if (!gmail_id || !subject || !sender_email || !date) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: gmail_id, subject, sender_email, date'
      });
    }

    // Combine sender_email and sender_name into sender field
    const sender = sender_name ? `${sender_name} <${sender_email}>` : sender_email;

    console.log(`➕ Criando email: ${subject}`);
    const result = await pool.query(
      `INSERT INTO emails (gmail_id, subject, sender, date, body, category, processed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [gmail_id, subject, sender, date, body, category, processed]
    );

    console.log(`✅ Email criado com ID: ${result.rows[0].id}`);
    logger.info('Email created', { id: result.rows[0].id, subject });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Email criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar email:', error);
    logger.error('Error creating email', { error: (error as Error).message });
    
    if ((error as Error).message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Email com este gmail_id já existe'
      });
    }
    
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/emails/:id - Atualizar email
app.put('/api/emails/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_EMAILS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    const {
      subject,
      sender,
      date,
      body,
      category,
      processed,
      responded
    } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (subject !== undefined) { fields.push(`subject = $${idx++}`); values.push(subject); }
    if (sender !== undefined) { fields.push(`sender = $${idx++}`); values.push(sender); }
    if (date !== undefined) { fields.push(`date = $${idx++}`); values.push(date); }
    if (body !== undefined) { fields.push(`body = $${idx++}`); values.push(body); }
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (processed !== undefined) { fields.push(`processed = $${idx++}`); values.push(processed); }
    if (responded !== undefined) { fields.push(`responded = $${idx++}`); values.push(responded); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhuma alteração para atualizar' });
    }

    values.push(id);
    console.log(`✏️ Atualizando email ID: ${id}`);
    const result = await pool.query(
      `UPDATE emails SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    console.log(`✅ Email atualizado: ${result.rows[0].subject}`);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Email atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar email:', error);
    logger.error('Error updating email', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/emails/:id - Deletar email
app.delete('/api/emails/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_EMAILS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    console.log(`🗑️ Deletando email ID: ${id}`);
    const result = await pool.query('DELETE FROM emails WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    console.log(`✅ Email deletado com sucesso`);
    res.json({
      success: true,
      message: 'Email deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar email:', error);
    logger.error('Error deleting email', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// =====================================================
// STATISTICS ROUTES
// =====================================================

// GET /api/stats/business - Estatísticas gerais do negócio
app.get('/api/stats/business', async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas do negócio...');
    
    // Total clients
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    const totalClients = parseInt(clientsResult.rows[0].count);

    // Total quotations and revenue
    const quotationsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_quotations,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotations,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotations
      FROM quotations
    `);
    const quotationStats = quotationsResult.rows[0];

    // Total appointments
    const appointmentsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
    `);
    const appointmentStats = appointmentsResult.rows[0];

    // Total services
    const servicesResult = await pool.query('SELECT COUNT(*) as count FROM services WHERE active = true');
    const totalServices = parseInt(servicesResult.rows[0].count);

    // Email statistics
    const emailsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_emails,
        COUNT(CASE WHEN processed = true THEN 1 END) as processed_emails,
        COUNT(CASE WHEN responded = true THEN 1 END) as responded_emails
      FROM emails
    `);
    const emailStats = emailsResult.rows[0];

    // Monthly revenue trend (last 6 months)
    const monthlyRevenueResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as quotations_count
      FROM quotations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Service category distribution
    const categoryStatsResult = await pool.query(`
      SELECT 
        c.name as category,
        COUNT(DISTINCT s.id) as service_count,
        COUNT(DISTINCT q.id) as quotations_count,
        COALESCE(SUM(q.total), 0) as total_revenue
      FROM categories c
      LEFT JOIN services s ON s.category = c.name AND s.active = true
      LEFT JOIN quotations q ON q.services::text LIKE '%' || s.id || '%'
      GROUP BY c.name
      ORDER BY total_revenue DESC
    `);

    const businessStats = {
      overview: {
        totalClients: totalClients,
        totalQuotations: parseInt(quotationStats.total_quotations),
        totalRevenue: parseFloat(quotationStats.total_revenue),
        totalAppointments: parseInt(appointmentStats.total_appointments),
        totalServices: totalServices,
        totalEmails: parseInt(emailStats.total_emails)
      },
      quotations: {
        total: parseInt(quotationStats.total_quotations),
        accepted: parseInt(quotationStats.accepted_quotations),
        pending: parseInt(quotationStats.pending_quotations),
        rejected: parseInt(quotationStats.rejected_quotations),
        totalRevenue: parseFloat(quotationStats.total_revenue)
      },
      appointments: {
        total: parseInt(appointmentStats.total_appointments),
        scheduled: parseInt(appointmentStats.scheduled),
        confirmed: parseInt(appointmentStats.confirmed),
        completed: parseInt(appointmentStats.completed),
        cancelled: parseInt(appointmentStats.cancelled)
      },
      emails: {
        total: parseInt(emailStats.total_emails),
        processed: parseInt(emailStats.processed_emails),
        responded: parseInt(emailStats.responded_emails),
        responseRate: emailStats.total_emails > 0 
          ? ((parseInt(emailStats.responded_emails) / parseInt(emailStats.total_emails)) * 100).toFixed(1)
          : '0'
      },
      monthlyRevenue: monthlyRevenueResult.rows,
      categoryStats: categoryStatsResult.rows
    };

    console.log(`✅ Estatísticas carregadas: ${totalClients} clientes, ${quotationStats.total_quotations} orçamentos`);
    res.json({ success: true, data: businessStats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    logger.error('Error getting business stats', { error: (error as Error).message });
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas do negócio' 
    });
  }
});

// GET /api/stats/revenue/monthly - Receita mensal dos últimos 12 meses
app.get('/api/stats/revenue/monthly', async (req, res) => {
  try {
    console.log('📊 Buscando receita mensal...');
    
    const monthlyRevenueResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as quotations_count
      FROM quotations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        AND status = 'accepted'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    const monthlyData = monthlyRevenueResult.rows.map(row => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
      quotationsCount: parseInt(row.quotations_count)
    }));

    console.log(`✅ Receita mensal carregada: ${monthlyData.length} meses`);
    res.json({ 
      success: true, 
      data: monthlyData,
      count: monthlyData.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar receita mensal:', error);
    logger.error('Error getting monthly revenue', { error: (error as Error).message });
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar receita mensal' 
    });
  }
});

// GET /api/stats/dashboard - Estatísticas simplificadas para o dashboard
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas do dashboard...');
    
    // Contadores básicos
    const [clientsResult, quotationsResult, appointmentsResult, emailsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM clients'),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM quotations'),
      pool.query('SELECT COUNT(*) as count FROM appointments'),
      pool.query('SELECT COUNT(*) as count FROM emails')
    ]);

    const stats = {
      totalClients: parseInt(clientsResult.rows[0].count),
      totalQuotations: parseInt(quotationsResult.rows[0].count),
      totalRevenue: parseFloat(quotationsResult.rows[0].revenue),
      totalAppointments: parseInt(appointmentsResult.rows[0].count),
      totalEmails: parseInt(emailsResult.rows[0].count)
    };

    console.log(`✅ Dashboard stats: ${stats.totalClients} clientes, ${stats.totalQuotations} orçamentos`);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do dashboard:', error);
    logger.error('Error getting dashboard stats', { error: (error as Error).message });
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas do dashboard' 
    });
  }
});

// =====================================================
// QUOTATIONS ROUTES
// =====================================================

// GET /api/quotations - Lista todos os orçamentos
app.get('/api/quotations', async (req, res) => {
  try {
    console.log('📋 Listando orçamentos...');
    
    let query = 'SELECT * FROM quotations WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (req.query.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(req.query.status);
    }

    if (req.query.client_email) {
      query += ` AND client_email ILIKE $${paramIndex++}`;
      params.push(`%${req.query.client_email}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    console.log(`✅ Encontrados ${result.rows.length} orçamentos`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar orçamentos:', error);
    logger.error('Error listing quotations', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/quotations/:id - Obter orçamento por ID
app.get('/api/quotations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 Buscando orçamento ID: ${id}`);
    
    const result = await pool.query('SELECT * FROM quotations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
    }

    console.log(`✅ Orçamento encontrado: ${result.rows[0].client_name}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar orçamento:', error);
    logger.error('Error fetching quotation', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/quotations - Criar novo orçamento
app.post('/api/quotations', authenticateApiKey, requirePermission(ApiPermission.CREATE_QUOTATIONS), async (req, res) => {
  try {
    const {
      client_name,
      client_email,
      client_phone,
      client_address,
      services = [],
      subtotal = 0,
      discount = 0,
      total = 0,
      status = 'draft',
      valid_until,
      notes = ''
    } = req.body;

    if (!client_email || !services.length) {
      return res.status(400).json({
        success: false,
        error: 'Email do cliente e serviços são obrigatórios'
      });
    }

    console.log(`➕ Criando orçamento para: ${client_name}`);
    const result = await pool.query(
      'INSERT INTO quotations (id, client_name, client_email, client_phone, client_address, services, subtotal, discount, total, status, valid_until, notes) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [client_name, client_email, client_phone, client_address, JSON.stringify(services), parseFloat(subtotal), parseFloat(discount), parseFloat(total), status, valid_until, notes]
    );

    console.log(`✅ Orçamento criado com ID: ${result.rows[0].id}`);
    logger.info('Quotation created', { id: result.rows[0].id, client_name });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Orçamento criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar orçamento:', error);
    logger.error('Error creating quotation', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/quotations/:id - Atualizar orçamento
app.put('/api/quotations/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_QUOTATIONS), async (req, res) => {
  try {
    const id = req.params.id;
    const { client_email, client_name, client_phone, client_address, services, subtotal, discount, total, status, valid_until, notes } = req.body;
    
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (client_email !== undefined) { fields.push(`client_email = $${idx++}`); values.push(client_email); }
    if (client_name !== undefined) { fields.push(`client_name = $${idx++}`); values.push(client_name); }
    if (client_phone !== undefined) { fields.push(`client_phone = $${idx++}`); values.push(client_phone); }
    if (client_address !== undefined) { fields.push(`client_address = $${idx++}`); values.push(client_address); }
    if (services !== undefined) { fields.push(`services = $${idx++}`); values.push(JSON.stringify(services)); }
    if (subtotal !== undefined) { fields.push(`subtotal = $${idx++}`); values.push(parseFloat(subtotal)); }
    if (discount !== undefined) { fields.push(`discount = $${idx++}`); values.push(parseFloat(discount)); }
    if (total !== undefined) { fields.push(`total = $${idx++}`); values.push(parseFloat(total)); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (valid_until !== undefined) { fields.push(`valid_until = $${idx++}`); values.push(valid_until); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhuma alteração para atualizar' });
    }

    values.push(id);
    console.log(`✏️ Atualizando orçamento ID: ${id}`);
    const result = await pool.query(
      `UPDATE quotations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
    }

    console.log(`✅ Orçamento atualizado: ${result.rows[0].client_name}`);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Orçamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar orçamento:', error);
    logger.error('Error updating quotation', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/quotations/:id - Deletar orçamento
app.delete('/api/quotations/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_QUOTATIONS), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deletando orçamento ID: ${id}`);
    
    const result = await pool.query('DELETE FROM quotations WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
    }

    console.log(`✅ Orçamento deletado com sucesso`);
    res.json({
      success: true,
      message: 'Orçamento deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar orçamento:', error);
    logger.error('Error deleting quotation', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// =====================================================
// SERVICES ROUTES
// =====================================================

// GET /api/services - Lista todos os serviços
app.get('/api/services', async (req, res) => {
  try {
    console.log('🔧 Listando serviços...');
    
    let query = 'SELECT * FROM services WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (req.query.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(req.query.category);
    }

    if (req.query.active !== undefined) {
      query += ` AND active = $${paramIndex++}`;
      params.push(req.query.active === 'true');
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
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

// GET /api/services/:id - Obter serviço por ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 Buscando serviço ID: ${id}`);
    
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    console.log(`✅ Serviço encontrado: ${result.rows[0].name}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar serviço:', error);
    logger.error('Error fetching service', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/services - Criar novo serviço
app.post('/api/services', authenticateApiKey, requirePermission(ApiPermission.CREATE_SERVICES), async (req, res) => {
  try {
    const { name, description, category, price = 0, estimated_time, active = true, unit = 'hour', materials = [] } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Nome, descrição e categoria são obrigatórios'
      });
    }

    console.log(`➕ Criando serviço: ${name}`);
    const result = await pool.query(
      'INSERT INTO services (id, name, description, category, price, estimated_time, active, unit, materials) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, category, parseFloat(price), estimated_time, active, unit, JSON.stringify(materials)]
    );

    console.log(`✅ Serviço criado com ID: ${result.rows[0].id}`);
    logger.info('Service created', { id: result.rows[0].id, name });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Serviço criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error);
    logger.error('Error creating service', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
app.put('/api/services/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_SERVICES), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, category, price, estimated_time, active, unit, materials } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(parseFloat(price)); }
    if (estimated_time !== undefined) { fields.push(`estimated_time = $${idx++}`); values.push(estimated_time); }
    if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
    if (unit !== undefined) { fields.push(`unit = $${idx++}`); values.push(unit); }
    if (materials !== undefined) { fields.push(`materials = $${idx++}`); values.push(JSON.stringify(materials)); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhuma alteração para atualizar' });
    }

    values.push(id);
    console.log(`✏️ Atualizando serviço ID: ${id}`);
    const result = await pool.query(
      `UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    console.log(`✅ Serviço atualizado: ${result.rows[0].name}`);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Serviço atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error);
    logger.error('Error updating service', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
app.delete('/api/services/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_SERVICES), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deletando serviço ID: ${id}`);
    
    const result = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    console.log(`✅ Serviço deletado com sucesso`);
    res.json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar serviço:', error);
    logger.error('Error deleting service', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// =====================================================
// APPOINTMENTS ROUTES
// =====================================================

// GET /api/appointments - Lista todos os agendamentos
app.get('/api/appointments', async (req, res) => {
  try {
    console.log('📅 Listando agendamentos...');
    
    let query = 'SELECT * FROM appointments WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (req.query.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(req.query.status);
    }

    if (req.query.client_id) {
      query += ` AND client_id = $${paramIndex++}`;
      params.push(req.query.client_id);
    }

    if (req.query.date) {
      query += ` AND date = $${paramIndex++}`;
      params.push(req.query.date);
    }

    query += ' ORDER BY date DESC, time DESC';

    const result = await pool.query(query, params);
    console.log(`✅ Encontrados ${result.rows.length} agendamentos`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    logger.error('Error listing appointments', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/appointments/:id - Obter agendamento por ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔍 Buscando agendamento ID: ${id}`);
    
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    console.log(`✅ Agendamento encontrado: ${result.rows[0].client_name}`);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    logger.error('Error fetching appointment', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/appointments - Criar novo agendamento
app.post('/api/appointments', authenticateApiKey, requirePermission(ApiPermission.CREATE_APPOINTMENTS), async (req, res) => {
  try {
    const {
      client_id,
      client_name,
      service_ids = [],
      service_names = [],
      date,
      time,
      duration = 120,
      address,
      notes = '',
      status = 'scheduled'
    } = req.body;

    if (!client_id || !client_name || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'ID do cliente, nome, data e horário são obrigatórios'
      });
    }

    console.log(`➕ Criando agendamento para: ${client_name}`);
    const result = await pool.query(
      'INSERT INTO appointments (id, client_id, client_name, service_ids, service_names, date, time, duration, address, notes, status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [client_id, client_name, JSON.stringify(service_ids), JSON.stringify(service_names), date, time, duration, address, notes, status]
    );

    console.log(`✅ Agendamento criado com ID: ${result.rows[0].id}`);
    logger.info('Appointment created', { id: result.rows[0].id, client_name });
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Agendamento criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    logger.error('Error creating appointment', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// PUT /api/appointments/:id - Atualizar agendamento
app.put('/api/appointments/:id', authenticateApiKey, requirePermission(ApiPermission.UPDATE_APPOINTMENTS), async (req, res) => {
  try {
    const id = req.params.id;
    const { client_id, client_name, service_ids, service_names, date, time, duration, address, notes, status } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (client_id !== undefined) { fields.push(`client_id = $${idx++}`); values.push(client_id); }
    if (client_name !== undefined) { fields.push(`client_name = $${idx++}`); values.push(client_name); }
    if (service_ids !== undefined) { fields.push(`service_ids = $${idx++}`); values.push(JSON.stringify(service_ids)); }
    if (service_names !== undefined) { fields.push(`service_names = $${idx++}`); values.push(JSON.stringify(service_names)); }
    if (date !== undefined) { fields.push(`date = $${idx++}`); values.push(date); }
    if (time !== undefined) { fields.push(`time = $${idx++}`); values.push(time); }
    if (duration !== undefined) { fields.push(`duration = $${idx++}`); values.push(duration); }
    if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhuma alteração para atualizar' });
    }

    values.push(id);
    console.log(`✏️ Atualizando agendamento ID: ${id}`);
    const result = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    console.log(`✅ Agendamento atualizado: ${result.rows[0].client_name}`);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    logger.error('Error updating appointment', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// DELETE /api/appointments/:id - Deletar agendamento
app.delete('/api/appointments/:id', authenticateApiKey, requirePermission(ApiPermission.DELETE_APPOINTMENTS), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deletando agendamento ID: ${id}`);
    
    const result = await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    console.log(`✅ Agendamento deletado com sucesso`);
    res.json({
      success: true,
      message: 'Agendamento deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error);
    logger.error('Error deleting appointment', { id: req.params.id, error: (error as Error).message });
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
const startServer = async () => {
  
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
  console.log(`   GET    /api/clients/:id`);
  console.log(`   POST   /api/clients`);
  console.log(`   PUT    /api/clients/:id`);
  console.log(`   DELETE /api/clients/:id`);
  console.log(`   GET    /api/services`);
  console.log(`   GET    /api/services/:id`);
  console.log(`   POST   /api/services`);
  console.log(`   PUT    /api/services/:id`);
  console.log(`   DELETE /api/services/:id`);
  console.log(`   GET    /api/quotations`);
  console.log(`   GET    /api/quotations/:id`);
  console.log(`   POST   /api/quotations`);
  console.log(`   PUT    /api/quotations/:id`);
  console.log(`   DELETE /api/quotations/:id`);
  console.log(`   GET    /api/appointments`);
  console.log(`   GET    /api/appointments/:id`);
  console.log(`   POST   /api/appointments`);
  console.log(`   PUT    /api/appointments/:id`);
  console.log(`   DELETE /api/appointments/:id`);
  console.log(`   GET    /api/emails`);
  console.log(`   GET    /api/emails/:id`);
  console.log(`   POST   /api/emails`);
  console.log(`   PUT    /api/emails/:id`);
  console.log(`   DELETE /api/emails/:id`);
  console.log(`   GET    /api/stats/business`);
  console.log(`   GET    /api/stats/dashboard`);
  console.log(`\n🧪 Para testar:`);
  console.log(`   Health: GET http://localhost:${PORT}/health`);
  console.log(`   Categories: GET http://localhost:${PORT}/api/categories`);
  console.log(`   Clients: GET http://localhost:${PORT}/api/clients`);
  console.log(`   Services: GET http://localhost:${PORT}/api/services`);
  console.log(`   Quotations: GET http://localhost:${PORT}/api/quotations`);
  console.log(`   Appointments: GET http://localhost:${PORT}/api/appointments`);
  console.log(`   Emails: GET http://localhost:${PORT}/api/emails`);
  console.log(`   Stats: GET http://localhost:${PORT}/api/stats/dashboard`);
  
  logger.info('Server started', { port: PORT, environment: process.env.NODE_ENV });
  });
};

startServer();

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
