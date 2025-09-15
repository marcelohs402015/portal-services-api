# Portal Services API - Backend Completo

## 🚀 Inicialização Rápida

```bash
# Comando único para subir o backend completo
npm start
# ou
./start-project.sh
```

## 📊 Informações do Sistema

- **API Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Banco de Dados**: localhost:5432
- **Usuário BD**: admin
- **Senha BD**: admin
- **Nome BD**: portalservicesdb

## 🔗 Endpoints da API

### Health Check
```http
GET /health
GET /api/health
```

### Categorias
```http
GET    /api/categories          # Listar todas as categorias
GET    /api/categories/:id      # Obter categoria por ID
POST   /api/categories          # Criar nova categoria
PUT    /api/categories/:id      # Atualizar categoria
DELETE /api/categories/:id      # Deletar categoria (soft delete)
```

**Exemplo de Categoria:**
```json
{
  "id": 1,
  "name": "Eletricista",
  "description": "Serviços de eletricidade residencial e comercial",
  "keywords": ["eletricista", "elétrica", "luz", "energia"],
  "patterns": ["preciso de um eletricista", "problema na luz"],
  "domains": [],
  "color": "#FF6B6B",
  "active": true,
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Clientes
```http
GET    /api/clients             # Listar todos os clientes
GET    /api/clients/:id         # Obter cliente por ID
POST   /api/clients             # Criar novo cliente
PUT    /api/clients/:id         # Atualizar cliente
DELETE /api/clients/:id         # Deletar cliente
```

**Exemplo de Cliente:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "phone": "(11) 99999-1111",
  "address": "Rua das Flores, 123 - São Paulo/SP",
  "notes": "Cliente preferencial",
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Serviços
```http
GET    /api/services            # Listar todos os serviços
GET    /api/services/:id        # Obter serviço por ID
POST   /api/services            # Criar novo serviço
PUT    /api/services/:id        # Atualizar serviço
DELETE /api/services/:id        # Deletar serviço
```

**Exemplo de Serviço:**
```json
{
  "id": "eletricista-instalacao",
  "name": "Instalação Elétrica",
  "description": "Instalação completa de sistema elétrico residencial",
  "category": "Eletricista",
  "price": 80.00,
  "unit": "hour",
  "estimated_time": "4-8 horas",
  "materials": ["fios", "disjuntores", "tomadas", "interruptores"],
  "active": true,
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Orçamentos
```http
GET    /api/quotations          # Listar todos os orçamentos
GET    /api/quotations/:id      # Obter orçamento por ID
POST   /api/quotations          # Criar novo orçamento
PUT    /api/quotations/:id      # Atualizar orçamento
DELETE /api/quotations/:id      # Deletar orçamento
```

**Exemplo de Orçamento:**
```json
{
  "id": "quote-001",
  "client_email": "joao.silva@email.com",
  "client_name": "João Silva",
  "client_phone": "(11) 99999-1111",
  "client_address": "Rua das Flores, 123 - São Paulo/SP",
  "services": [
    {
      "id": "eletricista-instalacao",
      "name": "Instalação Elétrica",
      "price": 80.00,
      "quantity": 6
    }
  ],
  "subtotal": 480.00,
  "discount": 0.00,
  "total": 480.00,
  "status": "pending",
  "valid_until": "2025-02-15",
  "notes": "Instalação elétrica completa da casa",
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Agendamentos
```http
GET    /api/appointments        # Listar todos os agendamentos
GET    /api/appointments/:id    # Obter agendamento por ID
POST   /api/appointments        # Criar novo agendamento
PUT    /api/appointments/:id    # Atualizar agendamento
DELETE /api/appointments/:id    # Deletar agendamento
```

**Exemplo de Agendamento:**
```json
{
  "id": "appt-001",
  "client_id": "1",
  "client_name": "João Silva",
  "service_ids": ["eletricista-instalacao"],
  "service_names": ["Instalação Elétrica"],
  "date": "2025-01-22",
  "time": "09:00:00",
  "duration": 480,
  "address": "Rua das Flores, 123 - São Paulo/SP",
  "notes": "Instalação elétrica completa",
  "status": "scheduled",
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Emails
```http
GET    /api/emails              # Listar todos os emails
GET    /api/emails/:id          # Obter email por ID
POST   /api/emails              # Criar novo email
PUT    /api/emails/:id          # Atualizar email
DELETE /api/emails/:id          # Deletar email
```

**Exemplo de Email:**
```json
{
  "id": 1,
  "gmail_id": "gmail-001",
  "subject": "Preciso de um eletricista",
  "sender": "joao.silva@email.com",
  "date": "2025-01-13T12:00:00Z",
  "body": "Olá, preciso de um eletricista para instalação elétrica na minha casa nova.",
  "snippet": "Olá, preciso de um eletricista...",
  "category": "Eletricista",
  "confidence": 0.95,
  "processed": true,
  "responded": true,
  "response_template": "orcamento-padrao",
  "created_at": "2025-01-13T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Estatísticas
```http
GET    /api/stats/dashboard     # Estatísticas do dashboard
GET    /api/stats/business      # Estatísticas do negócio
```

**Exemplo de Estatísticas:**
```json
{
  "success": true,
  "data": {
    "totalClients": 4,
    "totalQuotations": 3,
    "totalRevenue": 1820.00,
    "totalAppointments": 3,
    "totalEmails": 3
  }
}
```

## 🔧 Filtros e Parâmetros

### Categorias
- `?name=termo` - Filtrar por nome
- `?active=true/false` - Filtrar por status ativo

### Clientes
- `?name=termo` - Filtrar por nome
- `?email=termo` - Filtrar por email

### Serviços
- `?category=nome` - Filtrar por categoria
- `?active=true/false` - Filtrar por status ativo

### Orçamentos
- `?status=status` - Filtrar por status (draft, pending, accepted, rejected)
- `?client_email=email` - Filtrar por email do cliente

### Agendamentos
- `?status=status` - Filtrar por status (scheduled, confirmed, completed, cancelled)
- `?client_id=id` - Filtrar por ID do cliente
- `?date=YYYY-MM-DD` - Filtrar por data

### Emails
- `?category=categoria` - Filtrar por categoria
- `?sender=termo` - Filtrar por remetente
- `?processed=true/false` - Filtrar por processado
- `?responded=true/false` - Filtrar por respondido
- `?subject=termo` - Filtrar por assunto
- `?page=1&limit=50` - Paginação

## 📝 Códigos de Resposta

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Não encontrado
- `409` - Conflito (duplicado)
- `500` - Erro interno do servidor

## 🎯 Exemplos de Uso da API

### Buscar todas as categorias
```bash
curl http://localhost:3001/api/categories
```

### Criar novo cliente
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 99999-2222",
    "address": "Av. Paulista, 456"
  }'
```

### Buscar estatísticas do dashboard
```bash
curl http://localhost:3001/api/stats/dashboard
```

## 🚀 Comandos Úteis

```bash
# Iniciar projeto completo
npm start

# Ver logs
npm run docker:logs

# Parar projeto
npm run docker:down

# Status dos containers
npm run docker:status

# Reiniciar
npm run docker:up
```

## 🧪 Testes Rápidos

```bash
# Health check
curl http://localhost:3001/health

# Listar categorias
curl http://localhost:3001/api/categories

# Estatísticas
curl http://localhost:3001/api/stats/dashboard

# Listar clientes
curl http://localhost:3001/api/clients
```

---

**🎉 Portal Services API - Backend completo e funcional!**
