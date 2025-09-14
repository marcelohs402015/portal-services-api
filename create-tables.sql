-- Script para criar todas as tabelas necessárias para o Postal Services
-- Execute: docker exec -i db-portalservices-postgress psql -U admin -d postalservices-db < create-tables.sql

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#FF6B6B',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration INTEGER, -- em minutos
    category_id INTEGER REFERENCES categories(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    service_id INTEGER REFERENCES services(id),
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2),
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de emails
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    body TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO categories (name, description, color) VALUES
('Eletricista', 'Serviços de eletricidade residencial e comercial', '#FF6B6B'),
('Encanador', 'Serviços de encanamento e hidráulica', '#4ECDC4'),
('Pintor', 'Serviços de pintura residencial e comercial', '#45B7D1'),
('Pedreiro', 'Serviços de alvenaria e construção', '#96CEB4'),
('Marceneiro', 'Serviços de marcenaria e carpintaria', '#FFEAA7')
ON CONFLICT DO NOTHING;

INSERT INTO clients (name, email, phone, address) VALUES
('João Silva', 'joao@email.com', '11999999999', 'Rua das Flores, 123'),
('Maria Santos', 'maria@email.com', '11888888888', 'Av. Principal, 456'),
('Pedro Costa', 'pedro@email.com', '11777777777', 'Rua do Comércio, 789')
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, price, duration, category_id) VALUES
('Instalação de Tomada', 'Instalação de tomada elétrica simples', 50.00, 30, 1),
('Reparo de Torneira', 'Reparo e manutenção de torneira', 80.00, 45, 2),
('Pintura de Parede', 'Pintura de parede interna', 120.00, 120, 3),
('Construção de Muro', 'Construção de muro de alvenaria', 200.00, 240, 4),
('Fabricação de Móvel', 'Fabricação de móvel sob medida', 500.00, 480, 5)
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(start_date);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);

-- Atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
