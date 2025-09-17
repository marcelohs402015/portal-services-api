-- =====================================================
-- Portal Services API - Dados Iniciais
-- =====================================================

-- =====================================================
-- Inserir Categorias Padrão
-- =====================================================

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

-- =====================================================
-- Inserir Serviços Padrão
-- =====================================================

INSERT INTO services (name, description, price, duration, category_id, requires_quote) VALUES
('Instalação Elétrica', 'Instalação completa de sistema elétrico residencial', 80.00, 480, 
 (SELECT id FROM categories WHERE name = 'Eletricista'), false),
('Manutenção Elétrica', 'Reparo e manutenção de instalações elétricas', 60.00, 180, 
 (SELECT id FROM categories WHERE name = 'Eletricista'), false),
('Reparo de Vazamento', 'Reparo de vazamentos em canos e conexões', 70.00, 240, 
 (SELECT id FROM categories WHERE name = 'Encanador'), false),
('Instalação Hidráulica', 'Instalação de sistema hidráulico completo', 90.00, 720, 
 (SELECT id FROM categories WHERE name = 'Encanador'), true),
('Pintura Residencial', 'Pintura de paredes e tetos em residências', 25.00, 1440, 
 (SELECT id FROM categories WHERE name = 'Pintor'), true),
('Alvenaria', 'Construção e reparo de paredes e estruturas', 45.00, 2880, 
 (SELECT id FROM categories WHERE name = 'Pedreiro'), true),
('Fabricação de Móveis', 'Fabricação de móveis sob medida', 120.00, 10080, 
 (SELECT id FROM categories WHERE name = 'Marceneiro'), true);

-- =====================================================
-- Inserir Templates de Email Padrão
-- =====================================================

INSERT INTO email_templates (name, subject, body, category, variables) VALUES
('Orçamento Padrão', 'Orçamento - {{service_name}}', 
 'Olá {{client_name}},

Obrigado pelo seu interesse em nossos serviços!

Segue abaixo o orçamento solicitado:

Serviço: {{service_name}}
Descrição: {{service_description}}
Valor: R$ {{service_price}}

Este orçamento é válido por 30 dias.

Atenciosamente,
Equipe Portal Services', 
 'Geral', 
 '["client_name", "service_name", "service_description", "service_price"]'),

('Confirmação de Agendamento', 'Agendamento Confirmado - {{service_name}}', 
 'Olá {{client_name}},

Seu agendamento foi confirmado!

Data: {{appointment_date}}
Horário: {{appointment_time}}
Serviço: {{service_name}}

Nos vemos em breve!

Atenciosamente,
Equipe Portal Services', 
 'Geral', 
 '["client_name", "appointment_date", "appointment_time", "service_name"]');

-- =====================================================
-- Inserir Configurações do Sistema
-- =====================================================

INSERT INTO system_settings (key, value, description) VALUES
('email_config', 
 '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "use_tls": true}', 
 'Configurações de email SMTP'),

('app_config', 
 '{"default_quotation_validity_days": 30, "max_appointments_per_day": 10, "currency": "BRL"}', 
 'Configurações gerais da aplicação'),

('ai_config', 
 '{"confidence_threshold": 0.7, "auto_respond": false}', 
 'Configurações de IA para categorização'),

('business_info', 
 '{"name": "Portal Services", "email": "contato@portalservices.com", "phone": "(11) 99999-0000", "address": "São Paulo, SP"}', 
 'Informações da empresa'),

('quotation_settings', 
 '{"default_validity_days": 30, "currency": "BRL", "tax_rate": 0.0, "discount_limit": 0.1}', 
 'Configurações de orçamento'),

('appointment_settings', 
 '{"default_duration": 120, "working_hours": {"start": "08:00", "end": "18:00"}, "working_days": [1,2,3,4,5]}', 
 'Configurações de agendamento'),

('notification_settings', 
 '{"email_notifications": true, "sms_notifications": false, "reminder_hours": 24}', 
 'Configurações de notificação')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Dados de Exemplo (Opcional)
-- =====================================================

-- Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, address, city, state, notes) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'Rua das Flores, 123', 'São Paulo', 'SP', 'Cliente preferencial'),
('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'Av. Paulista, 456', 'São Paulo', 'SP', 'Interessada em serviços de pintura'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-3333', 'Rua Augusta, 789', 'São Paulo', 'SP', 'Precisa de serviços de elétrica'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-4444', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', 'Cliente novo, interessada em marcenaria');

-- Inserir orçamentos de exemplo
INSERT INTO quotations (client_id, services, subtotal, discount, total, status, valid_until, notes) VALUES
((SELECT id FROM clients WHERE email = 'joao.silva@email.com'), 
 '[{"id": 1, "name": "Instalação Elétrica", "price": 80.00, "quantity": 6}]', 
 480.00, 0.00, 480.00, 'pending', CURRENT_DATE + INTERVAL '30 days', 'Instalação elétrica completa da casa'),

((SELECT id FROM clients WHERE email = 'maria.santos@email.com'), 
 '[{"id": 5, "name": "Pintura Residencial", "price": 25.00, "quantity": 50}]', 
 1250.00, 50.00, 1200.00, 'accepted', CURRENT_DATE + INTERVAL '30 days', 'Pintura de 2 quartos e sala'),

((SELECT id FROM clients WHERE email = 'pedro.oliveira@email.com'), 
 '[{"id": 3, "name": "Reparo de Vazamento", "price": 70.00, "quantity": 2}]', 
 140.00, 0.00, 140.00, 'draft', CURRENT_DATE + INTERVAL '30 days', 'Reparo de vazamento na cozinha');

-- Inserir agendamentos de exemplo
INSERT INTO appointments (client_id, service_ids, date, time, duration, address, notes, status) VALUES
((SELECT id FROM clients WHERE email = 'joao.silva@email.com'), '[1]', 
 CURRENT_DATE + INTERVAL '7 days', '09:00:00', 480, 'Rua das Flores, 123 - São Paulo/SP', 
 'Instalação elétrica completa', 'scheduled'),

((SELECT id FROM clients WHERE email = 'maria.santos@email.com'), '[5]', 
 CURRENT_DATE + INTERVAL '10 days', '08:00:00', 1440, 'Av. Paulista, 456 - São Paulo/SP', 
 'Pintura de 2 quartos e sala', 'confirmed'),

((SELECT id FROM clients WHERE email = 'pedro.oliveira@email.com'), '[3]', 
 CURRENT_DATE + INTERVAL '3 days', '14:00:00', 120, 'Rua Augusta, 789 - São Paulo/SP', 
 'Reparo de vazamento na cozinha', 'scheduled');

-- Inserir emails de exemplo
INSERT INTO emails (gmail_id, subject, sender, date, body, category, processed, responded) VALUES
('gmail-001', 'Preciso de um eletricista', 'joao.silva@email.com', CURRENT_TIMESTAMP - INTERVAL '2 days', 
 'Olá, preciso de um eletricista para instalação elétrica na minha casa nova. Podem me enviar um orçamento?', 
 'Eletricista', true, true),

('gmail-002', 'Vazamento de água na cozinha', 'pedro.oliveira@email.com', CURRENT_TIMESTAMP - INTERVAL '1 day', 
 'Tenho um vazamento de água na cozinha, preciso de um encanador urgente!', 
 'Encanador', true, false),

('gmail-003', 'Pintura da casa', 'maria.santos@email.com', CURRENT_TIMESTAMP - INTERVAL '3 days', 
 'Gostaria de pintar 2 quartos e a sala da minha casa. Qual o valor?', 
 'Pintor', true, true)

ON CONFLICT (gmail_id) DO NOTHING;
