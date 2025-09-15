# 🔧 Portal Services - Troubleshooting Database Connection

## ❌ Erro: "no web service" / "Erro na conexão com banco"

### 🎯 **Problemas Mais Comuns:**

## 1. 🗄️ **Database não foi criado ainda**
- ✅ **Verifique**: Dashboard do Render → Databases
- ✅ **Deve aparecer**: `portal-services-db` com status "Available"
- ⚠️ **Se não existe**: Crie primeiro o database

## 2. 🔧 **Variáveis de Ambiente Incorretas**

### **No Web Service (Backend):**
Verifique se estas variáveis estão configuradas:

```bash
# OBRIGATÓRIAS
DATABASE_URL=[copie da database - Internal Database URL]
DB_SSL=true
DB_HOST=[copie da database - Host]
DB_PORT=[copie da database - Port]
DB_NAME=portalservicesdb
DB_USER=admin
DB_PASSWORD=[copie da database - Password]

# OPCIONAIS
NODE_ENV=production
JWT_SECRET=[clique em Generate]
SESSION_SECRET=[clique em Generate]
```

### **Como copiar as variáveis:**
1. **Dashboard Render** → **Databases** → **portal-services-db**
2. **Aba "Info"** → Copie os valores:
   - **Internal Database URL** → `DATABASE_URL`
   - **Host** → `DB_HOST`
   - **Port** → `DB_PORT`
   - **Password** → `DB_PASSWORD`

## 3. ⏰ **Database ainda não está pronto**
- ⚠️ **Aguarde**: 2-3 minutos após criação
- ✅ **Status**: Deve estar "Available" (não "Creating")
- 🔄 **Reinicie**: O web service após database ficar pronto

## 4. 🔄 **Ordem de Deploy Incorreta**
- ✅ **Correto**: Database → Backend → Frontend
- ❌ **Errado**: Backend → Database

## 🛠️ **Soluções Passo a Passo:**

### **Solução 1: Verificar Database**
1. **Dashboard Render** → **Databases**
2. **Verifique**: `portal-services-db` existe e está "Available"
3. **Se não existe**: Crie primeiro

### **Solução 2: Corrigir Variáveis de Ambiente**
1. **Dashboard Render** → **Web Services** → **portal-services-backend**
2. **Aba "Environment"**
3. **Adicione/Corrija** as variáveis listadas acima
4. **Clique**: "Save Changes"
5. **Aguarde**: Redeploy automático

### **Solução 3: Reiniciar Serviços**
1. **Dashboard Render** → **Web Services** → **portal-services-backend**
2. **Aba "Settings"**
3. **Clique**: "Manual Deploy" → "Deploy latest commit"
4. **Aguarde**: 2-3 minutos

### **Solução 4: Verificar Logs**
1. **Dashboard Render** → **Web Services** → **portal-services-backend**
2. **Aba "Logs"**
3. **Procure por**:
   - ✅ `✅ Banco de dados conectado`
   - ❌ `❌ Erro na conexão com banco`
   - ❌ `ECONNREFUSED`
   - ❌ `ENOTFOUND`

## 🧪 **Teste de Conexão:**

### **1. Health Check**
```bash
curl https://portal-services-backend.onrender.com/health
```
**Deve retornar:**
```json
{
  "success": true,
  "message": "Portal Services API is running",
  "database": "connected"
}
```

### **2. Teste de API**
```bash
curl https://portal-services-backend.onrender.com/api/categories
```
**Deve retornar:**
```json
{
  "success": true,
  "data": [...],
  "count": X
}
```

## 🔍 **Logs Importantes:**

### **✅ Sucesso:**
```
✅ Banco de dados conectado
🚀 Portal Services Server rodando em http://localhost:3001
```

### **❌ Erro:**
```
❌ Erro na conexão com banco: connect ECONNREFUSED
❌ Erro na conexão com banco: getaddrinfo ENOTFOUND
```

## 🚨 **Se Nada Funcionar:**

### **Recriar Tudo:**
1. **Delete** o web service
2. **Aguarde** 1 minuto
3. **Recrie** o web service
4. **Configure** as variáveis corretamente
5. **Aguarde** o deploy

### **Verificar Database:**
1. **Delete** o database (se necessário)
2. **Recrie** o database
3. **Aguarde** ficar "Available"
4. **Configure** as variáveis no backend

## 📞 **Suporte:**

### **Informações para Debug:**
- **Database Status**: Available/Creating/Error
- **Web Service Status**: Live/Building/Error
- **Logs**: Últimas 50 linhas
- **Variáveis**: Lista das configuradas

### **Comandos Úteis:**
```bash
# Verificar se backend está online
curl -I https://portal-services-backend.onrender.com/health

# Verificar se database está acessível
curl -I https://portal-services-backend.onrender.com/api/categories
```

---

**🎯 90% dos problemas são variáveis de ambiente incorretas!**
