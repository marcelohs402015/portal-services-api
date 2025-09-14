#!/usr/bin/env node

/**
 * Script de teste para verificar o carregamento automático de dados padrão
 * 
 * Uso:
 * node scripts/test-data-seeding.js
 */

import { Database } from '../database/Database.js';
import { DataSeeder } from '../database/seedData.js';
import { runMigrations } from '../database/migrations.js';
import dotenv from 'dotenv';

dotenv.config();

const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args)
};

async function testDataSeeding() {
  try {
    logger.info('🧪 Iniciando teste de carregamento de dados padrão...');

    // Configuração do banco
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'portalservices-db',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin',
      ssl: (process.env.DB_SSL || 'false') === 'true'
    };

    logger.info('📊 Conectando ao banco de dados...', { 
      host: dbConfig.host, 
      port: dbConfig.port, 
      database: dbConfig.database 
    });

    const db = new Database(dbConfig);

    // Executar migrações
    logger.info('🔄 Executando migrações...');
    await runMigrations(db);

    // Testar seeder
    const dataSeeder = new DataSeeder(db);

    // Verificar se há dados
    logger.info('🔍 Verificando se há dados existentes...');
    const hasData = await dataSeeder.hasData();
    logger.info(`📋 Banco tem dados: ${hasData}`);

    if (hasData) {
      logger.info('⚠️  Banco já contém dados. Testando apenas verificação...');
    } else {
      logger.info('🌱 Banco vazio. Testando carregamento de dados padrão...');
    }

    // Executar seed
    await dataSeeder.seedDefaultData();
    logger.info('✅ Carregamento de dados padrão executado com sucesso!');

    // Verificar dados carregados
    logger.info('📊 Verificando dados carregados...');
    
    const categoriesResult = await db.query('SELECT COUNT(*) as count FROM categories');
    const servicesResult = await db.query('SELECT COUNT(*) as count FROM services');
    const templatesResult = await db.query('SELECT COUNT(*) as count FROM email_templates');
    const settingsResult = await db.query('SELECT COUNT(*) as count FROM system_settings');

    logger.info('📈 Estatísticas dos dados:');
    logger.info(`   - Categorias: ${categoriesResult.rows[0].count}`);
    logger.info(`   - Serviços: ${servicesResult.rows[0].count}`);
    logger.info(`   - Templates de Email: ${templatesResult.rows[0].count}`);
    logger.info(`   - Configurações do Sistema: ${settingsResult.rows[0].count}`);

    // Listar algumas categorias
    const categories = await db.query('SELECT name, description, color FROM categories LIMIT 5');
    logger.info('📋 Categorias carregadas:');
    categories.rows.forEach(cat => {
      logger.info(`   - ${cat.name}: ${cat.description} (${cat.color})`);
    });

    // Listar alguns serviços
    const services = await db.query('SELECT name, category, price, unit FROM services LIMIT 5');
    logger.info('🔧 Serviços carregados:');
    services.rows.forEach(service => {
      logger.info(`   - ${service.name} (${service.category}): R$ ${service.price}/${service.unit}`);
    });

    logger.info('🎉 Teste concluído com sucesso!');
    logger.info('💡 O sistema agora carrega automaticamente dados padrão quando o servidor sobe.');

  } catch (error) {
    logger.error('❌ Erro durante o teste:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar teste
testDataSeeding();
