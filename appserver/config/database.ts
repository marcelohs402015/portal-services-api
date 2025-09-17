/**
 * Database Configuration
 * Configuração unificada para conexão com PostgreSQL
 * Suporta tanto DATABASE_URL (Render/Produção) quanto variáveis individuais (Local)
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Cria configuração do banco baseada no ambiente
 */
function createDatabaseConfig(): PoolConfig {
  // PRIORIDADE 1: DATABASE_URL (Render, Heroku, etc)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== '') {
    console.log('🔗 Usando DATABASE_URL para conexão');
    console.log('🔍 DATABASE_URL detectada:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } // Necessário para Render
        : false,
      // Pool settings otimizados para produção
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    };

    // Log da conexão (sem expor senha)
    const urlParts = process.env.DATABASE_URL.split('@');
    const hostInfo = urlParts[1] || 'unknown';
    console.log(`📍 Conectando ao banco: ${hostInfo.split('/')[0]}`);
    
    return config;
  }

  // PRIORIDADE 2: Variáveis individuais (desenvolvimento local)
  console.log('🔧 Usando variáveis individuais para conexão');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 DATABASE_URL presente:', !!process.env.DATABASE_URL);
  
  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portalservicesdb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    ssl: process.env.DB_SSL === 'true' 
      ? { rejectUnauthorized: false }
      : false,
    // Pool settings
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  };

  console.log('📍 Configuração do banco:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: !!config.ssl
  });

  return config;
}

/**
 * Pool de conexões do PostgreSQL
 */
export const pool = new Pool(createDatabaseConfig());

/**
 * Testa a conexão com o banco
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    const dbTime = result.rows[0].now;
    
    console.log('✅ Banco de dados conectado com sucesso');
    console.log(`⏰ Hora do banco: ${dbTime}`);
    logger.info('Database connection established', { 
      timestamp: dbTime,
      environment: process.env.NODE_ENV 
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    logger.error('Database connection failed', { 
      error: (error as Error).message 
    });
    
    // Em produção, não queremos que a aplicação continue sem banco
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Aplicação não pode continuar sem conexão com banco em produção');
      process.exit(1);
    }
    
    return false;
  }
}

/**
 * Executa query com retry automático
 */
export async function queryWithRetry(
  text: string, 
  params?: any[], 
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      lastError = error as Error;
      
      // Se é erro de conexão, tenta reconectar
      if (lastError.message.includes('connection')) {
        console.log(`⚠️ Tentativa ${i + 1}/${maxRetries} de reconexão...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff exponencial
        continue;
      }
      
      // Se é outro tipo de erro, não tenta novamente
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Fecha o pool de conexões (graceful shutdown)
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('🔌 Pool de conexões fechado');
    logger.info('Database connection pool closed');
  } catch (error) {
    console.error('❌ Erro ao fechar pool:', error);
    logger.error('Error closing database pool', { 
      error: (error as Error).message 
    });
  }
}

/**
 * Health check do banco
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      latency
    };
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message
    };
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('📛 SIGTERM recebido, fechando conexões...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📛 SIGINT recebido, fechando conexões...');
  await closePool();
  process.exit(0);
});

// Export configuração para debug (sem senha)
export function getDatabaseInfo() {
  const config = createDatabaseConfig();
  
  if ('connectionString' in config) {
    const url = config.connectionString || '';
    const parts = url.split('@');
    const hostInfo = parts[1] || 'unknown';
    
    return {
      type: 'DATABASE_URL',
      host: hostInfo.split('/')[0],
      ssl: !!config.ssl
    };
  }
  
  return {
    type: 'Individual Variables',
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: !!config.ssl
  };
}
