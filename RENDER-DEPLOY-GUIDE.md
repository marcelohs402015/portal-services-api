# 🚀 Portal Services - Deploy no Render.com

## 📋 Visão Geral

Este guia mostra como fazer deploy completo do Portal Services no Render.com usando o Blueprint (`render.yaml`) baseado no `package.json`.

## 🏗️ Arquitetura do Deploy

O sistema será deployado com:

- **🗄️ Database**: PostgreSQL (Render Managed Database)
- **🔧 Backend**: Node.js API Server
- **🌐 Frontend**: React Static Site
- **⏰ Cron Jobs**: Database Setup + Health Checks

## 📦 Serviços Incluídos

### 1. **Portal Services Backend**
- **Tipo**: Web Service
- **Runtime**: Node.js
- **Porta**: 10000 (automática do Render)
- **Health Check**: `/health`

### 2. **Portal Services Frontend**
- **Tipo**: Static Site
- **Build**: React Production Build
- **URL**: `https://portal-services-frontend.onrender.com`

### 3. **Database Setup (Cron)**
- **Tipo**: Cron Job
- **Frequência**: Diário (00:00)
- **Função**: Configurar tabelas do banco

### 4. **Health Check (Cron)**
- **Tipo**: Cron Job
- **Frequência**: A cada 5 minutos
- **Função**: Monitorar saúde do sistema

## 🚀 Passos para Deploy

### 1. **Preparar o Repositório**

```bash
# Garantir que está na branch main
git checkout main
git pull origin main

# Verificar se o render.yaml está commitado
git add render.yaml
git commit -m "Add Render.com Blueprint configuration"
git push origin main
```

### 2. **Deploy via Render Dashboard**

1. **Acesse**: [render.com](https://render.com)
2. **Login**: Com sua conta GitHub
3. **New Blueprint**: Clique em "New Blueprint"
4. **Connect Repository**: Selecione `portal-services`
5. **Deploy**: Clique em "Apply"

### 3. **Configurar Variáveis de Ambiente**

Após o deploy, configure as variáveis de ambiente:

#### **Backend Service**
```env
# Gmail API (Obrigatório)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# JWT Secrets (Gerados automaticamente)
JWT_SECRET=auto-generated
SESSION_SECRET=auto-generated
```

#### **Frontend Service**
```env
# API URL (Atualizar após deploy do backend)
REACT_APP_API_URL=https://portal-services-backend.onrender.com
```

## 🔧 Scripts do Package.json Utilizados

### **Build Commands**
```json
{
  "build": "npm run build:server && npm run build:client",
  "build:server": "cd appserver && npm run build",
  "build:client": "cd appclient && npm run build"
}
```

### **Start Commands**
```json
{
  "start": "cd appserver && npm start",
  "dev": "./start-dev.sh"
}
```

### **Setup Commands**
```json
{
  "setup": "cd appserver && npm run setup",
  "typecheck": "cd appserver && npm run typecheck && cd ../appclient && npm run typecheck"
}
```

## 📊 Monitoramento

### **Health Checks**
- **Backend**: `https://portal-services-backend.onrender.com/health`
- **Frontend**: `https://portal-services-frontend.onrender.com`

### **Logs**
- Acesse o dashboard do Render
- Vá em "Logs" para cada serviço
- Monitore erros e performance

### **Database**
- **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
- **Port**: `5432`
- **SSL**: Obrigatório

## 🔍 Troubleshooting

### **Build Failures**
```bash
# Verificar logs de build
# Problemas comuns:
# 1. Dependências não instaladas
# 2. TypeScript errors
# 3. Variáveis de ambiente faltando
```

### **Runtime Errors**
```bash
# Verificar logs de runtime
# Problemas comuns:
# 1. Database connection
# 2. Port configuration
# 3. Environment variables
```

### **Database Issues**
```bash
# Verificar conexão
# 1. SSL habilitado
# 2. Credenciais corretas
# 3. Database setup executado
```

## 📈 Performance

### **Otimizações Implementadas**
- ✅ Build otimizado com `npm ci`
- ✅ TypeScript check antes do build
- ✅ Source maps desabilitados
- ✅ Dependências de produção apenas
- ✅ Health checks automáticos

### **Plano Starter (Gratuito)**
- **Backend**: 512MB RAM, 0.1 CPU
- **Frontend**: Static hosting
- **Database**: 1GB storage
- **Limitações**: Sleep após 15min inativo

## 🔄 Auto-Deploy

O sistema está configurado para:
- ✅ Auto-deploy na branch `main`
- ✅ Build automático em push
- ✅ Health checks contínuos
- ✅ Database setup diário

## 📞 URLs Finais

Após o deploy:
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend API**: `https://portal-services-backend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`

## 🎯 Próximos Passos

1. **Configurar Gmail API** para automação de emails
2. **Configurar domínio customizado** (opcional)
3. **Implementar CI/CD** com GitHub Actions
4. **Configurar monitoramento** avançado
5. **Otimizar performance** com cache

---

**✅ Deploy completo baseado no package.json v2.0.0**
