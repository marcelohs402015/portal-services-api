#!/usr/bin/env node

/**
 * Script de Teste - Simula Configuração do Render
 * 
 * Este script testa a configuração localmente usando as mesmas
 * configurações que serão usadas no Render
 */

const { Pool } = require('pg');
const http = require('http');
require('dotenv').config();

console.log('🧪 Testando configuração para Render...\n');

// Configuração do banco (simulando Render)
function createDatabaseConfig() {
  // Para teste local, usar configuração sem SSL se não especificado
  const mockDatabaseUrl = process.env.MOCK_DATABASE_URL || 
    'postgresql://admin:admin@localhost:5432/portalservicesdb';
  
  console.log('🔗 Configuração de teste:');
  console.log(`  - DATABASE_URL: ${mockDatabaseUrl.substring(0, 30)}...`);
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - SSL: ${mockDatabaseUrl.includes('sslmode=require') ? 'true' : 'false'}\n`);

  return {
    connectionString: mockDatabaseUrl,
    ssl: mockDatabaseUrl.includes('sslmode=require') 
      ? { rejectUnauthorized: false }
      : false
  };
}

/**
 * Testa conexão com banco
 */
async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com banco...');
  
  const pool = new Pool(createDatabaseConfig());
  
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const dbTime = result.rows[0].current_time;
    const pgVersion = result.rows[0].pg_version;
    
    console.log('✅ Conexão com banco bem-sucedida!');
    console.log(`  - Hora do banco: ${dbTime}`);
    console.log(`  - PostgreSQL: ${pgVersion.split(' ')[0]} ${pgVersion.split(' ')[1]}`);
    
    // Testar algumas queries básicas
    console.log('\n🔍 Testando queries básicas...');
    
    // Verificar se as tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📊 Tabelas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️ Nenhuma tabela encontrada (normal se banco estiver vazio)');
    }
    
    await pool.end();
    return true;
    
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error.message);
    await pool.end();
    return false;
  }
}

/**
 * Testa se a aplicação está rodando
 */
function testApplication() {
  return new Promise((resolve) => {
    console.log('🔍 Testando aplicação...');
    
    const port = process.env.PORT || 3001;
    const options = {
      host: 'localhost',
      port: port,
      path: '/health',
      timeout: 5000
    };

    const request = http.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Aplicação respondendo!');
          console.log(`  - Status: ${response.data?.status || 'unknown'}`);
          console.log(`  - Database: ${response.data?.database?.connected ? 'OK' : 'FALHOU'}`);
          resolve(true);
        } catch (error) {
          console.log('⚠️ Resposta não é JSON válido:', data);
          resolve(false);
        }
      });
    });

    request.on('error', (err) => {
      console.error('❌ Aplicação não está rodando:', err.message);
      console.log('💡 Dica: Execute "npm run dev" em outro terminal');
      resolve(false);
    });

    request.on('timeout', () => {
      console.error('❌ Timeout ao conectar com aplicação');
      request.abort();
      resolve(false);
    });

    setTimeout(() => {
      request.abort();
      resolve(false);
    }, 5000);
  });
}

/**
 * Testa configuração de SSL
 */
function testSSLConfiguration() {
  console.log('🔍 Testando configuração SSL...');
  
  const config = createDatabaseConfig();
  const hasSSL = !!config.ssl;
  const sslMode = config.connectionString?.includes('sslmode=require');
  
  console.log(`  - SSL configurado: ${hasSSL ? '✅' : '❌'}`);
  console.log(`  - SSL mode required: ${sslMode ? '✅' : '❌'}`);
  
  if (hasSSL && sslMode) {
    console.log('✅ Configuração SSL adequada para Render');
    return true;
  } else {
    console.log('⚠️ Configuração SSL pode causar problemas no Render');
    return false;
  }
}

/**
 * Teste principal
 */
async function runTests() {
  console.log('🚀 Iniciando testes de configuração Render...\n');
  
  const results = {
    ssl: testSSLConfiguration(),
    database: await testDatabaseConnection(),
    application: await testApplication()
  };
  
  console.log('\n📊 Resultados dos Testes:');
  console.log('========================');
  console.log(`SSL Configuration: ${results.ssl ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Database Connection: ${results.database ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Application Health: ${results.application ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 Resultado Final:');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sua configuração está pronta para o Render');
    console.log('\n📋 Próximos passos:');
    console.log('1. Crie o banco PostgreSQL no Render');
    console.log('2. Configure as variáveis de ambiente');
    console.log('3. Faça o deploy usando Dockerfile.render');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('🔧 Corrija os problemas antes de fazer deploy');
    
    if (!results.ssl) {
      console.log('  - Configure SSL adequadamente');
    }
    if (!results.database) {
      console.log('  - Verifique conexão com banco');
    }
    if (!results.application) {
      console.log('  - Inicie a aplicação localmente');
    }
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
