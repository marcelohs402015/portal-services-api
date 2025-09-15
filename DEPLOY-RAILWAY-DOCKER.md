# 🚀 Portal Services - Deploy Railway (Docker + PostgreSQL)

## 🎯 **PERFEITO para seu setup!**
- ✅ **PostgreSQL no Docker** → Railway detecta automaticamente
- ✅ **Backend Node.js** → Railway suporta nativamente
- ✅ **Frontend React** → Build automático
- ✅ **$5/mês** - Muito barato
- ✅ **Funciona IGUAL ao local**

## 🚀 **Deploy em 5 Minutos**

### **1. Criar Conta Railway**
1. **Acesse**: https://railway.app
2. **"Sign up with GitHub"**
3. **Autorize** o Railway

### **2. Deploy Automático**
1. **"New Project"** → **"Deploy from GitHub repo"**
2. **Selecione**: `marcelohs402015/portal-services`
3. **Railway detecta automaticamente**:
   - ✅ **Backend** em `appserver/`
   - ✅ **Frontend** em `appclient/`
   - ✅ **Docker** (se houver)
   - ✅ **PostgreSQL** (Railway cria)

### **3. Configurar Database**
1. **Railway cria PostgreSQL automaticamente**
2. **Variáveis automáticas**:
   - ✅ `DATABASE_URL` (PostgreSQL do Railway)
   - ✅ `PORT` (automático)
   - ✅ `NODE_ENV=production`

### **4. Variáveis de Ambiente**
**Railway gera automaticamente:**
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
NODE_ENV=production
PORT=3001
```

**Só adicionar** (se necessário):
```bash
JWT_SECRET=[gerar]
SESSION_SECRET=[gerar]
```

## 🎉 **Railway faz TUDO sozinho!**

### **✅ O que Railway detecta:**
- **Backend**: `appserver/` → Node.js
- **Frontend**: `appclient/` → React
- **Docker**: Se houver `Dockerfile`
- **PostgreSQL**: Cria automaticamente
- **Build**: `npm ci` + `npm run build`
- **Start**: `npx tsx server.ts`

### **✅ URLs automáticas:**
- **Backend**: `https://portal-services-production.up.railway.app`
- **Frontend**: `https://portal-services-production.up.railway.app`
- **API**: `https://portal-services-production.up.railway.app/api`

## 🧪 **Teste**
```bash
curl https://portal-services-production.up.railway.app/health
```

## 💰 **Preços**
- **Hobby Plan**: $5/mês
- **Inclui**: PostgreSQL + App + Deploy automático

## 🔧 **Arquivos de Configuração**
- ✅ **`railway.json`** - Configuração Railway
- ✅ **`nixpacks.toml`** - Build personalizado
- ✅ **PostgreSQL** - Gerenciado pelo Railway

## 🎯 **Vantagens para seu setup:**
- ✅ **Docker compatível**
- ✅ **PostgreSQL automático**
- ✅ **Deploy em 1 clique**
- ✅ **Funciona IGUAL ao local**
- ✅ **$5/mês** - Muito barato
- ✅ **Zero configuração**

---

## 🚀 **PRÓXIMO PASSO**

1. **Acesse**: https://railway.app
2. **"Sign up with GitHub"**
3. **"Deploy from GitHub repo"**
4. **Selecione**: `marcelohs402015/portal-services`
5. **Pronto!** Railway faz tudo sozinho

**Railway é PERFEITO para seu setup Docker + PostgreSQL!** 🎉
