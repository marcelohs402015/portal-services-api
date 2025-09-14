# 📋 **Guia Completo: Deploy no Render.com - Portal Services**

## 🎯 **Opções de Deploy**

### **Opção 1: Blueprint (Recomendada) - Deploy Completo Automático**

**Vantagens:** Deploy completo com banco + backend + frontend de uma vez
**Desvantagem:** Pode falhar se houver qualquer erro

**Passos:**
1. Acesse: https://render.com/deploy
2. Cole a URL: `https://github.com/marcelohs402015/portal-services`
3. Clique "Deploy Blueprint"
4. Aguarde o deploy automático

---

### **Opção 2: Manual (Mais Segura) - Deploy Separado**

**Vantagens:** Controle total, debug individual, menor chance de erro
**Desvantagem:** Mais trabalhoso

---

## 🗂️ **OPÇÃO 2 DETALHADA - DEPLOY MANUAL (RECOMENDADO)**

### **Passo 1: Criar Database PostgreSQL**

1. **Login no Render.com**
2. **New +** → **PostgreSQL**
3. **Configurações:**
   - **Name:** `portal-services-db`
   - **Database:** `portalservicesdb`
   - **User:** `admin`
   - **Region:** Oregon (us-west)
   - **Plan:** Free
4. **Create Database**
5. **⚠️ IMPORTANTE:** Anote as credenciais geradas

---

### **Passo 2: Deploy Backend (API Server)**

1. **New +** → **Web Service**
2. **Connect Repository:** `https://github.com/marcelohs402015/portal-services`
3. **Configurações Básicas:**
   - **Name:** `portal-services-backend`
   - **Region:** Oregon (us-west)
   - **Branch:** `main`
   - **Root Directory:** `appserver`
   - **Runtime:** `Node`

4. **Build & Deploy:**
   - **Build Command:** `npm ci --silent --production=false`
   - **Start Command:** `npx tsx server.ts`

5. **Environment Variables:**
   ```
   NODE_ENV=production
   DATA_MODE=real
   PORT=10000
   DATABASE_URL=[Cole a URL do banco criado no Passo 1]
   DB_SSL=true
   JWT_SECRET=[Gerar automaticamente]
   SESSION_SECRET=[Gerar automaticamente]
   ```

6. **Advanced:**
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** Yes

7. **Create Web Service**

---

### **Passo 3: Deploy Frontend (React App)**

1. **New +** → **Static Site**
2. **Connect Repository:** `https://github.com/marcelohs402015/portal-services`
3. **Configurações Básicas:**
   - **Name:** `portal-services-frontend`
   - **Region:** Oregon (us-west)
   - **Branch:** `main`
   - **Root Directory:** `appclient`

4. **Build Settings:**
   - **Build Command:**
     ```bash
     npm ci --legacy-peer-deps --silent && npm run build
     ```
   - **Publish Directory:** `build`

5. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://portal-services-backend.onrender.com
   GENERATE_SOURCEMAP=false
   REACT_APP_BUILD_MODE=production
   ```

6. **Create Static Site**

---

## 🔧 **Configurações de Environment Variables Detalhadas**

### **Backend Environment Variables:**

| Variável | Valor | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `DATA_MODE` | `real` | Usar dados reais do banco |
| `PORT` | `10000` | Porta do Render (automática) |
| `DATABASE_URL` | `[Do banco PostgreSQL]` | String de conexão completa |
| `DB_SSL` | `true` | SSL obrigatório no Render |
| `JWT_SECRET` | `[Auto-gerado]` | Chave secreta JWT |
| `SESSION_SECRET` | `[Auto-gerado]` | Chave secreta sessão |

### **Frontend Environment Variables:**

| Variável | Valor | Descrição |
|----------|--------|-----------|
| `REACT_APP_API_URL` | `https://portal-services-backend.onrender.com` | URL da API backend |
| `GENERATE_SOURCEMAP` | `false` | Não gerar sourcemaps |
| `REACT_APP_BUILD_MODE` | `production` | Modo de build |

---

## 🚀 **Sequência Recomendada de Deploy**

### **1. Database Primeiro (5 min)**
- Crie o PostgreSQL
- Aguarde ficar "Available"
- Copie a `DATABASE_URL`

### **2. Backend Segundo (10 min)**
- Deploy do Web Service
- Configure environment variables
- Teste endpoint: `https://portal-services-backend.onrender.com/health`

### **3. Frontend Por Último (5 min)**
- Deploy do Static Site
- Configure REACT_APP_API_URL
- Teste: `https://portal-services-frontend.onrender.com`

---

## 🔍 **Monitoramento e Debug**

### **Verificar Status:**
1. **Database:** Deve estar "Available"
2. **Backend:** Logs devem mostrar "Server running on port 10000"
3. **Frontend:** Build deve completar sem erros

### **Endpoints para Testar:**
- **Backend Health:** `https://portal-services-backend.onrender.com/health`
- **Backend API:** `https://portal-services-backend.onrender.com/api/categories`
- **Frontend:** `https://portal-services-frontend.onrender.com`

### **Logs Importantes:**
- **Backend:** Procurar por "Database connected successfully"
- **Frontend:** Procurar por "Build completed successfully"

---

## ⚠️ **Troubleshooting Comum**

### **Se Backend Falhar:**
1. Verificar `DATABASE_URL` está correto
2. Verificar `npx tsx server.ts` está sendo usado
3. Verificar logs de conexão com banco

### **Se Frontend Falhar:**
1. Verificar `REACT_APP_API_URL` está correto
2. Verificar comando de build
3. Verificar dependências React

### **Se Database Falhar:**
1. Aguardar até estar "Available"
2. Verificar região (us-west)
3. Verificar plano free está disponível

---

## ✅ **Checklist Final**

- [ ] Database PostgreSQL criado e Available
- [ ] Backend rodando em `/health`
- [ ] Frontend carregando interface
- [ ] API calls funcionando entre frontend/backend
- [ ] Dados sendo salvos no banco

---

**🎯 Recomendação:** Use a **Opção 2 (Manual)** para ter controle total e debugar cada etapa individualmente. É mais trabalhoso mas tem maior chance de sucesso.