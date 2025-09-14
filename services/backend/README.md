# Portal Services - Backend API

API Node.js/Express para o Portal Services, separada para deploy independente no Render.

## 📋 Descrição

Este serviço contém a API backend completa:
- Autenticação e autorização
- CRUD de clientes, serviços, orçamentos
- Processamento de emails
- Integração com IA (Gemini)
- Migrações de banco de dados

## 🚀 Deploy no Render

1. Faça upload desta pasta para um repositório Git
2. No Render Dashboard, clique em "New Web Service"
3. Conecte o repositório
4. Configure:
   - **Name**: `portal-services-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `10000`

## 🔧 Variáveis de Ambiente Obrigatórias

### Banco de Dados
```bash
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=portalservicesdb
DB_USER=admin
DB_PASSWORD=your-password
```

### Aplicação
```bash
NODE_ENV=production
PORT=10000
DATA_MODE=real
APP_VERSION=3.1.0
CLIENT_URL=https://portal-services-frontend.onrender.com
CORS_ORIGIN=https://portal-services-frontend.onrender.com
```

### IA (Opcional)
```bash
GOOGLE_AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
```

## 📁 Estrutura

```
services/backend/
├── server.ts              # Servidor principal
├── database/              # Configuração e migrações DB
├── routes/                # Rotas da API
├── services/              # Serviços de negócio
├── shared/                # Utilitários compartilhados
├── package.json           # Dependências
├── render.yaml           # Configuração Render
└── README.md             # Este arquivo
```

## 🔗 Endpoints Principais

- `GET /health` - Health check
- `GET /api/clients` - Lista clientes
- `GET /api/services` - Lista serviços
- `GET /api/quotations` - Lista orçamentos
- `GET /api/emails` - Lista emails
- `GET /api/stats` - Estatísticas

## 🧪 Testes

```bash
npm test                  # Testes unitários
npm run test:integration  # Testes de integração
npm run test:endpoints    # Teste de endpoints
```

## 📦 Scripts

```bash
npm run dev              # Desenvolvimento
npm run build           # Build para produção
npm start               # Inicia servidor
npm run db:setup        # Setup inicial do banco
```
