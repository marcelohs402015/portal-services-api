# 🚀 Portal Services - Deploy no DigitalOcean App Platform

## 🎯 Por que DigitalOcean?
- ✅ **Muito confiável** e estável
- ✅ **PostgreSQL gerenciado** (Managed Database)
- ✅ **Deploy automático** do GitHub
- ✅ **$12/mês** - Preço justo
- ✅ **Suporte excelente**

## 🚀 Deploy Passo a Passo

### **1. Criar Conta**
1. Acesse: https://cloud.digitalocean.com
2. **"Sign up"** ou **"Sign in"**
3. **Adicione cartão** de crédito

### **2. Criar App**
1. **"Create"** → **"Apps"**
2. **"GitHub"** → Conecte sua conta
3. **Selecione**: `marcelohs402015/portal-services`
4. **Branch**: `main`

### **3. Configurar Serviços**

#### **Backend Service**
- **Source**: `appserver/`
- **Type**: **Web Service**
- **Build Command**: `npm ci && npm run typecheck`
- **Run Command**: `npx tsx server.ts`
- **HTTP Port**: `3001`

#### **Frontend Service**
- **Source**: `appclient/`
- **Type**: **Static Site**
- **Build Command**: `npm ci --legacy-peer-deps && npm run build`
- **Output Directory**: `build`

#### **Database**
- **Type**: **Database**
- **Engine**: **PostgreSQL**
- **Plan**: **Basic** ($15/mês)

### **4. Variáveis de Ambiente**

#### **Backend**
```bash
NODE_ENV=production
DATABASE_URL=[DigitalOcean gera automaticamente]
JWT_SECRET=[gerar]
SESSION_SECRET=[gerar]
```

#### **Frontend**
```bash
REACT_APP_API_URL=https://backend-url.ondigitalocean.app
REACT_APP_ENVIRONMENT=production
```

## 💰 Preços
- **App Platform**: $12/mês
- **PostgreSQL Database**: $15/mês
- **Total**: ~$27/mês

## 🎉 Vantagens
- ✅ **Muito estável**
- ✅ **Backup automático**
- ✅ **SSL automático**
- ✅ **CDN global**
- ✅ **Monitoramento**

---

**🎯 DigitalOcean = Profissional, confiável, funciona sempre!**
