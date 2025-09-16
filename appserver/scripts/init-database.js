// =====================================================
// Portal Services - Database Initialization Script
// =====================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

async function initDatabase() {
  try {
    console.log('🔧 Inicializando banco de dados...');
    
    // Ler e executar script de criação das tabelas
    const createTablesPath = path.join(__dirname, '../../create-tables.sql');
    if (fs.existsSync(createTablesPath)) {
      const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
      await pool.query(createTablesSQL);
      console.log('✅ Tabelas criadas com sucesso');
    }
    
    // Ler e executar script de seeds
    const seedsPath = path.join(__dirname, '../../seeds.sql');
    if (fs.existsSync(seedsPath)) {
      const seedsSQL = fs.readFileSync(seedsPath, 'utf8');
      await pool.query(seedsSQL);
      console.log('✅ Dados iniciais inseridos com sucesso');
    }
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initDatabase };