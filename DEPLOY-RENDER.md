# 🚀 Deploy no Render.com - Portal Services

Este guia explica como fazer o deploy da aplicação Portal Services no Render.com usando o Blueprint.

## 📋 Pré-requisitos

1. **Conta no Render.com** - [Criar conta gratuita](https://render.com)
2. **Repositório no GitHub** - Código deve estar no GitHub

## 🔧 Configuração do Blueprint

### 1. Acessar o Render.com
- Faça login no [Render.com](https://render.com)
- Clique em **"New +"** → **"Blueprint"**

### 2. Conectar Repositório
- Selecione seu repositório GitHub
- O Render detectará automaticamente o arquivo `render.yaml`

### 3. Configurar Variáveis de Ambiente

#### 🔐 Variáveis de Segurança
O Render gerará automaticamente:
- `JWT_SECRET` - Para autenticação
- `SESSION_SECRET` - Para sessões

## 🏗️ Estrutura do Deploy

### Serviços Criados:

1. **🗄️ Banco de Dados PostgreSQL**
   - Nome: `portal-services-db`
   - Plano: Starter (gratuito)
   - SSL habilitado

2. **🔧 Backend API**
   - Nome: `portal-services-backend`
   - URL: `https://portal-services-backend.onrender.com`
   - Health Check: `/health`
   - Auto-deploy habilitado

3. **🌐 Frontend React**
   - Nome: `portal-services-frontend`
   - URL: `https://portal-services-frontend.onrender.com`
   - Headers de segurança configurados
   - Auto-deploy habilitado

4. **⏰ Cron Job (Opcional)**
   - Limpeza automática de dados antigos
   - Executa diariamente às 2h da manhã

## 🚀 Processo de Deploy

### 1. Deploy Automático
```bash
# O deploy acontece automaticamente quando você:
git add .
git commit -m "Deploy para produção"
git push origin main
```

### 2. Monitoramento
- Acesse o dashboard do Render
- Monitore logs em tempo real
- Verifique health checks

### 3. URLs de Acesso
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Backend API**: `https://portal-services-backend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`

## 🔍 Verificação do Deploy

### 1. Testar Health Check
```bash
curl https://portal-services-backend.onrender.com/health
```

### 2. Testar API
```bash
curl https://portal-services-backend.onrender.com/api/categories
```

### 3. Verificar Frontend
- Acesse a URL do frontend
- Teste login e funcionalidades principais

## 🛠️ Comandos de Build

### Backend
```bash
cd appserver
npm ci --only=production
npm run build
npm start
```

### Frontend
```bash
cd appclient
npm ci --legacy-peer-deps
npm run build
```

## 📊 Monitoramento e Logs

### 1. Logs do Backend
- Acesse o dashboard do Render
- Vá para o serviço `portal-services-backend`
- Clique em "Logs"

### 2. Métricas
- CPU e memória
- Requests por minuto
- Tempo de resposta

### 3. Health Checks
- Verificação automática a cada 5 minutos
- Endpoint: `/health`

## 🔧 Troubleshooting

### Problemas Comuns:

1. **Build Falha**
   ```bash
   # Verificar logs de build
   # Verificar dependências no package.json
   ```

2. **Banco de Dados não Conecta**
   ```bash
   # Verificar variáveis de ambiente
   # Verificar SSL habilitado
   ```

3. **Frontend não Carrega**
   ```bash
   # Verificar REACT_APP_API_URL
   # Verificar CORS no backend
   ```

### Logs Úteis:
```bash
# Verificar status do banco
curl https://portal-services-backend.onrender.com/api/health

# Verificar categorias
curl https://portal-services-backend.onrender.com/api/categories
```

## 🔄 Atualizações

### Deploy de Novas Versões:
```bash
# 1. Fazer alterações no código
# 2. Commit e push
git add .
git commit -m "Nova funcionalidade"
git push origin main

# 3. Deploy automático no Render
```

### Rollback:
- Use o dashboard do Render
- Vá para "Deploys"
- Clique em "Rollback" na versão desejada

## 💰 Custos

### Plano Gratuito (Starter):
- **Backend**: 750 horas/mês
- **Frontend**: Ilimitado (estático)
- **Banco**: 1GB de armazenamento
- **Cron**: 100 execuções/mês

### Limitações:
- Serviços "dormem" após 15min de inatividade
- Primeira requisição pode demorar ~30s (cold start)
- Logs limitados a 7 dias

## 🚀 Otimizações para Produção

### 1. Performance
- Cache de assets estáticos
- Compressão gzip habilitada
- Headers de cache configurados

### 2. Segurança
- HTTPS obrigatório
- Headers de segurança
- CORS configurado
- SSL no banco de dados

### 3. Monitoramento
- Health checks automáticos
- Logs estruturados
- Métricas de performance

## 📞 Suporte

### Render.com
- [Documentação](https://render.com/docs)
- [Status Page](https://status.render.com)
- [Community](https://community.render.com)

### Portal Services
- Verificar logs no dashboard
- Testar endpoints de health check
- Verificar variáveis de ambiente

---

## ✅ Checklist de Deploy

- [ ] Repositório no GitHub
- [ ] Arquivo `render.yaml` configurado
- [ ] Chave da API do Google AI configurada
- [ ] Blueprint criado no Render
- [ ] Deploy executado com sucesso
- [ ] Health checks funcionando
- [ ] Frontend acessível
- [ ] API respondendo
- [ ] Banco de dados conectado
- [ ] Logs sendo gerados

**🎉 Sua aplicação está no ar!**
