# 🚀 Portal Services API - Deploy Guide

## 🎯 Deploy Rápido no Render

### [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**1. Clique no botão acima**  
**2. Conecte seu repositório GitHub**  
**3. Aguarde 5-10 minutos**  
**4. ✅ API funcionando!**

## 📋 O que será criado automaticamente:

- ✅ **PostgreSQL Database** (Free Tier)
- ✅ **Web Service** (Node.js API)
- ✅ **Variáveis de ambiente** configuradas
- ✅ **SSL/HTTPS** automático
- ✅ **Health checks** configurados

## 🔧 Configurações Automáticas:

### Database (PostgreSQL)
- **Name**: `portal-services-db`
- **User**: `admin`
- **Database**: `portalservicesdb`
- **Plan**: Free (1GB storage)

### Web Service (API)
- **Runtime**: Docker
- **Port**: 10000 (Render padrão)
- **Health Check**: `/health`
- **Auto-deploy**: On push to main

### Environment Variables
```bash
NODE_ENV=production
PORT=10000                    # Render automático
DATABASE_URL=postgresql://... # Conexão automática
API_KEYS_ENABLED=true
LOG_LEVEL=info
CORS_ORIGIN=*
```

## 🧪 Testando após Deploy

### 1. Health Check
```bash
curl https://sua-api.onrender.com/health
```

### 2. Listar Categorias (público)
```bash
curl https://sua-api.onrender.com/api/categories
```

### 3. Criar Categoria (com token)
```bash
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Categoria Produção","description":"Teste em produção","color":"#00FF00","active":true}' \
     https://sua-api.onrender.com/api/categories
```

## 🔑 Token para N8N

Use o mesmo token em produção:
```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**Configuração N8N:**
- **Base URL**: `https://sua-api.onrender.com`
- **Authentication**: Bearer Token
- **Token**: Cole o token acima

## 📊 Monitoramento

### Dashboard Render
- **Logs**: Ver erros e debug
- **Metrics**: CPU, Memory, Requests
- **Settings**: Env vars, scaling

### URLs Importantes
- **API Base**: `https://sua-api.onrender.com`
- **Health**: `https://sua-api.onrender.com/health`
- **Swagger** (futuro): `https://sua-api.onrender.com/docs`

## 🚨 Troubleshooting

### Build falha?
1. Verificar `Dockerfile.render`
2. Testar localmente: `cd appserver && ./test-render-build.sh`
3. Ver logs no Render Dashboard

### Database connection error?
1. Verificar `DATABASE_URL` nas env vars
2. Confirmar PostgreSQL está ativo
3. SSL deve estar habilitado em produção

### API não responde?
1. Verificar porta `PORT=10000`
2. Health check path `/health`
3. Ver logs de startup

## ⚡ Performance

### Free Tier Limits
- **RAM**: 512MB
- **CPU**: 0.1 vCPU
- **Storage**: 1GB (PostgreSQL)
- **Bandwidth**: 100GB/mês
- **Sleep**: Após 15min inativo

### Otimizações Aplicadas
- ✅ Multi-stage Docker build
- ✅ Dependências de produção apenas
- ✅ Pool de conexões otimizado
- ✅ Health checks configurados
- ✅ Logs estruturados

## 🔄 CI/CD Automático

### Auto-deploy configurado:
- ✅ Push para `main` → Deploy automático
- ✅ Build logs no dashboard
- ✅ Rollback automático se falhar
- ✅ Zero downtime deploys

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ **Testar todas as rotas**
2. ✅ **Configurar N8N** com a nova URL
3. ✅ **Atualizar frontend** (se houver)
4. ✅ **Configurar monitoramento**
5. ✅ **Documentar URLs** para a equipe

**🚀 API em produção no Render com PostgreSQL!**
