# 🚀 Portal Services API - Guia de Integração N8N

## 📋 Visão Geral

Esta API foi desenvolvida especificamente para integração com N8N, utilizando **API Keys** simples para autenticação. Todas as rotas estão prontas para automações.

## 🔑 Autenticação

### Formato da API Key
```
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Como obter sua API Key
1. Acesse: `GET /api/keys/permissions` (rota pública)
2. Use a API Key padrão: `psk_` + 64 caracteres hexadecimais
3. Configure no N8N como "Bearer Token"

### Tipos de API Keys Disponíveis
- **N8N Read Only**: Apenas leitura (recomendado para consultas)
- **N8N Full Access**: Leitura e escrita (para automações completas)
- **Webhook**: Para webhooks externos
- **Integration**: Para integrações de terceiros
- **Admin**: Acesso administrativo completo

## 🌐 Endpoints Disponíveis

### 🏥 Health Check
```http
GET /health
GET /api/health
```
**Descrição**: Verifica se a API está funcionando
**Autenticação**: Não requerida
**Resposta**:
```json
{
  "success": true,
  "message": "Portal Services API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "environment": "production",
  "database": {
    "connected": true,
    "latency": "2ms"
  }
}
```

---

## 📂 CATEGORIAS

### Listar Categorias
```http
GET /api/categories
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `active`: boolean (filtrar por status)
- `search`: string (buscar por nome)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Manutenção",
      "description": "Serviços de manutenção geral",
      "color": "#3B82F6",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Obter Categoria por ID
```http
GET /api/categories/:id
```
**Autenticação**: Opcional

### Criar Categoria
```http
POST /api/categories
```
**Autenticação**: Obrigatória + Permissão `create:categories`
**Body**:
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "color": "#3B82F6",
  "active": true
}
```

### Atualizar Categoria
```http
PUT /api/categories/:id
```
**Autenticação**: Obrigatória + Permissão `update:categories`

### Deletar Categoria
```http
DELETE /api/categories/:id
```
**Autenticação**: Obrigatória + Permissão `delete:categories`

---

## 👥 CLIENTES

### Listar Clientes
```http
GET /api/clients
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `search`: string (buscar por nome/email)
- `active`: boolean (filtrar por status)
- `page`: number (paginação)
- `limit`: number (limite por página)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "+5511999999999",
      "address": "Rua das Flores, 123",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Obter Cliente por ID
```http
GET /api/clients/:id
```
**Autenticação**: Opcional

### Criar Cliente
```http
POST /api/clients
```
**Autenticação**: Obrigatória + Permissão `create:clients`
**Body**:
```json
{
  "name": "Novo Cliente",
  "email": "cliente@email.com",
  "phone": "+5511999999999",
  "address": "Endereço do cliente"
}
```

### Atualizar Cliente
```http
PUT /api/clients/:id
```
**Autenticação**: Obrigatória + Permissão `update:clients`

### Deletar Cliente
```http
DELETE /api/clients/:id
```
**Autenticação**: Obrigatória + Permissão `delete:clients`

---

## 🛠️ SERVIÇOS

### Listar Serviços
```http
GET /api/services
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `category_id`: number (filtrar por categoria)
- `active`: boolean (filtrar por status)
- `search`: string (buscar por nome)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Reparo de Torneira",
      "description": "Reparo completo de torneiras",
      "price": 150.00,
      "category_id": 1,
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Obter Serviço por ID
```http
GET /api/services/:id
```
**Autenticação**: Opcional

### Criar Serviço
```http
POST /api/services
```
**Autenticação**: Obrigatória + Permissão `create:services`
**Body**:
```json
{
  "name": "Novo Serviço",
  "description": "Descrição do serviço",
  "price": 200.00,
  "category_id": 1,
  "active": true
}
```

### Atualizar Serviço
```http
PUT /api/services/:id
```
**Autenticação**: Obrigatória + Permissão `update:services`

### Deletar Serviço
```http
DELETE /api/services/:id
```
**Autenticação**: Obrigatória + Permissão `delete:services`

---

## 💰 ORÇAMENTOS

### Listar Orçamentos
```http
GET /api/quotations
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `client_id`: number (filtrar por cliente)
- `status`: string (pending, approved, rejected)
- `date_from`: string (data início)
- `date_to`: string (data fim)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "total": 500.00,
      "status": "pending",
      "valid_until": "2024-01-15T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "service_id": 1,
          "quantity": 2,
          "price": 150.00,
          "total": 300.00
        }
      ]
    }
  ],
  "count": 1
}
```

### Obter Orçamento por ID
```http
GET /api/quotations/:id
```
**Autenticação**: Opcional

### Criar Orçamento
```http
POST /api/quotations
```
**Autenticação**: Obrigatória + Permissão `create:quotations`
**Body**:
```json
{
  "client_id": 1,
  "valid_until": "2024-01-15T00:00:00.000Z",
  "items": [
    {
      "service_id": 1,
      "quantity": 2,
      "price": 150.00
    }
  ]
}
```

### Atualizar Orçamento
```http
PUT /api/quotations/:id
```
**Autenticação**: Obrigatória + Permissão `update:quotations`

### Deletar Orçamento
```http
DELETE /api/quotations/:id
```
**Autenticação**: Obrigatória + Permissão `delete:quotations`

---

## 📅 AGENDAMENTOS

### Listar Agendamentos
```http
GET /api/appointments
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `client_id`: number (filtrar por cliente)
- `date_from`: string (data início)
- `date_to`: string (data fim)
- `status`: string (scheduled, completed, cancelled)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "service_id": 1,
      "scheduled_date": "2024-01-15T10:00:00.000Z",
      "status": "scheduled",
      "notes": "Observações do agendamento",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Obter Agendamento por ID
```http
GET /api/appointments/:id
```
**Autenticação**: Opcional

### Criar Agendamento
```http
POST /api/appointments
```
**Autenticação**: Obrigatória + Permissão `create:appointments`
**Body**:
```json
{
  "client_id": 1,
  "service_id": 1,
  "scheduled_date": "2024-01-15T10:00:00.000Z",
  "notes": "Observações do agendamento"
}
```

### Atualizar Agendamento
```http
PUT /api/appointments/:id
```
**Autenticação**: Obrigatória + Permissão `update:appointments`

### Deletar Agendamento
```http
DELETE /api/appointments/:id
```
**Autenticação**: Obrigatória + Permissão `delete:appointments`

---

## 📧 EMAILS

### Listar Emails
```http
GET /api/emails
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `client_id`: number (filtrar por cliente)
- `type`: string (sent, received)
- `status`: string (sent, failed, pending)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "subject": "Orçamento Aprovado",
      "body": "Seu orçamento foi aprovado...",
      "type": "sent",
      "status": "sent",
      "sent_at": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Obter Email por ID
```http
GET /api/emails/:id
```
**Autenticação**: Opcional

### Criar Email
```http
POST /api/emails
```
**Autenticação**: Obrigatória + Permissão `create:emails`
**Body**:
```json
{
  "client_id": 1,
  "subject": "Assunto do Email",
  "body": "Conteúdo do email",
  "type": "sent"
}
```

### Atualizar Email
```http
PUT /api/emails/:id
```
**Autenticação**: Obrigatória + Permissão `update:emails`

### Deletar Email
```http
DELETE /api/emails/:id
```
**Autenticação**: Obrigatória + Permissão `delete:emails`

---

## 📊 ESTATÍSTICAS

### Estatísticas do Dashboard
```http
GET /api/stats/dashboard
```
**Autenticação**: Opcional
**Resposta**:
```json
{
  "success": true,
  "data": {
    "total_clients": 150,
    "total_services": 25,
    "total_quotations": 300,
    "total_revenue": 45000.00,
    "pending_quotations": 15,
    "scheduled_appointments": 8,
    "recent_activity": [
      {
        "type": "quotation_created",
        "description": "Novo orçamento criado",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Estatísticas de Negócio
```http
GET /api/stats/business
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `period`: string (month, quarter, year)
- `date_from`: string (data início)
- `date_to`: string (data fim)

### Receita Mensal
```http
GET /api/stats/revenue/monthly
```
**Autenticação**: Opcional
**Parâmetros Query**:
- `year`: number (ano)
- `months`: number (quantidade de meses)

---

## 🔑 GERENCIAMENTO DE API KEYS

### Listar Permissões Disponíveis
```http
GET /api/keys/permissions
```
**Autenticação**: Não requerida
**Resposta**:
```json
{
  "success": true,
  "data": {
    "permissions": [
      "read:categories",
      "create:categories",
      "update:categories",
      "delete:categories",
      "read:clients",
      "create:clients",
      "update:clients",
      "delete:clients"
    ],
    "key_types": [
      "n8n_readonly",
      "n8n_full_access",
      "webhook",
      "integration",
      "admin"
    ]
  }
}
```

### Informações da API Key Atual
```http
GET /api/keys/me
```
**Autenticação**: Obrigatória

### Listar Todas as API Keys (Admin)
```http
GET /api/keys
```
**Autenticação**: Obrigatória + Permissão `admin:all`

### Criar Nova API Key (Admin)
```http
POST /api/keys
```
**Autenticação**: Obrigatória + Permissão `admin:all`
**Body**:
```json
{
  "name": "Nova API Key",
  "type": "n8n_readonly",
  "description": "Para automações N8N"
}
```

### Estatísticas das API Keys (Admin)
```http
GET /api/keys/stats
```
**Autenticação**: Obrigatória + Permissão `admin:all`

### Ativar/Desativar API Key (Admin)
```http
PATCH /api/keys/:key/activate
PATCH /api/keys/:key/deactivate
```
**Autenticação**: Obrigatória + Permissão `admin:all`

---

## 🚀 Configuração no N8N

### 1. Configurar Autenticação
1. No nó HTTP Request do N8N
2. Em "Authentication" selecione "Bearer Token"
3. Cole sua API Key: `psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Headers Recomendados
```json
{
  "Content-Type": "application/json",
  "User-Agent": "N8N-Automation/1.0"
}
```

### 3. Exemplo de Workflow N8N

#### Workflow: Criar Cliente e Orçamento
```json
{
  "nodes": [
    {
      "name": "Create Client",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://sua-api.com/api/clients",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpBearerAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "name",
              "value": "={{ $json.name }}"
            },
            {
              "name": "email", 
              "value": "={{ $json.email }}"
            }
          ]
        }
      }
    },
    {
      "name": "Create Quotation",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://sua-api.com/api/quotations",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpBearerAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "client_id",
              "value": "={{ $json.id }}"
            },
            {
              "name": "items",
              "value": "={{ $json.services }}"
            }
          ]
        }
      }
    }
  ]
}
```

### 4. Rate Limiting
- **Global**: 100 requests/minuto
- **Por endpoint**: 20 requests/minuto
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp do reset

### 5. Tratamento de Erros
```json
{
  "success": false,
  "error": "Descrição do erro",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Códigos de Erro Comuns**:
- `NO_API_KEY`: API Key não fornecida
- `INVALID_API_KEY`: API Key inválida
- `INSUFFICIENT_PERMISSIONS`: Permissão insuficiente
- `VALIDATION_ERROR`: Erro de validação
- `NOT_FOUND`: Recurso não encontrado
- `INTERNAL_ERROR`: Erro interno do servidor

---

## 📝 Exemplos Práticos para N8N

### 1. Webhook para Novo Cliente
```http
POST /api/clients
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "name": "{{ $json.name }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.phone }}"
}
```

### 2. Consultar Estatísticas Diárias
```http
GET /api/stats/dashboard
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Criar Orçamento Automático
```http
POST /api/quotations
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "client_id": "{{ $json.client_id }}",
  "valid_until": "{{ $now.plus({days: 30}).toISO() }}",
  "items": [
    {
      "service_id": "{{ $json.service_id }}",
      "quantity": 1,
      "price": "{{ $json.price }}"
    }
  ]
}
```

### 4. Enviar Email de Confirmação
```http
POST /api/emails
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "client_id": "{{ $json.client_id }}",
  "subject": "Orçamento Aprovado - {{ $json.quotation_id }}",
  "body": "Seu orçamento foi aprovado! Valor: R$ {{ $json.total }}",
  "type": "sent"
}
```

---

## 🔧 Troubleshooting

### Problemas Comuns

1. **401 Unauthorized**
   - Verifique se a API Key está correta
   - Confirme o formato: `Bearer psk_xxxxxxxxx`

2. **403 Forbidden**
   - Verifique se a API Key tem as permissões necessárias
   - Consulte `/api/keys/permissions` para ver permissões disponíveis

3. **429 Too Many Requests**
   - Aguarde o reset do rate limit
   - Considere usar cache no N8N

4. **500 Internal Server Error**
   - Verifique os logs da API
   - Confirme se o banco de dados está conectado

### Logs e Monitoramento
- Todos os requests são logados com timestamp, IP e user-agent
- Use `/health` para verificar status da API
- Monitore rate limits via headers de resposta

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs da API
3. Teste com `/health` e `/api/keys/permissions`
4. Verifique permissões da API Key

**Versão da API**: 2.0.0  
**Última atualização**: 2024-01-01  
**Compatibilidade N8N**: v1.0+
