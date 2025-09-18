/**
 * Health Check Script - Otimizado para Render
 * Verifica se a aplicação está respondendo e se o banco está acessível
 */

const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const port = process.env.PORT || 3001;
const host = 'localhost';

// Configuração do banco para health check
function createDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portalservicesdb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

/**
 * Verifica se o banco de dados está acessível
 */
async function checkDatabase() {
  const pool = new Pool(createDatabaseConfig());
  
  try {
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    await pool.end();
    return false;
  }
}

/**
 * Verifica se a aplicação está respondendo
 */
function checkApplication() {
  return new Promise((resolve) => {
    const options = {
      host: host,
      port: port,
      path: '/health',
      timeout: 5000
    };

    const request = http.get(options, (res) => {
      console.log(`Application health check status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });

    request.on('error', (err) => {
      console.error('Application health check failed:', err.message);
      resolve(false);
    });

    request.on('timeout', () => {
      console.error('Application health check timeout');
      request.abort();
      resolve(false);
    });

    // Timeout manual
    setTimeout(() => {
      request.abort();
      resolve(false);
    }, 5000);
  });
}

/**
 * Health check principal
 */
async function performHealthCheck() {
  console.log('🔍 Iniciando health check...');
  
  try {
    // Verificar aplicação
    const appHealthy = await checkApplication();
    
    // Verificar banco (apenas se aplicação estiver OK)
    let dbHealthy = true;
    if (appHealthy) {
      dbHealthy = await checkDatabase();
    }
    
    if (appHealthy && dbHealthy) {
      console.log('✅ Health check passou - aplicação e banco OK');
      process.exit(0);
    } else {
      console.log('❌ Health check falhou');
      console.log(`  - Aplicação: ${appHealthy ? 'OK' : 'FALHOU'}`);
      console.log(`  - Banco: ${dbHealthy ? 'OK' : 'FALHOU'}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante health check:', error.message);
    process.exit(1);
  }
}

// Executar health check
performHealthCheck();