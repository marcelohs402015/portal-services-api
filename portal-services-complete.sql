-- =====================================================
-- PORTAL SERVICES - SCRIPT COMPLETO DE CRIAÇÃO
-- =====================================================
-- Execute este script no DBeaver conectado ao banco postalservices-db
-- Usuário: admin | Senha: admin

-- =====================================================
-- 1. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    keywords JSONB NOT NULL DEFAULT '[]',
    patterns JSONB NOT NULL DEFAULT '[]',
    domains JSONB NOT NULL DEFAULT '[]',
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'hour',
    estimated_time VARCHAR(100),
    materials JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(255) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_address TEXT,
    services JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    service_ids JSONB DEFAULT '[]',
    service_names JSONB DEFAULT '[]',
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 120,
    address TEXT,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Emails
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    gmail_id VARCHAR(255) UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    sender VARCHAR(500) NOT NULL,
    date TIMESTAMP NOT NULL,
    body TEXT,
    snippet TEXT,
    category VARCHAR(100),
    confidence DECIMAL(3,2),
    processed BOOLEAN DEFAULT FALSE,
    responded BOOLEAN DEFAULT FALSE,
    response_template VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para emails
CREATE INDEX IF NOT EXISTS idx_emails_gmail_id ON emails(gmail_id);
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(processed);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- Índices para serviços
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Índices para orçamentos
CREATE INDEX IF NOT EXISTS idx_quotations_client_email ON quotations(client_email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- 3. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão
INSERT INTO categories (name, description, keywords, patterns, domains, color, active) VALUES
('Eletricista', 'Serviços de eletricidade residencial e comercial', 
 '["elétrica", "fiação", "instalação", "manutenção"]',
 '["problema elétrico", "instalação elétrica", "manutenção elétrica"]',
 '["residencial", "comercial"]', '#FF6B6B', true),
('Encanador', 'Serviços de encanamento e hidráulica',
 '["encanamento", "vazamento", "hidráulica", "canos"]',
 '["vazamento", "entupimento", "instalação hidráulica"]',
 '["residencial", "comercial"]', '#4ECDC4', true),
('Pintor', 'Serviços de pintura residencial e comercial',
 '["pintura", "tinta", "parede", "reforma"]',
 '["pintar", "reformar", "pintura de parede"]',
 '["residencial", "comercial"]', '#45B7D1', true),
('Pedreiro', 'Serviços de alvenaria e construção',
 '["alvenaria", "construção", "reforma", "obra"]',
 '["construir", "reformar", "alvenaria", "obra"]',
 '["residencial", "comercial"]', '#96CEB4', true),
('Marceneiro', 'Serviços de marcenaria e móveis',
 '["marcenaria", "móveis", "madeira", "carpintaria"]',
 '["fazer móveis", "marcenaria", "carpintaria"]',
 '["residencial", "comercial"]', '#FFEAA7', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir serviços padrão
INSERT INTO services (id, name, description, category, price, unit, estimated_time, materials, active) VALUES
('srv-001', 'Instalação de Tomada', 'Instalação de tomada elétrica simples', 'Eletricista', 50.00, 'unit', '30 minutos', '["tomada", "fio", "caixa"]', true),
('srv-002', 'Troca de Chuveiro', 'Troca e instalação de chuveiro elétrico', 'Eletricista', 80.00, 'unit', '1 hora', '["chuveiro", "fio", "disjuntor"]', true),
('srv-003', 'Reparo de Vazamento', 'Reparo de vazamento em canos', 'Encanador', 60.00, 'hour', '1-2 horas', '["canos", "válvula", "fita veda rosca"]', true),
('srv-004', 'Pintura de Parede', 'Pintura de parede interna', 'Pintor', 25.00, 'm²', '2-3 horas', '["tinta", "rolo", "pincel"]', true),
('srv-005', 'Construção de Muro', 'Construção de muro de alvenaria', 'Pedreiro', 80.00, 'm²', '1-2 dias', '["tijolo", "cimento", "areia"]', true),
('srv-006', 'Mesa de Madeira', 'Fabricação de mesa de madeira maciça', 'Marceneiro', 200.00, 'unit', '3-5 dias', '["madeira", "parafusos", "verniz"]', true)
ON CONFLICT (id) DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, address, notes) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'Rua das Flores, 123', 'Cliente preferencial'),
('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'Av. Paulista, 456', 'Interessada em serviços elétricos'),
('Pedro Costa', 'pedro.costa@email.com', '(11) 99999-3333', 'Rua da Consolação, 789', 'Precisa de orçamento para pintura')
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão
INSERT INTO settings (key, value, description, type) VALUES
('company_name', 'Portal Services', 'Nome da empresa', 'string'),
('company_email', 'contato@portalservices.com', 'Email de contato da empresa', 'string'),
('quotation_validity_days', '30', 'Dias de validade do orçamento', 'number'),
('default_currency', 'BRL', 'Moeda padrão', 'string'),
('email_auto_response', 'true', 'Resposta automática de emails', 'boolean'),
('business_hours_start', '08:00', 'Horário de início do expediente', 'string'),
('business_hours_end', '18:00', 'Horário de fim do expediente', 'string')
ON CONFLICT (key) DO NOTHING;

-- Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role, active) VALUES
('admin', 'admin@portalservices.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar todas as tabelas criadas
SELECT 'TABELAS CRIADAS:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Mostrar contagem de registros
SELECT 'DADOS INSERIDOS:' as status;
SELECT 'categories' as tabela, COUNT(*) as registros FROM categories
UNION ALL
SELECT 'services' as tabela, COUNT(*) as registros FROM services
UNION ALL
SELECT 'clients' as tabela, COUNT(*) as registros FROM clients
UNION ALL
SELECT 'settings' as tabela, COUNT(*) as registros FROM settings
UNION ALL
SELECT 'users' as tabela, COUNT(*) as registros FROM users;

-- =====================================================
-- SCRIPT CONCLUÍDO!
-- =====================================================
-- ✅ Todas as tabelas foram criadas
-- ✅ Índices foram criados para performance
-- ✅ Triggers foram configurados
-- ✅ Dados iniciais foram inseridos
-- ✅ Banco de dados pronto para as APIs!
