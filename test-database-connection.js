#!/usr/bin/env node

// =====================================================
// Portal Services - Database Connection Test
// Script para testar conexão com banco de dados
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Portal Services - Teste de Conexão com Banco');
console.log('================================================');

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

console.log('📊 Configuração do banco:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   SSL: ${!!dbConfig.ssl}`);
console.log('');

// Teste de conexão
async function testConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔄 Testando conexão...');
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Conexão bem-sucedida!');
    console.log(`   Resultado: ${result.rows[0].test}`);
    
    // Teste de tabelas
    console.log('');
    console.log('🔄 Verificando tabelas...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('✅ Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Teste de dados
    console.log('');
    console.log('🔄 Testando consultas...');
    
    const categoriesResult = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`   Categories: ${categoriesResult.rows[0].count} registros`);
    
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    console.log(`   Clients: ${clientsResult.rows[0].count} registros`);
    
    const servicesResult = await pool.query('SELECT COUNT(*) as count FROM services');
    console.log(`   Services: ${servicesResult.rows[0].count} registros`);
    
    console.log('');
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.log('❌ Erro na conexão:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('   1. Verifique se o banco está rodando');
    console.log('   2. Confirme as variáveis de ambiente');
    console.log('   3. Verifique se as tabelas existem');
    console.log('   4. Confirme as credenciais');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar teste
testConnection().catch(console.error);
