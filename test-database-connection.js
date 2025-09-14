#!/usr/bin/env node

// =====================================================
// Portal Services - Database Connection Test
// =====================================================

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: './env.docker' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

console.log('🔍 Testando conexão com o banco de dados...');
console.log('📋 Configuração:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: !!config.ssl
});

const pool = new Pool(config);

async function testConnection() {
  try {
    console.log('⏳ Conectando ao banco...');
    const client = await pool.connect();
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query básica
    console.log('🔍 Testando query básica...');
    const result = await client.query('SELECT version()');
    console.log('📊 Versão do PostgreSQL:', result.rows[0].version);
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Testar tabela categories se existir
    if (tablesResult.rows.some(row => row.table_name === 'categories')) {
      console.log('🔍 Testando tabela categories...');
      const categoriesResult = await client.query('SELECT COUNT(*) as total FROM categories');
      console.log(`📊 Total de categorias: ${categoriesResult.rows[0].total}`);
      
      // Listar algumas categorias
      const sampleCategories = await client.query('SELECT id, name, color FROM categories LIMIT 5');
      console.log('📋 Categorias de exemplo:');
      sampleCategories.rows.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.color})`);
      });
    }
    
    client.release();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    console.error('💡 Verifique se:');
    console.error('   - O PostgreSQL está rodando');
    console.error('   - As credenciais estão corretas');
    console.error('   - O banco de dados existe');
    console.error('   - As portas estão acessíveis');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar teste
testConnection().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
