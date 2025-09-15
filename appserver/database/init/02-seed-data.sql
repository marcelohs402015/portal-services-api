-- =====================================================
-- Script de Dados Iniciais (Seed Data)
-- Portal Services - Sistema de Gestão de Serviços
-- =====================================================

-- Este script é executado após a criação das tabelas
-- para inserir dados de exemplo e configurações padrão

-- =====================================================
-- Dados de Exemplo para Testes
-- =====================================================

-- Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, address, notes) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo/SP', 'Cliente preferencial'),
('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo/SP', 'Interessada em serviços de pintura'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo/SP', 'Precisa de serviços de elétrica'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-4444', 'Rua Oscar Freire, 321 - São Paulo/SP', 'Cliente novo, interessada em marcenaria')
ON CONFLICT DO NOTHING;

-- Inserir orçamentos de exemplo
INSERT INTO quotations (id, client_email, client_name, client_phone, client_address, services, subtotal, discount, total, status, valid_until, notes) VALUES
('quote-001', 'joao.silva@email.com', 'João Silva', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo/SP', 
 '[{"id": "eletricista-instalacao", "name": "Instalação Elétrica", "price": 80.00, "quantity": 6}]', 
 480.00, 0.00, 480.00, 'pending', CURRENT_DATE + INTERVAL '30 days', 'Instalação elétrica completa da casa'),
('quote-002', 'maria.santos@email.com', 'Maria Santos', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo/SP', 
 '[{"id": "pintor-residencial", "name": "Pintura Residencial", "price": 25.00, "quantity": 50}]', 
 1250.00, 50.00, 1200.00, 'accepted', CURRENT_DATE + INTERVAL '30 days', 'Pintura de 2 quartos e sala'),
('quote-003', 'pedro.oliveira@email.com', 'Pedro Oliveira', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo/SP', 
 '[{"id": "encanador-vazamento", "name": "Reparo de Vazamento", "price": 70.00, "quantity": 2}]', 
 140.00, 0.00, 140.00, 'draft', CURRENT_DATE + INTERVAL '30 days', 'Reparo de vazamento na cozinha')
ON CONFLICT (id) DO NOTHING;

-- Inserir agendamentos de exemplo
INSERT INTO appointments (id, client_id, client_name, service_ids, service_names, date, time, duration, address, notes, status) VALUES
('appt-001', '1', 'João Silva', '["eletricista-instalacao"]', '["Instalação Elétrica"]', 
 CURRENT_DATE + INTERVAL '7 days', '09:00:00', 480, 'Rua das Flores, 123 - São Paulo/SP', 
 'Instalação elétrica completa', 'scheduled'),
('appt-002', '2', 'Maria Santos', '["pintor-residencial"]', '["Pintura Residencial"]', 
 CURRENT_DATE + INTERVAL '10 days', '08:00:00', 1440, 'Av. Paulista, 456 - São Paulo/SP', 
 'Pintura de 2 quartos e sala', 'confirmed'),
('appt-003', '3', 'Pedro Oliveira', '["encanador-vazamento"]', '["Reparo de Vazamento"]', 
 CURRENT_DATE + INTERVAL '3 days', '14:00:00', 120, 'Rua Augusta, 789 - São Paulo/SP', 
 'Reparo de vazamento na cozinha', 'scheduled')
ON CONFLICT (id) DO NOTHING;

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

-- =====================================================
-- Configurações Adicionais do Sistema
-- =====================================================

-- Atualizar configurações existentes ou inserir novas
INSERT INTO system_settings (id, key, value, description) VALUES
('business-info', 'business_info', 
 '{"name": "Portal Services", "email": "contato@portalservices.com", "phone": "(11) 99999-0000", "address": "São Paulo, SP"}', 
 'Informações da empresa'),
('quotation-settings', 'quotation_settings', 
 '{"default_validity_days": 30, "currency": "BRL", "tax_rate": 0.0, "discount_limit": 0.1}', 
 'Configurações de orçamento'),
('appointment-settings', 'appointment_settings', 
 '{"default_duration": 120, "working_hours": {"start": "08:00", "end": "18:00"}, "working_days": [1,2,3,4,5]}', 
 'Configurações de agendamento'),
('notification-settings', 'notification_settings', 
 '{"email_notifications": true, "sms_notifications": false, "reminder_hours": 24}', 
 'Configurações de notificação')
ON CONFLICT (id) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Log de Finalização
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Dados iniciais (seed data) inseridos com sucesso!';
    RAISE NOTICE 'Clientes de exemplo: 4';
    RAISE NOTICE 'Orçamentos de exemplo: 3';
    RAISE NOTICE 'Agendamentos de exemplo: 3';
    RAISE NOTICE 'Emails de exemplo: 3';
    RAISE NOTICE 'Configurações do sistema atualizadas';
END
$$;
