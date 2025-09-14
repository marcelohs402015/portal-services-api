# 🚀 **GUIA COMPLETO DE TESTES DAS APIs - Portal Services**

## 📋 **Configuração Base**

**Base URL:** `http://localhost:3001`  
**Content-Type:** `application/json`

---

## 🎯 **1. CATEGORIES API - `/api/categories`**

### **GET /api/categories** - Listar Categorias
```http
GET http://localhost:3001/api/categories
```

**Query Parameters:**
- `active` (boolean): Filtrar por status ativo
- `search` (string): Buscar por nome ou descrição

**Exemplo:**
```http
GET http://localhost:3001/api/categories?active=true&search=elétrica
```

### **GET /api/categories/:id** - Obter Categoria por ID
```http
GET http://localhost:3001/api/categories/1
```

### **POST /api/categories** - Criar Nova Categoria
```http
POST http://localhost:3001/api/categories
Content-Type: application/json

{
  "name": "Elétrica",
  "description": "Serviços elétricos residenciais e comerciais",
  "keywords": ["elétrica", "fiação", "instalação", "manutenção"],
  "patterns": ["problema elétrico", "instalação elétrica", "manutenção elétrica"],
  "domains": ["residencial", "comercial"],
  "color": "#FF6B35",
  "active": true
}
```

### **PUT /api/categories/:id** - Atualizar Categoria
```http
PUT http://localhost:3001/api/categories/1
Content-Type: application/json

{
  "name": "Elétrica Residencial",
  "description": "Serviços elétricos para residências",
  "keywords": ["elétrica", "residencial", "fiação"],
  "color": "#FF6B35"
}
```

### **DELETE /api/categories/:id** - Desativar Categoria
```http
DELETE http://localhost:3001/api/categories/1
```

---

## 🛠️ **2. SERVICES API - `/api/services`**

### **GET /api/services** - Listar Serviços
```http
GET http://localhost:3001/api/services
```

**Query Parameters:**
- `active` (boolean): Filtrar por status ativo
- `category` (string): Filtrar por categoria
- `search` (string): Buscar por nome ou descrição
- `sort` (string): Campo para ordenação (name, category, price, created_at)
- `order` (string): Ordem (ASC, DESC)

**Exemplo:**
```http
GET http://localhost:3001/api/services?active=true&category=Elétrica&sort=price&order=ASC
```

### **GET /api/services/:id** - Obter Serviço por ID
```http
GET http://localhost:3001/api/services/service-uuid-here
```

### **GET /api/services/category/:category** - Obter Serviços por Categoria
```http
GET http://localhost:3001/api/services/category/Elétrica
```

### **POST /api/services** - Criar Novo Serviço
```http
POST http://localhost:3001/api/services
Content-Type: application/json

{
  "name": "Instalação de Chuveiro Elétrico",
  "description": "Instalação completa de chuveiro elétrico com fiação adequada",
  "category": "Elétrica",
  "price": 150.00,
  "unit": "service",
  "estimated_time": "2-3 horas",
  "materials": ["chuveiro", "fio 2.5mm", "disjuntor 20A", "caixa de passagem"],
  "active": true
}
```

### **PUT /api/services/:id** - Atualizar Serviço
```http
PUT http://localhost:3001/api/services/service-uuid-here
Content-Type: application/json

{
  "name": "Instalação de Chuveiro Elétrico Premium",
  "price": 180.00,
  "materials": ["chuveiro premium", "fio 4.0mm", "disjuntor 25A"]
}
```

### **DELETE /api/services/:id** - Desativar Serviço
```http
DELETE http://localhost:3001/api/services/service-uuid-here
```

### **PATCH /api/services/:id/toggle** - Alternar Status
```http
PATCH http://localhost:3001/api/services/service-uuid-here/toggle
```

---

## 👥 **3. CLIENTS API - `/api/clients`**

### **GET /api/clients** - Listar Clientes
```http
GET http://localhost:3001/api/clients
```

**Query Parameters:**
- `search` (string): Buscar por nome, email ou telefone
- `sort` (string): Campo para ordenação (name, email, created_at)
- `order` (string): Ordem (ASC, DESC)
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 50, máx: 100)

**Exemplo:**
```http
GET http://localhost:3001/api/clients?search=joão&page=1&limit=10&sort=name&order=ASC
```

### **GET /api/clients/:id** - Obter Cliente por ID
```http
GET http://localhost:3001/api/clients/1
```

### **GET /api/clients/email/:email** - Obter Cliente por Email
```http
GET http://localhost:3001/api/clients/email/joao@email.com
```

### **POST /api/clients** - Criar Novo Cliente
```http
POST http://localhost:3001/api/clients
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123 - Vila Madalena, São Paulo - SP",
  "notes": "Cliente preferencial, sempre pontual"
}
```

### **PUT /api/clients/:id** - Atualizar Cliente
```http
PUT http://localhost:3001/api/clients/1
Content-Type: application/json

{
  "name": "João Silva Santos",
  "phone": "(11) 98888-8888",
  "address": "Rua das Flores, 123 - Vila Madalena, São Paulo - SP, CEP: 01234-567"
}
```

### **DELETE /api/clients/:id** - Deletar Cliente
```http
DELETE http://localhost:3001/api/clients/1
```

### **GET /api/clients/:id/history** - Histórico do Cliente
```http
GET http://localhost:3001/api/clients/1/history
```

---

## 💰 **4. QUOTATIONS API - `/api/quotations`**

### **GET /api/quotations** - Listar Orçamentos
```http
GET http://localhost:3001/api/quotations
```

**Query Parameters:**
- `status` (string): Filtrar por status (pending, accepted, rejected)
- `client_email` (string): Filtrar por email do cliente

**Exemplo:**
```http
GET http://localhost:3001/api/quotations?status=pending&client_email=joao@email.com
```

### **GET /api/quotations/:id** - Obter Orçamento por ID
```http
GET http://localhost:3001/api/quotations/quotation-uuid-here
```

### **POST /api/quotations** - Criar Novo Orçamento
```http
POST http://localhost:3001/api/quotations
Content-Type: application/json

{
  "client_email": "joao.silva@email.com",
  "services": [
    {
      "id": "service-uuid-1",
      "name": "Instalação de Chuveiro Elétrico",
      "price": 150.00,
      "quantity": 1
    },
    {
      "id": "service-uuid-2",
      "name": "Troca de Fiação",
      "price": 200.00,
      "quantity": 1
    }
  ],
  "subtotal": 350.00,
  "discount": 50.00,
  "total": 300.00,
  "valid_until": "2024-03-15",
  "notes": "Orçamento válido por 30 dias. Desconto especial para cliente preferencial."
}
```

### **PUT /api/quotations/:id** - Atualizar Orçamento
```http
PUT http://localhost:3001/api/quotations/quotation-uuid-here
Content-Type: application/json

{
  "services": [
    {
      "id": "service-uuid-1",
      "name": "Instalação de Chuveiro Elétrico Premium",
      "price": 180.00,
      "quantity": 1
    }
  ],
  "subtotal": 180.00,
  "discount": 0,
  "total": 180.00,
  "notes": "Orçamento atualizado com serviço premium"
}
```

### **DELETE /api/quotations/:id** - Deletar Orçamento
```http
DELETE http://localhost:3001/api/quotations/quotation-uuid-here
```

### **PATCH /api/quotations/:id/status** - Atualizar Status
```http
PATCH http://localhost:3001/api/quotations/quotation-uuid-here/status
Content-Type: application/json

{
  "status": "accepted"
}
```

---

## 📅 **5. APPOINTMENTS API - `/api/appointments`**

### **GET /api/appointments** - Listar Agendamentos
```http
GET http://localhost:3001/api/appointments
```

**Query Parameters:**
- `status` (string): Filtrar por status (scheduled, completed, cancelled)
- `client_id` (string): Filtrar por ID do cliente
- `date` (string): Filtrar por data (YYYY-MM-DD)

**Exemplo:**
```http
GET http://localhost:3001/api/appointments?status=scheduled&date=2024-02-15
```

### **GET /api/appointments/:id** - Obter Agendamento por ID
```http
GET http://localhost:3001/api/appointments/appointment-uuid-here
```

### **POST /api/appointments** - Criar Novo Agendamento
```http
POST http://localhost:3001/api/appointments
Content-Type: application/json

{
  "client_id": "1",
  "service_ids": ["service-uuid-1", "service-uuid-2"],
  "service_names": ["Instalação de Chuveiro Elétrico", "Troca de Fiação"],
  "date": "2024-02-15",
  "time": "14:00",
  "duration": 180,
  "status": "scheduled",
  "notes": "Cliente preferencial - agendar para manhã se possível"
}
```

### **PUT /api/appointments/:id** - Atualizar Agendamento
```http
PUT http://localhost:3001/api/appointments/appointment-uuid-here
Content-Type: application/json

{
  "date": "2024-02-16",
  "time": "10:00",
  "duration": 240,
  "notes": "Reagendado para manhã conforme solicitado"
}
```

### **DELETE /api/appointments/:id** - Deletar Agendamento
```http
DELETE http://localhost:3001/api/appointments/appointment-uuid-here
```

### **PATCH /api/appointments/:id/status** - Atualizar Status
```http
PATCH http://localhost:3001/api/appointments/appointment-uuid-here/status
Content-Type: application/json

{
  "status": "completed"
}
```

---

## 📧 **6. EMAILS API - `/api/emails`**

### **GET /api/emails** - Listar Emails
```http
GET http://localhost:3001/api/emails
```

**Query Parameters:**
- `category` (string): Filtrar por categoria
- `sender` (string): Filtrar por remetente
- `processed` (boolean): Filtrar por status de processamento
- `date_range` (string): Filtrar por período (YYYY-MM-DD:YYYY-MM-DD)

**Exemplo:**
```http
GET http://localhost:3001/api/emails?category=Elétrica&processed=false&date_range=2024-02-01:2024-02-15
```

### **GET /api/emails/:id** - Obter Email por ID
```http
GET http://localhost:3001/api/emails/email-uuid-here
```

### **POST /api/emails** - Criar Novo Email
```http
POST http://localhost:3001/api/emails
Content-Type: application/json

{
  "sender": "cliente@email.com",
  "subject": "Problema elétrico em casa - Urgente",
  "body": "Olá, tenho um problema elétrico em casa. O chuveiro não está funcionando e preciso de um eletricista urgente. Pode me ajudar?",
  "category": "Elétrica",
  "processed": false,
  "date": "2024-02-01T10:30:00Z"
}
```

### **PUT /api/emails/:id** - Atualizar Email
```http
PUT http://localhost:3001/api/emails/email-uuid-here
Content-Type: application/json

{
  "category": "Elétrica - Urgente",
  "processed": true,
  "notes": "Cliente contatado, agendamento marcado para amanhã"
}
```

### **DELETE /api/emails/:id** - Deletar Email
```http
DELETE http://localhost:3001/api/emails/email-uuid-here
```

### **PATCH /api/emails/:id/process** - Marcar como Processado
```http
PATCH http://localhost:3001/api/emails/email-uuid-here/process
Content-Type: application/json

{
  "processed": true,
  "notes": "Email processado e cliente contatado"
}
```

### **PATCH /api/emails/:id/category** - Atualizar Categoria
```http
PATCH http://localhost:3001/api/emails/email-uuid-here/category
Content-Type: application/json

{
  "category": "Elétrica - Manutenção"
}
```

---

## 📊 **7. STATISTICS API - `/api/stats`**

### **GET /api/stats/business** - Estatísticas Gerais
```http
GET http://localhost:3001/api/stats/business
```

### **GET /api/stats/revenue** - Estatísticas de Receita
```http
GET http://localhost:3001/api/stats/revenue
```

### **GET /api/stats/clients** - Estatísticas de Clientes
```http
GET http://localhost:3001/api/stats/clients
```

### **GET /api/stats/services** - Estatísticas de Serviços
```http
GET http://localhost:3001/api/stats/services
```

### **GET /api/stats/emails** - Estatísticas de Emails
```http
GET http://localhost:3001/api/stats/emails
```

---

## 🛠️ **8. SYSTEM APIs**

### **GET /health** - Health Check da Aplicação
```http
GET http://localhost:3001/health
```

### **GET /api/health** - Health Check da API
```http
GET http://localhost:3001/api/health
```

---

## 📋 **Exemplos de Respostas**

### **Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "created_at": "2024-02-01T10:30:00Z"
  },
  "message": "Cliente criado com sucesso"
}
```

### **Resposta com Lista e Metadados:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "filters": {
      "search": "joão"
    },
    "sort": {
      "field": "name",
      "order": "ASC"
    }
  }
}
```

### **Resposta de Erro:**
```json
{
  "success": false,
  "error": "Cliente não encontrado"
}
```

### **Resposta de Erro de Validação:**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email deve ter formato válido"
    }
  ]
}
```

---

## 🎯 **Códigos de Status HTTP**

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Dados inválidos
- **404** - Recurso não encontrado
- **409** - Conflito (ex: email duplicado)
- **500** - Erro interno do servidor

---

## 🚀 **Dicas para Testes**

1. **Use o Bruno** para organizar as requisições por coleções
2. **Teste primeiro** as APIs de sistema (`/health`) para verificar se o servidor está rodando
3. **Crie dados** na ordem: Categories → Services → Clients → Quotations/Appointments
4. **Use IDs reais** retornados pelas APIs nos testes subsequentes
5. **Teste validações** enviando dados inválidos para verificar as mensagens de erro
6. **Verifique paginação** nas APIs que suportam (Clients)

---

## 📝 **Notas Importantes**

- Todos os IDs de serviços, orçamentos e agendamentos são **UUIDs**
- IDs de clientes e categorias são **números inteiros**
- Use **timestamps ISO 8601** para datas
- O campo `materials` em serviços é um **array de strings**
- O campo `services` em orçamentos é um **array de objetos**
- Todas as APIs retornam **JSON** com estrutura consistente
