# 🚀 Guia de Deploy no Render - Portal Services API

## 📋 Pré-requisitos

✅ PostgreSQL já criado no Render com as credenciais da imagem
✅ Código atualizado com configuração correta de SSL
✅ `render.yaml` configurado com a `DATABASE_URL` externa

## 🔧 Configurações Necessárias no Render

### 1. Variáveis de Ambiente (Environment Variables)

No painel do Render, configure estas variáveis:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres_db_h43p_user:ZUHkKGgeWy3Sdn9vd1sbQPrl05QwUdW6@dpg-d360h71r0fns73bhcbjg-a.oregon-postgres.render.com:5432/postgres_db_h43p

# Server Configuration
NODE_ENV=production
PORT=10000

# API Key Configuration
API_KEY_SECRET=portal-services-api-key-secret-2024

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=*
```

### 2. Build & Deploy Settings

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não encontrada"

**Solução:**
1. Verifique se a variável `DATABASE_URL` está configurada no painel do Render
2. Use a **External Database URL** (não a Internal)
3. Certifique-se que a senha está correta: `ZUHkKGgeWy3Sdn9vd1sbQPrl05QwUdW6`

### Erro: "SSL/TLS required"

**Solução:**
✅ Já corrigido! A configuração força SSL: `ssl: { rejectUnauthorized: false }`

### Erro: "password authentication failed"

**Solução:**
1. Verifique se a senha no `DATABASE_URL` está correta
2. Use a URL externa completa com `.oregon-postgres.render.com`

## 🧪 Testando Após Deploy

### 1. Health Check
```bash
curl https://SEU-APP.onrender.com/health
```

### 2. Testando API com API Key
```bash
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Categoria Teste","description":"Teste no Render","color":"#00FF00","active":true}' \
     https://SEU-APP.onrender.com/api/categories
```

## 📊 Logs de Debug

Os logs mostrarão:
- ✅ `🏭 Modo produção: usando variáveis do sistema`
- ✅ `🔗 Usando DATABASE_URL para conexão`
- ✅ `✅ Banco de dados conectado com sucesso`

## 🔑 API Key para N8N/Frontend

Use esta API Key em suas automações:
```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## 📋 Endpoints Disponíveis

- `GET /health` - Health check
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço
- `GET /api/quotations` - Listar orçamentos
- `POST /api/quotations` - Criar orçamento

Todos os endpoints (exceto `/health`) requerem a API Key no header:
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```
