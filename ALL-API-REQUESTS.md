# 🚀 **TODAS AS REQUESTS DAS APIs - Portal Services**

## 📋 **Configuração Base**
- **Base URL:** `http://localhost:3001`
- **Content-Type:** `application/json`

---

## 🎯 **1. HEALTH CHECK**

### **GET /health**
```bash
curl -X GET http://localhost:3001/health
```

### **GET /api/health**
```bash
curl -X GET http://localhost:3001/api/health
```

---

## 🏷️ **2. CATEGORIES API - `/api/categories`**

### **GET /api/categories** - Listar todas as categorias
```bash
curl -X GET http://localhost:3001/api/categories
```

### **GET /api/categories** - Com filtros
```bash
curl -X GET "http://localhost:3001/api/categories?active=true&search=elétrica"
```

### **GET /api/categories/:id** - Obter categoria por ID
```bash
curl -X GET http://localhost:3001/api/categories/1
```

### **POST /api/categories** - Criar nova categoria
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arquiteto",
    "description": "Serviços de arquitetura e projetos",
    "keywords": ["arquitetura", "projeto", "planta", "reforma"],
    "patterns": ["projeto arquitetônico", "planta baixa", "reforma"],
    "domains": ["residencial", "comercial"],
    "color": "#9B59B6",
    "active": true
  }'
```

### **PUT /api/categories/:id** - Atualizar categoria
```bash
curl -X PUT http://localhost:3001/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eletricista Residencial",
    "description": "Serviços de eletricidade residencial",
    "color": "#E74C3C"
  }'
```

### **DELETE /api/categories/:id** - Deletar categoria
```bash
curl -X DELETE http://localhost:3001/api/categories/6
```

### **PATCH /api/categories/:id/toggle** - Ativar/Desativar categoria
```bash
curl -X PATCH http://localhost:3001/api/categories/1/toggle
```

---

## 🔧 **3. SERVICES API - `/api/services`**

### **GET /api/services** - Listar todos os serviços
```bash
curl -X GET http://localhost:3001/api/services
```

### **GET /api/services** - Com filtros e paginação
```bash
curl -X GET "http://localhost:3001/api/services?category=Eletricista&active=true&page=1&limit=5"
```

### **GET /api/services/:id** - Obter serviço por ID
```bash
curl -X GET http://localhost:3001/api/services/srv-001
```

### **POST /api/services** - Criar novo serviço
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instalação de Ventilador",
    "description": "Instalação de ventilador de teto",
    "category": "Eletricista",
    "price": 120.00,
    "unit": "unit",
    "estimated_time": "2 horas",
    "materials": ["ventilador", "fio", "suporte"],
    "active": true
  }'
```

### **PUT /api/services/:id** - Atualizar serviço
```bash
curl -X PUT http://localhost:3001/api/services/srv-001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instalação de Tomada Dupla",
    "price": 75.00,
    "estimated_time": "45 minutos"
  }'
```

### **DELETE /api/services/:id** - Deletar serviço
```bash
curl -X DELETE http://localhost:3001/api/services/srv-006
```

### **PATCH /api/services/:id/toggle** - Ativar/Desativar serviço
```bash
curl -X PATCH http://localhost:3001/api/services/srv-001/toggle
```

---

## 👥 **4. CLIENTS API - `/api/clients`**

### **GET /api/clients** - Listar todos os clientes
```bash
curl -X GET http://localhost:3001/api/clients
```

### **GET /api/clients** - Com filtros e paginação
```bash
curl -X GET "http://localhost:3001/api/clients?search=João&page=1&limit=10"
```

### **GET /api/clients/:id** - Obter cliente por ID
```bash
curl -X GET http://localhost:3001/api/clients/1
```

### **POST /api/clients** - Criar novo cliente
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Costa",
    "email": "ana.costa@email.com",
    "phone": "(11) 99999-4444",
    "address": "Rua das Palmeiras, 456",
    "notes": "Cliente preferencial, sempre pontual"
  }'
```

### **PUT /api/clients/:id** - Atualizar cliente
```bash
curl -X PUT http://localhost:3001/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Santos",
    "phone": "(11) 99999-1111",
    "notes": "Cliente VIP - desconto especial"
  }'
```

### **DELETE /api/clients/:id** - Deletar cliente
```bash
curl -X DELETE http://localhost:3001/api/clients/4
```

### **GET /api/clients/:id/history** - Histórico do cliente
```bash
curl -X GET http://localhost:3001/api/clients/1/history
```

---

## 💰 **5. QUOTATIONS API - `/api/quotations`**

### **GET /api/quotations** - Listar todos os orçamentos
```bash
curl -X GET http://localhost:3001/api/quotations
```

### **GET /api/quotations** - Com filtros
```bash
curl -X GET "http://localhost:3001/api/quotations?status=pending&client_email=joao.silva@email.com"
```

### **GET /api/quotations/:id** - Obter orçamento por ID
```bash
curl -X GET http://localhost:3001/api/quotations/quot-001
```

### **POST /api/quotations** - Criar novo orçamento
```bash
curl -X POST http://localhost:3001/api/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "client_email": "ana.costa@email.com",
    "client_name": "Ana Costa",
    "client_phone": "(11) 99999-4444",
    "client_address": "Rua das Palmeiras, 456",
    "services": [
      {
        "service_id": "srv-001",
        "name": "Instalação de Tomada",
        "quantity": 2,
        "price": 50.00,
        "total": 100.00
      },
      {
        "service_id": "srv-002",
        "name": "Troca de Chuveiro",
        "quantity": 1,
        "price": 80.00,
        "total": 80.00
      }
    ],
    "subtotal": 180.00,
    "discount": 10.00,
    "total": 170.00,
    "status": "draft",
    "valid_until": "2025-10-14",
    "notes": "Orçamento com desconto especial"
  }'
```

### **PUT /api/quotations/:id** - Atualizar orçamento
```bash
curl -X PUT http://localhost:3001/api/quotations/quot-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending",
    "notes": "Orçamento enviado para aprovação"
  }'
```

### **PATCH /api/quotations/:id/status** - Atualizar status
```bash
curl -X PATCH http://localhost:3001/api/quotations/quot-001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

### **DELETE /api/quotations/:id** - Deletar orçamento
```bash
curl -X DELETE http://localhost:3001/api/quotations/quot-001
```

---

## 📅 **6. APPOINTMENTS API - `/api/appointments`**

### **GET /api/appointments** - Listar todos os agendamentos
```bash
curl -X GET http://localhost:3001/api/appointments
```

### **GET /api/appointments** - Com filtros
```bash
curl -X GET "http://localhost:3001/api/appointments?status=scheduled&client_id=1&date=2025-09-15"
```

### **GET /api/appointments/:id** - Obter agendamento por ID
```bash
curl -X GET http://localhost:3001/api/appointments/appt-001
```

### **POST /api/appointments** - Criar novo agendamento
```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1",
    "client_name": "João Silva",
    "service_ids": ["srv-001", "srv-002"],
    "service_names": ["Instalação de Tomada", "Troca de Chuveiro"],
    "date": "2025-09-20",
    "time": "14:00",
    "duration": 180,
    "address": "Rua das Flores, 123",
    "notes": "Cliente preferencial",
    "status": "scheduled"
  }'
```

### **PUT /api/appointments/:id** - Atualizar agendamento
```bash
curl -X PUT http://localhost:3001/api/appointments/appt-001 \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-09-21",
    "time": "15:00",
    "notes": "Reagendado para o dia seguinte"
  }'
```

### **PATCH /api/appointments/:id/status** - Atualizar status
```bash
curl -X PATCH http://localhost:3001/api/appointments/appt-001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### **DELETE /api/appointments/:id** - Deletar agendamento
```bash
curl -X DELETE http://localhost:3001/api/appointments/appt-001
```

---

## 📧 **7. EMAILS API - `/api/emails`**

### **GET /api/emails** - Listar todos os emails
```bash
curl -X GET http://localhost:3001/api/emails
```

### **GET /api/emails** - Com filtros e paginação
```bash
curl -X GET "http://localhost:3001/api/emails?category=Eletricista&processed=false&page=1&limit=10"
```

### **GET /api/emails/:id** - Obter email por ID
```bash
curl -X GET http://localhost:3001/api/emails/1
```

### **POST /api/emails** - Criar novo email
```bash
curl -X POST http://localhost:3001/api/emails \
  -H "Content-Type: application/json" \
  -d '{
    "gmail_id": "gmail-123456",
    "subject": "Preciso de um eletricista",
    "sender": "cliente@email.com",
    "date": "2025-09-14T16:00:00Z",
    "body": "Olá, preciso de um eletricista para instalar algumas tomadas em minha casa.",
    "snippet": "Preciso de um eletricista...",
    "category": "Eletricista",
    "confidence": 0.95,
    "processed": false,
    "responded": false
  }'
```

### **PUT /api/emails/:id** - Atualizar email
```bash
curl -X PUT http://localhost:3001/api/emails/1 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Eletricista",
    "processed": true,
    "response_template": "template_eletricista"
  }'
```

### **PATCH /api/emails/:id/process** - Marcar como processado
```bash
curl -X PATCH http://localhost:3001/api/emails/1/process
```

### **PATCH /api/emails/:id/category** - Atualizar categoria
```bash
curl -X PATCH http://localhost:3001/api/emails/1/category \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Encanador"
  }'
```

### **DELETE /api/emails/:id** - Deletar email
```bash
curl -X DELETE http://localhost:3001/api/emails/1
```

---

## 📊 **8. STATISTICS API - `/api/stats`**

### **GET /api/stats/business** - Estatísticas gerais do negócio
```bash
curl -X GET http://localhost:3001/api/stats/business
```

### **GET /api/stats/revenue** - Estatísticas de receita
```bash
curl -X GET http://localhost:3001/api/stats/revenue
```

### **GET /api/stats/clients** - Estatísticas de clientes
```bash
curl -X GET http://localhost:3001/api/stats/clients
```

### **GET /api/stats/services** - Estatísticas de serviços
```bash
curl -X GET http://localhost:3001/api/stats/services
```

### **GET /api/stats/emails** - Estatísticas de emails
```bash
curl -X GET http://localhost:3001/api/stats/emails
```

---

## 🔧 **9. ADMIN API - `/api/admin`**

### **GET /api/admin/database** - Status do banco de dados
```bash
curl -X GET http://localhost:3001/api/admin/database
```

### **GET /api/admin/logs** - Logs do sistema
```bash
curl -X GET http://localhost:3001/api/admin/logs
```

---

## 🧪 **10. TESTES DE VALIDAÇÃO**

### **Teste de validação - Categoria inválida**
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "description": "Teste de validação"
  }'
```

### **Teste de validação - Serviço inválido**
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Serviço Teste",
    "price": -10
  }'
```

### **Teste de validação - Cliente inválido**
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "email-invalido"
  }'
```

---

## 🚀 **11. SCRIPT DE TESTE COMPLETO**

### **Teste todas as APIs de uma vez**
```bash
#!/bin/bash

echo "🚀 Testando todas as APIs do Portal Services..."

# Health Check
echo "1. Health Check..."
curl -s http://localhost:3001/health | jq .

# Categories
echo "2. Categories..."
curl -s http://localhost:3001/api/categories | jq .

# Services
echo "3. Services..."
curl -s http://localhost:3001/api/services | jq .

# Clients
echo "4. Clients..."
curl -s http://localhost:3001/api/clients | jq .

# Quotations
echo "5. Quotations..."
curl -s http://localhost:3001/api/quotations | jq .

# Appointments
echo "6. Appointments..."
curl -s http://localhost:3001/api/appointments | jq .

# Emails
echo "7. Emails..."
curl -s http://localhost:3001/api/emails | jq .

# Statistics
echo "8. Statistics..."
curl -s http://localhost:3001/api/stats/business | jq .

echo "✅ Testes concluídos!"
```

---

## 📝 **NOTAS IMPORTANTES:**

1. **Todos os endpoints** retornam JSON
2. **Códigos de status HTTP** padrão (200, 201, 400, 404, 500)
3. **Validação** com Zod em todos os endpoints
4. **Paginação** disponível em listagens
5. **Filtros** disponíveis na maioria dos endpoints
6. **Logs estruturados** para debug
7. **CORS** configurado para desenvolvimento

## 🎯 **PRÓXIMOS PASSOS:**
1. Execute os comandos curl acima
2. Teste com Bruno ou Postman
3. Verifique os logs do servidor
4. Teste validações e tratamento de erros
