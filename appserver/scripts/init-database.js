#!/usr/bin/env node

/**
 * Portal Services API - Database Initialization Script
 * Este script inicializa o banco de dados com as tabelas e dados iniciais
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

console.log('🚀 Iniciando inicialização do banco de dados...');
console.log('🔧 Configuração:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl
});

// Script SQL de inicialização
const initSQL = `
-- Portal Services Database Initialization
-- Este script será executado quando o banco for criado

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) REFERENCES categories(name),
    price DECIMAL(10,2) DEFAULT 0,
    estimated_time INTEGER, -- in minutes
    active BOOLEAN DEFAULT TRUE,
    unit VARCHAR(20) DEFAULT 'hour',
    materials JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    client_address TEXT,
    services JSONB NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(200) NOT NULL,
    service_ids JSONB DEFAULT '[]',
    service_names JSONB DEFAULT '[]',
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 120, -- in minutes
    address TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    gmail_id VARCHAR(255) UNIQUE,
    subject TEXT,
    sender VARCHAR(500),
    date TIMESTAMP,
    body TEXT,
    category VARCHAR(100),
    processed BOOLEAN DEFAULT FALSE,
    responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    category VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_client_email ON quotations(client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(processed);
CREATE INDEX IF NOT EXISTS idx_emails_responded ON emails(responded);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO categories (name, description, color) VALUES
('Elétrica', 'Serviços elétricos residenciais e comerciais', '#FF6B6B'),
('Hidráulica', 'Instalações e reparos hidráulicos', '#4ECDC4'),
('Pintura', 'Serviços de pintura residencial e comercial', '#45B7D1'),
('Reformas', 'Reformas gerais e construção', '#96CEB4'),
('Manutenção', 'Manutenção preventiva e corretiva', '#FFEAA7')
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (name, description, category, price, estimated_time, unit) VALUES
('Instalação de tomada', 'Instalação de tomada elétrica simples', 'Elétrica', 50.00, 30, 'unit'),
('Troca de chuveiro', 'Troca e instalação de chuveiro elétrico', 'Elétrica', 80.00, 60, 'unit'),
('Instalação de torneira', 'Instalação de torneira de cozinha ou banheiro', 'Hidráulica', 40.00, 45, 'unit'),
('Desentupimento', 'Desentupimento de pia, ralo ou vaso sanitário', 'Hidráulica', 60.00, 30, 'unit'),
('Pintura de parede', 'Pintura de parede interna', 'Pintura', 15.00, 120, 'm2'),
('Pintura externa', 'Pintura de fachada e área externa', 'Pintura', 25.00, 180, 'm2'),
('Reforma de banheiro', 'Reforma completa de banheiro', 'Reformas', 5000.00, 4800, 'unit'),
('Reforma de cozinha', 'Reforma completa de cozinha', 'Reformas', 8000.00, 7200, 'unit'),
('Manutenção preventiva', 'Manutenção preventiva geral', 'Manutenção', 100.00, 120, 'hour')
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('company_name', 'Portal Services', 'Nome da empresa'),
('company_email', 'contato@portalservices.com', 'Email de contato da empresa'),
('company_phone', '(11) 99999-9999', 'Telefone de contato da empresa'),
('default_quotation_validity', '30', 'Validade padrão para orçamentos (dias)'),
('email_auto_response', 'true', 'Resposta automática para emails recebidos')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Analyze tables for better performance
ANALYZE;

DO $$
BEGIN
    RAISE NOTICE 'Banco de dados inicializado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: emails, categories, services, clients, quotations, appointments, email_templates, system_settings';
    RAISE NOTICE 'Índices e triggers configurados';
    RAISE NOTICE 'Dados iniciais inseridos';
END $$;
`;

async function initializeDatabase() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco estabelecida');
    
    // Executar script de inicialização
    console.log('📝 Executando script de inicialização...');
    await pool.query(initSQL);
    console.log('✅ Script de inicialização executado com sucesso');
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Verificar dados iniciais
    console.log('📊 Verificando dados iniciais...');
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM categories');
    const servicesCount = await pool.query('SELECT COUNT(*) as count FROM services');
    const settingsCount = await pool.query('SELECT COUNT(*) as count FROM system_settings');
    
    console.log(`   - Categorias: ${categoriesCount.rows[0].count}`);
    console.log(`   - Serviços: ${servicesCount.rows[0].count}`);
    console.log(`   - Configurações: ${settingsCount.rows[0].count}`);
    
    console.log('🎉 Inicialização do banco de dados concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
