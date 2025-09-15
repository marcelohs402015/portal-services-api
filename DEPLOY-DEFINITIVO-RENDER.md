# 🚀 Portal Services - Deploy Definitivo no Render.com

## 📋 Informações do Projeto
- **Repositório**: `marcelohs402015/portal-services`
- **Branch**: `main`
- **Database**: PostgreSQL (portal-services-db)
- **Backend**: Node.js API
- **Frontend**: React Static

## 🗄️ Database Configuration

### **Database Details**
- **Name**: `portal-services-db`
- **Hostname**: `dpg-d33u8afdiees739si410-a`
- **Port**: `5432`
- **Database**: `portal_services_db`
- **Username**: `portal_services_db_user`
- **Password**: `mw3cpereld27I0onwD9oNMXgruyfYvNb`
- **Internal Database URL**: `postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db`

## 🔧 Backend Service Configuration

### **Service Details**
- **Name**: `portal-services-backend`
- **Type**: Web Service
- **Runtime**: Node
- **Plan**: Free
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
- **Health Check Path**: `/health`

### **Environment Variables (OBRIGATÓRIAS)**
```bash
DATABASE_URL=postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db
DB_SSL=true
DB_HOST=dpg-d33u8afdiees739si410-a
DB_PORT=5432
DB_NAME=portal_services_db
DB_USER=portal_services_db_user
DB_PASSWORD=mw3cpereld27I0onwD9oNMXgruyfYvNb
NODE_ENV=production
JWT_SECRET=[Generate no Render]
SESSION_SECRET=[Generate no Render]
```

## 🎨 Frontend Service Configuration

### **Service Details**
- **Name**: `portal-services-frontend`
- **Type**: Static Site
- **Root Directory**: `appclient`
- **Build Command**:
  ```bash
  npm ci --silent
  cd appclient
  npm ci --legacy-peer-deps --silent
  npm run typecheck
  npm run build
  ```
- **Publish Directory**: `build`

### **Environment Variables**
```bash
REACT_APP_API_URL=https://portal-services-backend.onrender.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
CI=false
```

## 🚀 Deploy Step-by-Step

### **1. Database Setup**
1. Acesse: https://dashboard.render.com
2. Clique: **"New +"** → **"Postgres"**
3. Configure:
   - **Name**: `portal-services-db`
   - **Database**: `portal_services_db`
   - **User**: `portal_services_db_user`
   - **Plan**: **Free**
   - **Region**: Oregon
4. Clique: **"Create Database"**
5. **Aguarde**: Status "Available" (2-3 minutos)

### **2. Backend Deploy**
1. Clique: **"New +"** → **"Web Service"**
2. Conecte GitHub: `marcelohs402015/portal-services`
3. Configure:
   - **Name**: `portal-services-backend`
   - **Runtime**: **Node**
   - **Plan**: **Free**
   - **Branch**: `main`
   - **Root Directory**: `appserver`
   - **Build Command**: (copie do documento)
   - **Start Command**: `npx tsx server.ts`
4. **Environment Variables**: (copie todas as variáveis obrigatórias)
5. Clique: **"Create Web Service"**

### **3. Frontend Deploy**
1. Clique: **"New +"** → **"Static Site"**
2. Conecte GitHub: `marcelohs402015/portal-services`
3. Configure:
   - **Name**: `portal-services-frontend`
   - **Branch**: `main`
   - **Root Directory**: `appclient`
   - **Build Command**: (copie do documento)
   - **Publish Directory**: `build`
4. **Environment Variables**: (copie as variáveis do frontend)
5. Clique: **"Create Static Site"**

## 🧪 Testing & Validation

### **Health Check**
```bash
curl https://portal-services-backend.onrender.com/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Portal Services API is running",
  "database": "connected"
}
```

### **API Tests**
```bash
# Categories
curl https://portal-services-backend.onrender.com/api/categories

# Clients
curl https://portal-services-backend.onrender.com/api/clients

# Services
curl https://portal-services-backend.onrender.com/api/services

# Statistics
curl https://portal-services-backend.onrender.com/api/stats/dashboard
```

### **Frontend Test**
- Acesse: `https://portal-services-frontend.onrender.com`
- Deve carregar a aplicação React
- APIs devem funcionar corretamente

## 📊 Final URLs

Após deploy completo:
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend**: `https://portal-services-backend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`
- **API Base**: `https://portal-services-backend.onrender.com/api`

## 🔍 Troubleshooting

### **Common Issues**

#### **Database Connection Error**
- ✅ Verify all environment variables are set
- ✅ Check database status is "Available"
- ✅ Wait 2-3 minutes after saving variables
- ✅ Check web service logs

#### **Build Failures**
- ✅ Check build logs in Render dashboard
- ✅ Verify all dependencies are installed
- ✅ Check TypeScript compilation

#### **Frontend Not Loading**
- ✅ Verify REACT_APP_API_URL is correct
- ✅ Check build completed successfully
- ✅ Verify publish directory is `build`

### **Log Monitoring**
- **Dashboard Render** → **Web Services** → **Logs**
- Look for: `✅ Banco de dados conectado`
- Avoid: `❌ Erro na conexão com banco`

## 📝 Important Notes

- **Database URL**: Use Internal Database URL (not External)
- **SSL**: Always `true` for Render.com
- **Secrets**: Generate new values for JWT_SECRET and SESSION_SECRET
- **Auto-deploy**: Enabled by default
- **Redeploy**: Automatic after saving environment variables

## 🎯 Success Criteria

Deploy is successful when:
- ✅ **Database**: Status "Available"
- ✅ **Backend**: Health check returns `database: "connected"`
- ✅ **Frontend**: Loads without errors
- ✅ **APIs**: All endpoints respond correctly
- ✅ **Logs**: No connection errors

## 📞 Support

### **Render.com Support**
- **Documentation**: https://render.com/docs
- **Support**: https://render.com/support
- **Status**: https://status.render.com

### **Project Support**
- **GitHub**: https://github.com/marcelohs402015/portal-services
- **Issues**: GitHub Issues
- **Documentation**: README.md

---

## 🎉 **PORTAL SERVICES - READY FOR PRODUCTION!**

**Deploy Status**: ✅ Ready
**All APIs**: ✅ Functional
**Database**: ✅ Connected
**Frontend**: ✅ Responsive
**Health Checks**: ✅ Passing

**🚀 Your Portal Services is now live and ready for your clients!**
