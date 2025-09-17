# 🚀 Deploy Rápido no Render.com

## ⚡ Deploy em 3 Passos

### 1️⃣ **Commit e Push**
```bash
git add .
git commit -m "feat: configuração Docker para Render"
git push origin main
```

### 2️⃣ **Criar Serviços no Render**

#### **Opção A: Blueprint Automático (Recomendado)**
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. **"New +"** → **"Blueprint"**
3. Conecte seu repo GitHub
4. O Render detectará automaticamente o `render.yaml`
5. Clique **"Apply"** - banco e API serão criados automaticamente!

#### **Opção B: Manual**
1. **Criar PostgreSQL:**
   - New+ → PostgreSQL
   - Nome: `portal-services-db`
   - Copie a **Internal Database URL**

2. **Criar Web Service:**
   - New+ → Web Service
   - Runtime: **Docker**
   - Dockerfile Path: `Dockerfile`
   - Root Directory: (deixar vazio)
   - Environment Variable: `DATABASE_URL = [sua URL do banco]`

### 3️⃣ **Inicializar Banco**
```bash
# Após criar o banco, execute:
psql $DATABASE_URL < appserver/database/init.sql
```

## ✅ **Configuração Final**

### **Environment Variables no Render:**
```
DATABASE_URL = [fornecido automaticamente pelo Render]
NODE_ENV = production
JWT_SECRET = [clique Generate]
JWT_REFRESH_SECRET = [clique Generate]
PORT = 10000
```

### **Testar Deploy:**
```bash
curl https://sua-api.onrender.com/health
```

## 🔧 **Troubleshooting**

### **Erro: "Cannot find module"**
- Verifique se o Root Directory está correto
- Use `Dockerfile` como Dockerfile Path

### **Erro: "Database connection failed"**
- Use a **Internal Database URL** (não External)
- Verifique se o banco está na mesma região

### **Build falha:**
- Verifique os logs de build no Render
- Teste localmente: `docker build -t test .`

### **Dockerfiles Disponíveis:**
- **`Dockerfile`** - Para produção no Render (recomendado)
- **`Dockerfile.optimized`** - Multi-stage build (alternativa)
- **`docker-compose.yml`** - Para desenvolvimento local

## 🎯 **URLs Importantes**

- **API:** `https://portal-services-api.onrender.com`
- **Health Check:** `https://portal-services-api.onrender.com/health`
- **Login:** `POST https://portal-services-api.onrender.com/api/auth/login`

## 🔐 **Usuários Padrão**

| Email | Senha | Role |
|-------|-------|------|
| admin@portalservices.com | Admin@123456 | super_admin |
| user@portalservices.com | User@123456 | user |

## 📱 **Para N8N**

Use a URL da API no N8N:
```
https://portal-services-api.onrender.com/api/
```

**Headers necessários:**
```
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

---

**Pronto! Sua API estará rodando no Render em poucos minutos!** 🎉
