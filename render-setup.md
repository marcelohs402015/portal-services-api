# 🎯 Portal Services - Setup Rápido no Render.com

## ⚡ Deploy em 5 Minutos

### 1. Acesse o Render Dashboard
```
https://dashboard.render.com
```

### 2. Crie um Novo Blueprint
- Clique em **"New +"**
- Selecione **"Blueprint"**
- Conecte sua conta GitHub
- Selecione o repositório: **`marcelohs402015/portal-services`**

### 3. Configure o Blueprint
- O Render detectará automaticamente o `render.yaml`
- Clique em **"Apply"** para criar todos os serviços
- Aguarde a criação (2-3 minutos)

### 4. Configure Variáveis de Ambiente (Opcional)
No serviço **portal-services-backend**:
```
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret  
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
```

## 🌐 URLs dos Serviços

Após o deploy:
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend API**: `https://portal-services-backend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`

## 🧪 Teste Rápido

```bash
# Health Check
curl https://portal-services-backend.onrender.com/health

# Listar categorias
curl https://portal-services-backend.onrender.com/api/categories

# Estatísticas
curl https://portal-services-backend.onrender.com/api/stats/dashboard
```

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Render
- [ ] Blueprint aplicado com sucesso
- [ ] Database criado (portal-services-db)
- [ ] Backend online (portal-services-backend)
- [ ] Frontend online (portal-services-frontend)
- [ ] Health check funcionando
- [ ] Variáveis de ambiente configuradas (opcional)

## 🎉 Pronto!

Seu Portal Services estará online e disponível para seus clientes!

---

**📞 Suporte**: GitHub Issues ou Render Support
