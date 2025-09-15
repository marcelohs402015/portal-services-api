# 🔧 Railway - Troubleshooting

## 🚨 **Problemas Comuns e Soluções**

### **1. Build Falha**

#### **Erro: npm ci failed**
```bash
# Solução: Railway usa cache, limpe o cache
# No Railway Dashboard:
# Settings → Build → Clear Build Cache
```

#### **Erro: TypeScript compilation failed**
```bash
# Verifique se o build está funcionando localmente:
npm run typecheck
npm run build
```

### **2. Banco de Dados**

#### **Erro: Database connection failed**
```bash
# Verifique as variáveis de ambiente:
# Railway Dashboard → Variables
# Certifique-se que DATABASE_URL está configurada
```

#### **Erro: Table doesn't exist**
```bash
# Execute o setup do banco:
# Railway Dashboard → Deployments → View Logs
# Procure por "Database setup completed"
```

### **3. Deploy**

#### **Erro: Start command failed**
```bash
# Verifique o startCommand no railway.json:
# Deve ser: "npm run railway:start"
```

#### **Erro: Health check failed**
```bash
# Verifique se o endpoint /health está funcionando:
# https://your-app.railway.app/health
```

### **4. Performance**

#### **App lento**
```bash
# Railway Free tem limitações:
# - 512MB RAM
# - CPU limitado
# - Sleep após inatividade
```

#### **Solução: Upgrade para Pro ($5/mês)**
- ✅ 1GB RAM
- ✅ CPU dedicado
- ✅ Sem sleep
- ✅ Domínio customizado

## 🛠️ **Comandos Úteis**

### **Verificar Logs**
```bash
# Railway Dashboard → Deployments → View Logs
# Ou use Railway CLI:
railway logs
```

### **Restart Service**
```bash
# Railway Dashboard → Deployments → Restart
```

### **Verificar Variáveis**
```bash
# Railway Dashboard → Variables
# Certifique-se que todas estão configuradas
```

## 📞 **Suporte**

### **Railway Support**
- 📧 Email: support@railway.app
- 💬 Discord: https://discord.gg/railway
- 📚 Docs: https://docs.railway.app

### **Portal Services Support**
- 🐛 Issues: GitHub Issues
- 📧 Email: marcelohs402015@gmail.com

## ✅ **Checklist de Deploy**

- [ ] ✅ Código commitado no GitHub
- [ ] ✅ Railway conectado ao repositório
- [ ] ✅ PostgreSQL criado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build passou
- [ ] ✅ Health check funcionando
- [ ] ✅ Frontend acessível
- [ ] ✅ APIs funcionando

## 🎯 **Status do Deploy**

### **✅ Sucesso**
```
✅ Build completed
✅ Database connected
✅ Server started
✅ Health check passed
✅ Frontend accessible
```

### **❌ Falha**
```
❌ Build failed
❌ Database connection failed
❌ Server start failed
❌ Health check failed
```

## 🔄 **Re-deploy**

### **Automático**
- Push para `main` branch
- Railway detecta mudanças
- Deploy automático

### **Manual**
```bash
# Railway Dashboard → Deployments → Deploy
```

## 📊 **Monitoramento**

### **Métricas Disponíveis**
- CPU Usage
- Memory Usage
- Network I/O
- Response Time

### **Logs**
- Build Logs
- Runtime Logs
- Error Logs
- Access Logs
