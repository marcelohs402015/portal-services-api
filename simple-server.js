const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = 3001;

// Configuração do banco
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'portalservicesdb',
  user: 'admin',
  password: 'admin',
  ssl: false
};

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'postgresql',
    port: PORT
  });
});

// Teste de conexão com banco
app.get('/test-db', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query('SELECT current_database(), current_user');
    
    res.json({
      success: true,
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      message: 'Conexão com banco OK!'
    });
    
    await client.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Listar tabelas
app.get('/tables', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
    
    await client.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Teste de categorias
app.get('/api/categories', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM categories ORDER BY name');
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
    await client.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Teste DB: http://localhost:${PORT}/test-db`);
  console.log(`🔗 Tabelas: http://localhost:${PORT}/tables`);
  console.log(`🔗 Categorias: http://localhost:${PORT}/api/categories`);
});
