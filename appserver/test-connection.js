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
      AND table_name = 'clients'
    `);
    console.log('✅ Tabela clients encontrada:', tables.rows.length > 0);
    
    if (tables.rows.length > 0) {
      const columns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'phone_secondary'
      `);
      console.log('✅ Coluna phone_secondary existe:', columns.rows.length > 0);
    }
    
    client.release();
    await pool.end();
    console.log('✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();
