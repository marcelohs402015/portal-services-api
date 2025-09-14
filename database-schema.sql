-- =====================================================
-- Portal Services - Database Schema
-- Sistema de gestão de serviços e orçamentos
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários/administradores
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'operator')),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de serviços
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#FF6B6B',
    icon VARCHAR(100),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    phone_secondary VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    document VARCHAR(20), -- CPF/CNPJ
    document_type VARCHAR(10) DEFAULT 'cpf' CHECK (document_type IN ('cpf', 'cnpj')),
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration INTEGER, -- em minutos
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    requires_quote BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) DEFAULT 0,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    valid_until DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de emails
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    body TEXT,
    body_html TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
    email_type VARCHAR(50) DEFAULT 'general' CHECK (email_type IN ('general', 'quotation', 'appointment', 'notification')),
    related_id UUID, -- ID do orçamento, agendamento, etc.
    related_type VARCHAR(50), -- 'quotation', 'appointment', etc.
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para tabela categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Índices para tabela clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);

-- Índices para tabela services
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin(name gin_trgm_ops);

-- Índices para tabela appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_date ON appointments(start_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_date, end_date);

-- Índices para tabela quotations
CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);

-- Índices para tabela quotation_items
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_service ON quotation_items(service_id);

-- Índices para tabela emails
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails(recipient);
CREATE INDEX IF NOT EXISTS idx_emails_type ON emails(email_type);
CREATE INDEX IF NOT EXISTS idx_emails_related ON emails(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at);

-- Índices para tabela settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Índices para tabela activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas que têm updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular total do orçamento
CREATE OR REPLACE FUNCTION calculate_quotation_total(quotation_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO total
    FROM quotation_items
    WHERE quotation_id = quotation_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar total do orçamento automaticamente
CREATE OR REPLACE FUNCTION update_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quotations 
    SET total_amount = calculate_quotation_total(COALESCE(NEW.quotation_id, OLD.quotation_id)),
        final_amount = calculate_quotation_total(COALESCE(NEW.quotation_id, OLD.quotation_id)) - COALESCE(discount_amount, 0)
    WHERE id = COALESCE(NEW.quotation_id, OLD.quotation_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotation_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON quotation_items
    FOR EACH ROW EXECUTE FUNCTION update_quotation_total();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@portalservices.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (name, description, color, icon, sort_order) VALUES
('Eletricista', 'Serviços de eletricidade residencial e comercial', '#FF6B6B', 'bolt', 1),
('Encanador', 'Serviços de encanamento e hidráulica', '#4ECDC4', 'droplet', 2),
('Pintor', 'Serviços de pintura residencial e comercial', '#45B7D1', 'paint-brush', 3),
('Pedreiro', 'Serviços de alvenaria e construção', '#96CEB4', 'hammer', 4),
('Marceneiro', 'Serviços de marcenaria e carpintaria', '#FFEAA7', 'saw', 5),
('Limpeza', 'Serviços de limpeza residencial e comercial', '#DDA0DD', 'sparkles', 6),
('Jardinagem', 'Serviços de jardinagem e paisagismo', '#98FB98', 'leaf', 7),
('Ar Condicionado', 'Instalação e manutenção de ar condicionado', '#87CEEB', 'snowflake', 8)
ON CONFLICT DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, address, city, state, document, document_type) VALUES
('João Silva', 'joao@email.com', '11999999999', 'Rua das Flores, 123', 'São Paulo', 'SP', '12345678901', 'cpf'),
('Maria Santos', 'maria@email.com', '11888888888', 'Av. Principal, 456', 'São Paulo', 'SP', '98765432100', 'cpf'),
('Pedro Costa', 'pedro@email.com', '11777777777', 'Rua do Comércio, 789', 'São Paulo', 'SP', '11122233344', 'cpf'),
('Empresa ABC Ltda', 'contato@empresaabc.com', '11333333333', 'Av. Empresarial, 1000', 'São Paulo', 'SP', '12345678000199', 'cnpj')
ON CONFLICT DO NOTHING;

-- Inserir serviços de exemplo
INSERT INTO services (name, description, price, duration, category_id, requires_quote) 
SELECT 
    s.name,
    s.description,
    s.price,
    s.duration,
    c.id,
    s.requires_quote
FROM (VALUES
    ('Instalação de Tomada', 'Instalação de tomada elétrica simples', 50.00, 30, false),
    ('Reparo de Torneira', 'Reparo e manutenção de torneira', 80.00, 45, false),
    ('Pintura de Parede', 'Pintura de parede interna', 120.00, 120, false),
    ('Construção de Muro', 'Construção de muro de alvenaria', 200.00, 240, true),
    ('Fabricação de Móvel', 'Fabricação de móvel sob medida', 500.00, 480, true),
    ('Limpeza Residencial', 'Limpeza completa da residência', 150.00, 180, false),
    ('Poda de Árvores', 'Poda e manutenção de árvores', 100.00, 120, false),
    ('Instalação de Split', 'Instalação de ar condicionado split', 300.00, 240, true)
) AS s(name, description, price, duration, requires_quote)
CROSS JOIN categories c
WHERE c.name = CASE 
    WHEN s.name LIKE '%Tomada%' THEN 'Eletricista'
    WHEN s.name LIKE '%Torneira%' THEN 'Encanador'
    WHEN s.name LIKE '%Pintura%' THEN 'Pintor'
    WHEN s.name LIKE '%Muro%' THEN 'Pedreiro'
    WHEN s.name LIKE '%Móvel%' THEN 'Marceneiro'
    WHEN s.name LIKE '%Limpeza%' THEN 'Limpeza'
    WHEN s.name LIKE '%Árvores%' THEN 'Jardinagem'
    WHEN s.name LIKE '%Split%' THEN 'Ar Condicionado'
END
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão do sistema
INSERT INTO settings (key, value, description, type, category) VALUES
('company_name', 'Portal Services', 'Nome da empresa', 'string', 'company'),
('company_email', 'contato@portalservices.com', 'Email da empresa', 'string', 'company'),
('company_phone', '11999999999', 'Telefone da empresa', 'string', 'company'),
('quotation_validity_days', '30', 'Dias de validade do orçamento', 'number', 'quotation'),
('default_currency', 'BRL', 'Moeda padrão', 'string', 'system'),
('timezone', 'America/Sao_Paulo', 'Fuso horário', 'string', 'system'),
('email_notifications', 'true', 'Habilitar notificações por email', 'boolean', 'notifications'),
('auto_confirm_appointments', 'false', 'Confirmar agendamentos automaticamente', 'boolean', 'appointments')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para dashboard - estatísticas gerais
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM clients WHERE active = true) as total_clients,
    (SELECT COUNT(*) FROM appointments WHERE status IN ('scheduled', 'confirmed', 'in_progress')) as pending_appointments,
    (SELECT COUNT(*) FROM quotations WHERE status = 'draft') as draft_quotations,
    (SELECT COUNT(*) FROM emails WHERE status = 'pending') as pending_emails,
    (SELECT COALESCE(SUM(final_amount), 0) FROM quotations WHERE status = 'approved' AND created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue;

-- View para relatório de agendamentos
CREATE OR REPLACE VIEW appointments_report AS
SELECT 
    a.id,
    a.title,
    a.start_date,
    a.end_date,
    a.status,
    a.priority,
    c.name as client_name,
    c.phone as client_phone,
    s.name as service_name,
    cat.name as category_name,
    cat.color as category_color
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN categories cat ON s.category_id = cat.id;

-- View para relatório de orçamentos
CREATE OR REPLACE VIEW quotations_report AS
SELECT 
    q.id,
    q.title,
    q.total_amount,
    q.discount_amount,
    q.final_amount,
    q.status,
    q.valid_until,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    u.name as created_by_name
FROM quotations q
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN users u ON q.created_by = u.id;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE users IS 'Usuários do sistema (administradores, gerentes, operadores)';
COMMENT ON TABLE categories IS 'Categorias de serviços oferecidos';
COMMENT ON TABLE clients IS 'Clientes cadastrados no sistema';
COMMENT ON TABLE services IS 'Serviços oferecidos pela empresa';
COMMENT ON TABLE appointments IS 'Agendamentos de serviços';
COMMENT ON TABLE quotations IS 'Orçamentos enviados para clientes';
COMMENT ON TABLE quotation_items IS 'Itens que compõem um orçamento';
COMMENT ON TABLE emails IS 'Log de emails enviados pelo sistema';
COMMENT ON TABLE settings IS 'Configurações do sistema';
COMMENT ON TABLE activity_logs IS 'Log de atividades dos usuários';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
