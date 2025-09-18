#!/usr/bin/env node

/**
 * Auto Inicialização do Banco de Dados
 * Executa automaticamente quando a aplicação sobe no Render
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Iniciando auto-inicialização do banco...');

// Configuração do banco
function createDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL do Render');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  console.log('🔧 Usando variáveis individuais');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portalservicesdb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(createDatabaseConfig());

/**
 * Verifica se uma tabela existe
 */
async function tableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Executa um arquivo SQL
 */
async function executeSqlFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
      return;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Executando: ${path.basename(filePath)}`);
    
    await pool.query(sql);
    console.log(`✅ ${path.basename(filePath)} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message);
    // Não falha a aplicação se houver erro no SQL
  }
}

/**
 * Inicialização automática
 */
async function autoInitialize() {
  try {
    // Testar conexão
    console.log('🔍 Testando conexão com banco...');
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ Conectado ao banco. Hora: ${result.rows[0].now}`);

    // Verificar se as tabelas principais já existem
    const emailsExists = await tableExists('emails');
    const servicesExists = await tableExists('services');
    const quotationsExists = await tableExists('quotations');

    if (emailsExists && servicesExists && quotationsExists) {
      console.log('📋 Tabelas já existem. Banco inicializado!');
      return true;
    }

    console.log('📋 Criando estrutura do banco...');
    
    // Executar scripts de criação em ordem
    const scriptsDir = path.join(__dirname, '..', 'database');
    const scripts = [
      'create-tables.sql',
      'create-indexes.sql',
      'create-constraints.sql'
    ];

    for (const script of scripts) {
      const scriptPath = path.join(scriptsDir, script);
      await executeSqlFile(scriptPath);
    }

    // Inserir dados iniciais
    console.log('🌱 Inserindo dados iniciais...');
    const seedsPath = path.join(scriptsDir, 'seeds.sql');
    await executeSqlFile(seedsPath);

    // Verificar estrutura final
    console.log('🔍 Verificando estrutura final...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tabelas criadas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('🎉 Banco inicializado com sucesso!');
    return true;

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error.message);
    // Não falha a aplicação, apenas loga o erro
    return false;
  } finally {
    await pool.end();
  }
}

// Executar inicialização
autoInitialize().then(success => {
  if (success) {
    console.log('✅ Auto-inicialização concluída');
  } else {
    console.log('⚠️ Auto-inicialização falhou, mas aplicação continuará');
  }
}).catch(error => {
  console.error('❌ Erro crítico na auto-inicialização:', error);
});

module.exports = { autoInitialize };
