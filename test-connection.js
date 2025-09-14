const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'portalservicesdb',
    user: 'admin',
    password: 'admin',
    ssl: false
  });

  try {
    console.log('🔍 Testando conexão com o banco...');
    await client.connect();
    console.log('✅ Conexão estabelecida!');
    
    const result = await client.query('SELECT current_database(), current_user');
    console.log('📊 Banco:', result.rows[0].current_database);
    console.log('👤 Usuário:', result.rows[0].current_user);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    await client.end();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
