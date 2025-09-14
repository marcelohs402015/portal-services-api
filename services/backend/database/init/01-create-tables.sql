-- =====================================================
-- Script de Inicialização do Banco de Dados
-- Portal Services - Sistema de Gestão de Serviços
-- =====================================================

-- Configurações iniciais
SET timezone = 'America/Sao_Paulo';
SET default_text_search_config = 'portuguese';

-- =====================================================
-- Criação das Tabelas
-- =====================================================

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

-- Tabela de Templates de Email
CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100),
    variables JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Índices para Performance
-- =====================================================

-- Índices para tabela emails
CREATE INDEX IF NOT EXISTS idx_emails_gmail_id ON emails(gmail_id);
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(processed);
CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Índices para tabela categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- Índices para tabela services
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);

-- Índices para tabela clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para tabela quotations
CREATE INDEX IF NOT EXISTS idx_quotations_client_email ON quotations(client_email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);

-- Índices para tabela appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

-- Índices para tabela email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- Índices para tabela system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- =====================================================
-- Função para Atualizar updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- Triggers para updated_at
-- =====================================================

-- Trigger para emails
DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para services
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para quotations
DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para email_templates
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Dados Iniciais
-- =====================================================

-- Inserir categorias padrão
INSERT INTO categories (name, description, keywords, patterns, domains, color) VALUES
('Eletricista', 'Serviços de eletricidade residencial e comercial', 
 '["eletricista", "elétrica", "luz", "energia", "instalação elétrica", "manutenção elétrica"]',
 '["preciso de um eletricista", "problema na luz", "instalação elétrica"]',
 '[]',
 '#FF6B6B'),
('Encanador', 'Serviços de encanamento e hidráulica', 
 '["encanador", "encanamento", "água", "vazamento", "hidráulica", "canos"]',
 '["vazamento de água", "problema no encanamento", "preciso de encanador"]',
 '[]',
 '#4ECDC4'),
('Pintor', 'Serviços de pintura residencial e comercial', 
 '["pintor", "pintura", "tinta", "parede", "reforma"]',
 '["preciso pintar", "reforma da casa", "pintura de parede"]',
 '[]',
 '#45B7D1'),
('Pedreiro', 'Serviços de alvenaria e construção', 
 '["pedreiro", "alvenaria", "construção", "reforma", "obra"]',
 '["reforma da casa", "construção", "alvenaria"]',
 '[]',
 '#96CEB4'),
('Marceneiro', 'Serviços de marcenaria e carpintaria', 
 '["marceneiro", "marcenaria", "madeira", "móveis", "carpintaria"]',
 '["fazer móveis", "marcenaria", "trabalho em madeira"]',
 '[]',
 '#FFEAA7')
ON CONFLICT (name) DO NOTHING;

-- Inserir serviços padrão
INSERT INTO services (id, name, description, category, price, unit, estimated_time, materials) VALUES
('eletricista-instalacao', 'Instalação Elétrica', 'Instalação completa de sistema elétrico residencial', 'Eletricista', 80.00, 'hour', '4-8 horas', '["fios", "disjuntores", "tomadas", "interruptores"]'),
('eletricista-manutencao', 'Manutenção Elétrica', 'Reparo e manutenção de instalações elétricas', 'Eletricista', 60.00, 'hour', '1-3 horas', '["fios", "conectores", "ferramentas"]'),
('encanador-vazamento', 'Reparo de Vazamento', 'Reparo de vazamentos em canos e conexões', 'Encanador', 70.00, 'hour', '1-4 horas', '["canos", "conexões", "vedação"]'),
('encanador-instalacao', 'Instalação Hidráulica', 'Instalação de sistema hidráulico completo', 'Encanador', 90.00, 'hour', '6-12 horas', '["canos", "registros", "conexões"]'),
('pintor-residencial', 'Pintura Residencial', 'Pintura de paredes e tetos em residências', 'Pintor', 25.00, 'm2', '1-3 dias', '["tinta", "rolo", "pincel", "massas"]'),
('pedreiro-alvenaria', 'Alvenaria', 'Construção e reparo de paredes e estruturas', 'Pedreiro', 45.00, 'm2', '2-5 dias', '["tijolos", "cimento", "areia", "cal"]'),
('marceneiro-moveis', 'Fabricação de Móveis', 'Fabricação de móveis sob medida', 'Marceneiro', 120.00, 'hour', '1-2 semanas', '["madeira", "parafusos", "colas", "vernizes"]')
ON CONFLICT (id) DO NOTHING;

-- Inserir templates de email padrão
INSERT INTO email_templates (id, name, subject, body, category, variables) VALUES
('orcamento-padrao', 'Orçamento Padrão', 'Orçamento - {{service_name}}', 
 'Olá {{client_name}},\n\nObrigado pelo seu interesse em nossos serviços!\n\nSegue abaixo o orçamento solicitado:\n\nServiço: {{service_name}}\nDescrição: {{service_description}}\nValor: R$ {{service_price}}\n\nEste orçamento é válido por 30 dias.\n\nAtenciosamente,\nEquipe Portal Services', 
 'Eletricista', 
 '["client_name", "service_name", "service_description", "service_price"]'),
('agendamento-confirmacao', 'Confirmação de Agendamento', 'Agendamento Confirmado - {{service_name}}', 
 'Olá {{client_name}},\n\nSeu agendamento foi confirmado!\n\nData: {{appointment_date}}\nHorário: {{appointment_time}}\nServiço: {{service_name}}\n\nNos vemos em breve!\n\nAtenciosamente,\nEquipe Portal Services', 
 'Eletricista', 
 '["client_name", "appointment_date", "appointment_time", "service_name"]')
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações do sistema
INSERT INTO system_settings (id, key, value, description) VALUES
('email-config', 'email_config', '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "use_tls": true}', 'Configurações de email SMTP'),
('app-config', 'app_config', '{"default_quotation_validity_days": 30, "max_appointments_per_day": 10}', 'Configurações gerais da aplicação'),
('ai-config', 'ai_config', '{"confidence_threshold": 0.7, "auto_respond": false}', 'Configurações de IA para categorização')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Permissões e Usuários
-- =====================================================

-- Criar usuário para a aplicação (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'portal_services_app') THEN
        CREATE ROLE portal_services_app WITH LOGIN PASSWORD 'portal_services_app_password';
    END IF;
END
$$;

-- Conceder permissões ao usuário da aplicação
GRANT CONNECT ON DATABASE portal_services_api TO portal_services_app;
GRANT USAGE ON SCHEMA public TO portal_services_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portal_services_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portal_services_app;

-- =====================================================
-- Finalização
-- =====================================================

-- Atualizar estatísticas
ANALYZE;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados inicializado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: emails, categories, services, clients, quotations, appointments, email_templates, system_settings';
    RAISE NOTICE 'Índices e triggers configurados';
    RAISE NOTICE 'Dados iniciais inseridos';
END
$$;
