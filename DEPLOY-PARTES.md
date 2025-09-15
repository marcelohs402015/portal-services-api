# 🚀 Portal Services - Deploy por Partes no Render.com

## 🎯 Estratégia: Deploy Manual (Mais Simples)

Como o Blueprint está com problemas de compatibilidade, vamos fazer deploy manual por partes:

## 📋 Ordem de Deploy

### 1. 🗄️ **Database (PostgreSQL)**
1. Acesse: https://dashboard.render.com
2. Clique: **"New +"** → **"Postgres"**
3. Configure:
   - **Name**: `portal-services-db`
   - **Database**: `portalservicesdb`
   - **User**: `admin`
   - **Plan**: **Free**
   - **Region**: Oregon
4. Clique: **"Create Database"**
5. **Aguarde** a criação (2-3 minutos)

### 2. 🔧 **Backend (API)**
1. Clique: **"New +"** → **"Web Service"**
2. Conecte seu GitHub: `marcelohs402015/portal-services`
3. Configure:
   - **Name**: `portal-services-backend`
   - **Runtime**: **Node**
   - **Plan**: **Free**
   - **Branch**: `main`
   - **Root Directory**: `appserver`
   - **Build Command**: 
     ```bash
     npm ci --silent
     npm run typecheck
     mkdir -p logs
     ```
   - **Start Command**: 
     ```bash
     npx tsx server.ts
     ```
4. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=[copie da database criada]
   DB_SSL=true
   DB_HOST=[copie da database]
   DB_PORT=[copie da database]
   DB_NAME=portalservicesdb
   DB_USER=admin
   DB_PASSWORD=[copie da database]
   JWT_SECRET=[clique em Generate]
   SESSION_SECRET=[clique em Generate]
   ```
5. Clique: **"Create Web Service"**

### 3. 🎨 **Frontend (React)**
1. Clique: **"New +"** → **"Static Site"**
2. Conecte seu GitHub: `marcelohs402015/portal-services`
3. Configure:
   - **Name**: `portal-services-frontend`
   - **Branch**: `main`
   - **Root Directory**: `appclient`
   - **Build Command**: 
     ```bash
     npm ci --silent
     npm ci --legacy-peer-deps --silent
     npm run typecheck
     npm run build
     ```
   - **Publish Directory**: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://portal-services-backend.onrender.com
   REACT_APP_ENVIRONMENT=production
   GENERATE_SOURCEMAP=false
   CI=false
   ```
5. Clique: **"Create Static Site"**

## 🔗 URLs Finais

Após todos os deploys:
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend**: `https://portal-services-backend.onrender.com`
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

## ⚠️ Dicas Importantes

### Database
- ✅ Use plan **Free** (não Starter)
- ✅ Aguarde criação completa antes do backend
- ✅ Copie as variáveis de ambiente corretamente

### Backend
- ✅ Root Directory: `appserver`
- ✅ Use `npx tsx server.ts` (não `npm start`)
- ✅ Configure todas as variáveis de ambiente

### Frontend
- ✅ Root Directory: `appclient`
- ✅ Publish Directory: `build`
- ✅ REACT_APP_API_URL deve apontar para o backend

## 🎉 Vantagens do Deploy Manual

- ✅ **Mais controle** sobre cada serviço
- ✅ **Planos atuais** do Render
- ✅ **Debugging** mais fácil
- ✅ **Configuração** individual
- ✅ **Menos erros** de compatibilidade

## 📞 Suporte

Se algo der errado:
1. **Verifique os logs** de cada serviço
2. **Confirme as variáveis** de ambiente
3. **Aguarde** alguns minutos entre deploys
4. **Teste** cada serviço individualmente

---

**🚀 Deploy manual é mais confiável que Blueprint!**
