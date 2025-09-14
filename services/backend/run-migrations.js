#!/usr/bin/env node

import { Database } from './database/Database.js';
import { runMigrations } from './database/migrations.js';

const config = {
  host: 'localhost',
  port: 5432,
  database: 'portalservices-db',
  user: 'admin',
  password: 'admin',
  ssl: false
};

async function setup() {
  try {
    console.log('🔄 Running database migrations...');
    const db = new Database(config);
    await runMigrations(db);
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

setup();
