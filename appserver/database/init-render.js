/**
 * Script de inicialização automática do banco de dados no Render
 * Baseado nas configurações do docker-compose.yml
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração idêntica ao docker-compose.yml
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

console.log('🔧 Iniciando configuração automática do banco...');
console.log('📍 Conectando em:', process.env.DATABASE_URL ? 'Render PostgreSQL' : 'Local PostgreSQL');

const pool = new Pool(dbConfig);

async function checkAndInitDatabase() {
  let retries = 5;
  
  while (retries > 0) {
    try {
      // Tentar conectar
      const client = await pool.connect();
      console.log('✅ Conexão com banco estabelecida!');
      
      // Verificar se as tabelas existem
      const checkTablesQuery = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('emails', 'categories', 'services', 'clients', 'quotations', 'appointments')
      `;
      
      const result = await client.query(checkTablesQuery);
      const tableCount = parseInt(result.rows[0].count);
      
      if (tableCount < 6) {
        console.log('⚠️  Tabelas não encontradas. Criando estrutura...');
        
        // Executar create-tables.sql
        const createTablesPath = path.join(__dirname, '../../create-tables.sql');
        if (fs.existsSync(createTablesPath)) {
          const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
          await client.query(createTablesSQL);
          console.log('✅ Tabelas criadas com sucesso!');
        }
        
        // Executar seeds.sql
        const seedsPath = path.join(__dirname, '../../seeds.sql');
        if (fs.existsSync(seedsPath)) {
          const seedsSQL = fs.readFileSync(seedsPath, 'utf8');
          
          // Verificar se já existem dados
          const checkDataQuery = 'SELECT COUNT(*) as count FROM categories';
          const dataResult = await client.query(checkDataQuery);
          
          if (parseInt(dataResult.rows[0].count) === 0) {
            await client.query(seedsSQL);
            console.log('✅ Dados iniciais inseridos!');
          } else {
            console.log('ℹ️  Dados já existem, pulando seeds...');
          }
        }
      } else {
        console.log('✅ Banco de dados já está configurado!');
      }
      
      client.release();
      await pool.end();
      return true;
      
    } catch (error) {
      retries--;
      console.log(`⚠️  Tentativa falhou. Restam ${retries} tentativas...`);
      console.log(`   Erro: ${error.message}`);
      
      if (retries === 0) {
        console.error('❌ Falha ao configurar banco após 5 tentativas');
        console.error('   Verifique se o PostgreSQL está disponível no Render');
        await pool.end();
        return false;
      }
      
      // Aguardar 5 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Exportar para uso no servidor
module.exports = { checkAndInitDatabase };

// Se executado diretamente
if (require.main === module) {
  checkAndInitDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('❌ Erro fatal:', err);
      process.exit(1);
    });
}
