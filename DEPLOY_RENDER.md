# 🚀 Deploy Portal Services API no Render

## 📋 Pré-requisitos

1. ✅ Conta no [Render.com](https://render.com)
2. ✅ Repositório GitHub público com o código
3. ✅ API funcionando localmente

## 🎯 Método 1: Deploy via Blueprint (Recomendado)

### 1. Deploy Automático
Clique no botão abaixo para deploy automático:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SEU_USUARIO/portal-services-api)

**Substitua `SEU_USUARIO` pela sua conta GitHub**

### 2. Configuração Automática
O blueprint vai criar:
- ✅ PostgreSQL Database (Free)
- ✅ Web Service (Free) 
- ✅ Variáveis de ambiente automáticas
- ✅ Conexão banco ↔ API automática

## 🎯 Método 2: Deploy Manual

### 1. Criar Database
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `portal-services-db`
   - **Database**: `portalservicesdb` 
   - **User**: `admin`
   - **Region**: Oregon (Free)
   - **Plan**: Free
4. Clique **"Create Database"**
5. **Anote a DATABASE_URL** fornecida

### 2. Criar Web Service  
1. Clique **"New +"** → **"Web Service"**
2. **Connect Repository**: Selecione seu repo GitHub
3. Configure:
   - **Name**: `portal-services-api`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./appserver/Dockerfile.render`
   - **Docker Context**: `./appserver`
   - **Plan**: Free

### 3. Configurar Variáveis de Ambiente
Na seção **Environment**:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Cole a URL do banco criado no passo 1]
API_KEYS_ENABLED=true
LOG_LEVEL=info
CORS_ORIGIN=*
```

### 4. Deploy
1. Clique **"Create Web Service"**
2. Aguarde o build (5-10 minutos)
3. ✅ API estará disponível na URL fornecida

## 🧪 Testando o Deploy

### 1. Health Check
```bash
curl https://sua-api.onrender.com/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Portal Services API is running",
  "timestamp": "2025-09-17T21:30:00.000Z",
  "version": "2.0.0",
  "environment": "production",
  "database": {
    "connected": true,
    "latency": 45
  }
}
```

### 2. Testar API Key
```bash
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Categoria Render","description":"Teste no Render","color":"#00FF00","active":true}' \
     https://sua-api.onrender.com/api/categories
```

## 🔧 Configurações Importantes

### Dockerfile Render
- ✅ Multi-stage build otimizado
- ✅ Usuário não-root (segurança)
- ✅ Health check configurado
- ✅ Build de produção

### Banco de Dados
- ✅ SSL automático em produção
- ✅ Pool de conexões otimizado
- ✅ Reconnect automático
- ✅ DATABASE_URL prioritária

### Variáveis de Ambiente
- ✅ `PORT` - Render define automaticamente
- ✅ `DATABASE_URL` - Conexão automática com PostgreSQL
- ✅ `NODE_ENV=production` - Modo produção
- ✅ `API_KEYS_ENABLED=true` - Sistema de tokens

## 🚨 Troubleshooting

### Build falha
```bash
# Verificar logs no Render Dashboard
# Ou testar localmente:
cd appserver
docker build -f Dockerfile.render -t test-render .
docker run -p 10000:10000 -e PORT=10000 test-render
```

### Database connection failed
1. Verificar `DATABASE_URL` nas env vars
2. Confirmar que o banco está ativo
3. Verificar logs: `SSL connection required`

### API não responde
1. Verificar `PORT=10000` (Render padrão)
2. Health check path: `/health`
3. Verificar logs de startup

## 📊 Monitoramento

### URLs Importantes
- **Dashboard**: https://dashboard.render.com
- **Logs**: Render Dashboard → Seu serviço → Logs
- **Metrics**: Render Dashboard → Seu serviço → Metrics

### Comandos úteis
```bash
# Ver logs em tempo real
curl https://sua-api.onrender.com/health

# Testar todas as rotas
curl https://sua-api.onrender.com/api/categories

# Verificar banco
# (DATABASE_URL nas env vars do Render)
```

## 🎯 URLs Finais

Após o deploy bem-sucedido:

- **API**: `https://sua-api.onrender.com`
- **Health**: `https://sua-api.onrender.com/health`
- **Categorias**: `https://sua-api.onrender.com/api/categories`
- **Banco**: Interno (via DATABASE_URL)

## 🔑 Token para N8N/Frontend

Use o mesmo token em produção:
```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**Configure no N8N:**
- **URL Base**: `https://sua-api.onrender.com`
- **Header**: `Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

---

✅ **Deploy completo no Render com PostgreSQL**  
🔑 **API Keys funcionando**  
🚀 **Pronto para produção**