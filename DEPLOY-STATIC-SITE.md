# 🚀 Portal Services - Deploy via Static Site (SIMPLES)

## 🎯 Deploy Super Simples - Apenas Frontend

### **1. 🎨 Frontend (Static Site)**
1. **Acesse**: https://dashboard.render.com
2. **Clique**: **"New +"** → **"Static Site"**
3. **Conecte GitHub**: `marcelohs402015/portal-services`
4. **Configure**:
   - **Name**: `portal-services-frontend`
   - **Branch**: `main`
   - **Root Directory**: `appclient`
   - **Build Command**: 
     ```bash
     npm ci --legacy-peer-deps
     npm run build
     ```
   - **Publish Directory**: `build`
5. **Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://portal-services-backend.onrender.com
   REACT_APP_ENVIRONMENT=production
   GENERATE_SOURCEMAP=false
   CI=false
   ```
6. **Clique**: **"Create Static Site"**

### **2. 🔧 Backend (Web Service)**
1. **Clique**: **"New +"** → **"Web Service"**
2. **Conecte GitHub**: `marcelohs402015/portal-services`
3. **Configure**:
   - **Name**: `portal-services-backend`
   - **Runtime**: **Node**
   - **Plan**: **Free**
   - **Branch**: `main`
   - **Root Directory**: `appserver`
   - **Build Command**: 
     ```bash
     npm ci
     npm run typecheck
     mkdir -p logs
     ```
   - **Start Command**: 
     ```bash
     npx tsx server.ts
     ```
4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db
   DB_SSL=true
   DB_HOST=dpg-d33u8afdiees739si410-a
   DB_PORT=5432
   DB_NAME=portal_services_db
   DB_USER=portal_services_db_user
   DB_PASSWORD=mw3cpereld27I0onwD9oNMXgruyfYvNb
   JWT_SECRET=[clique em Generate]
   SESSION_SECRET=[clique em Generate]
   ```
5. **Clique**: **"Create Web Service"**

## 🧪 Teste Final

### **Backend**
```bash
curl https://portal-services-backend.onrender.com/health
```

### **Frontend**
- Acesse: `https://portal-services-frontend.onrender.com`

## 🎉 Pronto!

**URLs Finais:**
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend**: `https://portal-services-backend.onrender.com`

**Só isso! Super simples!** 🚀
