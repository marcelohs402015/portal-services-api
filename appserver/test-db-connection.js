const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'portalservicesdb',
  user: 'admin',
  password: 'admin',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query executada:', result.rows[0]);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('emails', 'categories', 'services', 'clients', 'quotations', 'appointments')
    `);
    console.log('✅ Tabelas encontradas:', tables.rows.map(r => r.table_name));
    
    client.release();
    await pool.end();
    console.log('✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();
