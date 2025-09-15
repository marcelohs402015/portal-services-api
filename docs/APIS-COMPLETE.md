# 🚀 **APIs COMPLETAS - Portal Services**

## 📋 **Estrutura das APIs**

Todas as APIs estão organizadas sob o prefixo `/api/` e seguem padrões RESTful consistentes.

---

## 🎯 **1. Categories API - `/api/categories`**

### **Endpoints:**
- `GET /api/categories` - Listar categorias (com filtros: active, search)
- `GET /api/categories/:id` - Obter categoria por ID
- `POST /api/categories` - Criar nova categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Desativar categoria (soft delete)

### **Exemplo de Request:**
```json
POST /api/categories
{
  "name": "Elétrica",
  "description": "Serviços elétricos residenciais e comerciais",
  "keywords": ["elétrica", "fiação", "instalação"],
  "patterns": ["problema elétrico", "instalação elétrica"],
  "domains": ["residencial", "comercial"],
  "color": "#FF6B35",
  "active": true
}
```

---

## 🛠️ **2. Services API - `/api/services`**

### **Endpoints:**
- `GET /api/services` - Listar serviços (com filtros: active, category, search, sort)
- `GET /api/services/:id` - Obter serviço por ID
- `GET /api/services/category/:category` - Obter serviços por categoria
- `POST /api/services` - Criar novo serviço
- `PUT /api/services/:id` - Atualizar serviço
- `DELETE /api/services/:id` - Desativar serviço (soft delete)
- `PATCH /api/services/:id/toggle` - Alternar status ativo/inativo

### **Exemplo de Request:**
```json
POST /api/services
{
  "name": "Instalação de Chuveiro Elétrico",
  "description": "Instalação completa de chuveiro elétrico com fiação",
  "category": "Elétrica",
  "price": 150.00,
  "unit": "service",
  "estimated_time": "2-3 horas",
  "materials": ["chuveiro", "fio", "disjuntor"],
  "active": true
}
```

---

## 👥 **3. Clients API - `/api/clients`**

### **Endpoints:**
- `GET /api/clients` - Listar clientes (com paginação, filtros: search, sort)
- `GET /api/clients/:id` - Obter cliente por ID
- `GET /api/clients/email/:email` - Obter cliente por email
- `POST /api/clients` - Criar novo cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente (com verificação de dependências)
- `GET /api/clients/:id/history` - Obter histórico de orçamentos e agendamentos

### **Exemplo de Request:**
```json
POST /api/clients
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "notes": "Cliente preferencial"
}
```

---

## 💰 **4. Quotations API - `/api/quotations`**

### **Endpoints:**
- `GET /api/quotations` - Listar orçamentos (com filtros: status, client_email)
- `GET /api/quotations/:id` - Obter orçamento por ID
- `POST /api/quotations` - Criar novo orçamento
- `PUT /api/quotations/:id` - Atualizar orçamento
- `DELETE /api/quotations/:id` - Deletar orçamento
- `PATCH /api/quotations/:id/status` - Atualizar status do orçamento

### **Exemplo de Request:**
```json
POST /api/quotations
{
  "client_email": "joao@email.com",
  "services": [
    {
      "id": "service-1",
      "name": "Instalação de Chuveiro",
      "price": 150.00,
      "quantity": 1
    }
  ],
  "subtotal": 150.00,
  "discount": 0,
  "total": 150.00,
  "valid_until": "2024-02-15",
  "notes": "Orçamento válido por 30 dias"
}
```

---

## 📅 **5. Appointments API - `/api/appointments`**

### **Endpoints:**
- `GET /api/appointments` - Listar agendamentos (com filtros: status, client_id, date)
- `GET /api/appointments/:id` - Obter agendamento por ID
- `POST /api/appointments` - Criar novo agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Deletar agendamento
- `PATCH /api/appointments/:id/status` - Atualizar status do agendamento

### **Exemplo de Request:**
```json
POST /api/appointments
{
  "client_id": "1",
  "service_ids": ["service-1", "service-2"],
  "service_names": ["Instalação de Chuveiro", "Troca de Fiação"],
  "date": "2024-02-10",
  "time": "14:00",
  "duration": 180,
  "notes": "Cliente preferencial - manhã"
}
```

---

## 📧 **6. Emails API - `/api/emails`**

### **Endpoints:**
- `GET /api/emails` - Listar emails (com filtros: category, sender, processed, date_range)
- `GET /api/emails/:id` - Obter email por ID
- `POST /api/emails` - Criar novo email
- `PUT /api/emails/:id` - Atualizar email
- `DELETE /api/emails/:id` - Deletar email
- `PATCH /api/emails/:id/process` - Marcar email como processado
- `PATCH /api/emails/:id/category` - Atualizar categoria do email

### **Exemplo de Request:**
```json
POST /api/emails
{
  "sender": "cliente@email.com",
  "subject": "Problema elétrico em casa",
  "body": "Preciso de um eletricista para resolver um problema...",
  "category": "Elétrica",
  "processed": false,
  "date": "2024-02-01T10:30:00Z"
}
```

---

## 📊 **7. Statistics API - `/api/stats`**

### **Endpoints:**
- `GET /api/stats/business` - Estatísticas gerais do negócio
- `GET /api/stats/revenue` - Estatísticas de receita
- `GET /api/stats/clients` - Estatísticas de clientes
- `GET /api/stats/services` - Estatísticas de serviços
- `GET /api/stats/emails` - Estatísticas de emails

### **Exemplo de Response:**
```json
GET /api/stats/business
{
  "success": true,
  "data": {
    "totalClients": 150,
    "totalQuotations": 89,
    "totalRevenue": 15750.00,
    "acceptedQuotations": 45,
    "pendingQuotations": 32,
    "totalAppointments": 67,
    "scheduledAppointments": 45,
    "completedAppointments": 22
  }
}
```

---

## 🛠️ **8. System APIs**

### **Health Check:**
- `GET /health` - Status da aplicação e banco de dados
- `GET /api/health` - Status da API

### **Admin Routes:**
- `GET /api/admin/*` - Rotas administrativas

---

## ✨ **Características das APIs**

### **🔒 Validação e Segurança**
- ✅ Validação de entrada com **Zod schemas**
- ✅ Tratamento robusto de erros
- ✅ Logs estruturados
- ✅ Sanitização de dados
- ✅ Verificação de dependências antes de deletar

### **🚀 Funcionalidades Avançadas**
- ✅ **Paginação** (Clients API)
- ✅ **Filtros** (search, status, category, etc.)
- ✅ **Ordenação** (sort por diferentes campos)
- ✅ **Soft Delete** (Categories, Services)
- ✅ **Histórico** (Client history)
- ✅ **Status Toggle** (Services)

### **🏗️ Arquitetura**
- ✅ **Clean Architecture** (Repository, Service, Controller)
- ✅ **TypeScript** com tipagem forte
- ✅ **PostgreSQL** como banco de dados
- ✅ **Logs estruturados** com níveis apropriados

### **📋 Padrões de Resposta**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "filters": { ... }
  },
  "message": "Operação realizada com sucesso"
}
```

---

## 🎯 **Resumo**

**Total: 7 APIs principais + 2 APIs de sistema = 9 APIs completas**

Todas as APIs estão integradas no sistema principal e funcionando com PostgreSQL, sem referências ao modo MOCK. A estrutura está organizada de forma limpa e consistente, pronta para ser integrada com seu ambiente Docker personalizado.