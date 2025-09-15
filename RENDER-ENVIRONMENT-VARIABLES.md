# 🔧 Portal Services - Variáveis de Ambiente para Render.com

## 📋 Configurações do Banco de Dados

### **🗄️ Database: portal-services-db**
- **Hostname**: `dpg-d33u8afdiees739si410-a`
- **Port**: `5432`
- **Database**: `portal_services_db`
- **Username**: `portal_services_db_user`
- **Password**: `mw3cpereld27I0onwD9oNMXgruyfYvNb`
- **Internal Database URL**: `postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db`

## 🔧 Variáveis de Ambiente para Web Service

### **# OBRIGATÓRIAS**
```bash
DATABASE_URL=postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db
DB_SSL=true
DB_HOST=dpg-d33u8afdiees739si410-a
DB_PORT=5432
DB_NAME=portal_services_db
DB_USER=portal_services_db_user
DB_PASSWORD=mw3cpereld27I0onwD9oNMXgruyfYvNb
```

### **# OPCIONAIS**
```bash
NODE_ENV=production
JWT_SECRET=[clique em Generate no Render]
SESSION_SECRET=[clique em Generate no Render]
```

## 🚀 Como Configurar no Render.com

### **1. Acesse o Web Service**
- Dashboard Render → Web Services → **portal-services-backend**

### **2. Configure as Variáveis**
- Aba **"Environment"**
- Adicione cada variável acima
- Para **JWT_SECRET** e **SESSION_SECRET**: Clique em **"Generate"**

### **3. Salve e Aguarde**
- Clique em **"Save Changes"**
- Aguarde o redeploy automático (2-3 minutos)

## 🧪 Teste de Conexão

### **Health Check**
```bash
curl https://portal-services-backend.onrender.com/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Portal Services API is running",
  "timestamp": "2025-09-15T...",
  "version": "2.0.0",
  "environment": "production",
  "database": "connected"
}
```

### **Teste de API**
```bash
curl https://portal-services-backend.onrender.com/api/categories
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [...],
  "count": X
}
```

## 📊 URLs dos Serviços

Após configuração completa:
- **Backend API**: `https://portal-services-backend.onrender.com`
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`

## 🔍 Troubleshooting

### **Se der erro de conexão:**
1. ✅ Verifique se todas as variáveis estão configuradas
2. ✅ Confirme se o database está "Available"
3. ✅ Aguarde 2-3 minutos após salvar
4. ✅ Verifique os logs do web service

### **Logs importantes:**
- ✅ `✅ Banco de dados conectado`
- ❌ `❌ Erro na conexão com banco`

## 📝 Notas Importantes

- **Database URL**: Use a Internal Database URL (não External)
- **SSL**: Sempre `true` para Render.com
- **Secrets**: Gere novos valores para JWT_SECRET e SESSION_SECRET
- **Redeploy**: Automático após salvar variáveis

## 🎯 Status Final

Após configurar todas as variáveis:
- ✅ **Database**: Conectado
- ✅ **Backend**: Online
- ✅ **Frontend**: Online
- ✅ **APIs**: Funcionando
- ✅ **Health Check**: OK

---

**🚀 Portal Services pronto para produção!**
