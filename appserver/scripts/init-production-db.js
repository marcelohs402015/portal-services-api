#!/usr/bin/env node

/**
 * Script de Inicialização do Banco de Dados para Produção (Render)
 * 
 * Este script:
 * 1. Conecta ao banco PostgreSQL do Render
 * 2. Cria as tabelas necessárias
 * 3. Insere dados iniciais (seeds)
 * 4. Configura índices e constraints
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuração do banco
function createDatabaseConfig() {
  // Prioridade para DATABASE_URL (Render)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL para inicialização');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }

  // Fallback para variáveis individuais
  console.log('🔧 Usando variáveis individuais para inicialização');
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
 * Executa um arquivo SQL
 */
async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Executando: ${path.basename(filePath)}`);
    
    await pool.query(sql);
    console.log(`✅ ${path.basename(filePath)} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message);
    throw error;
  }
}

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
 * Inicialização principal
 */
async function initializeDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...');
  
  try {
    // Testar conexão
    console.log('🔍 Testando conexão...');
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ Conectado ao banco. Hora: ${result.rows[0].now}`);

    // Verificar se as tabelas já existem
    const emailsExists = await tableExists('emails');
    const servicesExists = await tableExists('services');
    const quotationsExists = await tableExists('quotations');

    if (emailsExists && servicesExists && quotationsExists) {
      console.log('📋 Tabelas já existem. Pulando criação...');
    } else {
      console.log('📋 Criando tabelas...');
      
      // Executar scripts de criação
      const scriptsDir = path.join(__dirname, '..', 'database');
      
      // Ordem de execução importante
      const scripts = [
        'create-tables.sql',
        'create-indexes.sql',
        'create-constraints.sql'
      ];

      for (const script of scripts) {
        const scriptPath = path.join(scriptsDir, script);
        if (fs.existsSync(scriptPath)) {
          await executeSqlFile(scriptPath);
        } else {
          console.log(`⚠️ Script não encontrado: ${script}`);
        }
      }
    }

    // Inserir dados iniciais (seeds)
    console.log('🌱 Inserindo dados iniciais...');
    const seedsPath = path.join(__dirname, '..', 'database', 'seeds.sql');
    if (fs.existsSync(seedsPath)) {
      await executeSqlFile(seedsPath);
    } else {
      console.log('⚠️ Arquivo de seeds não encontrado');
    }

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

    console.log('🎉 Banco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
