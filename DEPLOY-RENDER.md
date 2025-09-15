# 🚀 Portal Services - Deploy no Render.com

## 📋 Visão Geral

Este guia explica como fazer deploy completo do **Portal Services** no Render.com usando o Blueprint (render.yaml).

## 🎯 O que será criado

O deploy criará automaticamente:

- **🗄️ Database**: PostgreSQL (portal-services-db)
- **🔧 Backend**: API Node.js (portal-services-backend) 
- **🎨 Frontend**: React Static (portal-services-frontend)
- **⚙️ DB Setup**: Cron Job para configuração do banco
- **🔍 Health Check**: Cron Job para monitoramento

## 🚀 Deploy Rápido

### 1. Preparar o Repositório

```bash
# Execute o script de deploy (na raiz do projeto)
./deploy-render.sh
```

### 2. Deploy no Render.com

1. **Acesse**: https://dashboard.render.com
2. **Clique**: "New +" → "Blueprint"
3. **Conecte**: Seu repositório GitHub
4. **Selecione**: Este repositório (portal-services)
5. **Aplique**: O Render detectará automaticamente o `render.yaml`
6. **Clique**: "Apply" para criar todos os serviços

## ⚙️ Configurações Técnicas

### Backend (portal-services-backend)
- **Runtime**: Node.js
- **Build Command**: Instala dependências e verifica TypeScript
- **Start Command**: `npx tsx server.ts`
- **Health Check**: `/health`
- **Port**: 10000 (automático)

### Frontend (portal-services-frontend)
- **Runtime**: Static Site
- **Build Command**: Build do React com TypeScript
- **Root Directory**: `./appclient/build`
- **API URL**: Conecta automaticamente ao backend

### Database (portal-services-db)
- **Tipo**: PostgreSQL
- **Plan**: Starter (gratuito)
- **Região**: Oregon
- **SSL**: Habilitado

## 🔧 Variáveis de Ambiente

### Automáticas (Render gerencia)
- `DATABASE_URL` - String de conexão do banco
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `SESSION_SECRET` (gerados automaticamente)

### Manuais (você deve configurar)
```bash
# Gmail API (para funcionalidade de emails)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
```

## 📊 URLs dos Serviços

Após o deploy, você terá:

- **Backend API**: `https://portal-services-backend.onrender.com`
- **Frontend**: `https://portal-services-frontend.onrender.com`
- **Health Check**: `https://portal-services-backend.onrender.com/health`

## 🧪 Testando o Deploy

### 1. Health Check
```bash
curl https://portal-services-backend.onrender.com/health
```

### 2. API Endpoints
```bash
# Listar categorias
curl https://portal-services-backend.onrender.com/api/categories

# Listar clientes
curl https://portal-services-backend.onrender.com/api/clients

# Estatísticas
curl https://portal-services-backend.onrender.com/api/stats/dashboard
```

## 🔍 Monitoramento

### Logs
- Acesse o dashboard do Render
- Clique no serviço desejado
- Aba "Logs" para ver logs em tempo real

### Health Checks
- Cron job executa a cada 5 minutos
- Verifica status da API e banco de dados
- Logs de erro são enviados automaticamente

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Build Falha
```bash
# Verificar logs no Render Dashboard
# Problema comum: dependências não instaladas
```

#### 2. Database Connection
```bash
# Verificar se DATABASE_URL está configurada
# Aguardar alguns minutos após criação do banco
```

#### 3. Frontend não carrega
```bash
# Verificar se REACT_APP_API_URL está correto
# Deve apontar para o backend no Render
```

### Comandos Úteis

```bash
# Verificar status local
npm run dev

# Testar build local
npm run build

# Verificar TypeScript
npm run typecheck
```

## 📈 Escalabilidade

### Plans Disponíveis
- **Starter**: Gratuito (limitações de CPU/memória)
- **Standard**: $7/mês (mais recursos)
- **Pro**: $25/mês (alta disponibilidade)

### Upgrade
1. Acesse o serviço no dashboard
2. Clique em "Settings"
3. Mude o plan desejado
4. Aplique as mudanças

## 🔐 Segurança

### SSL/TLS
- ✅ Automático no Render
- ✅ HTTPS obrigatório
- ✅ Certificados gerenciados

### Variáveis Sensíveis
- ✅ Não commitadas no código
- ✅ Gerenciadas pelo Render
- ✅ Criptografadas em repouso

## 📞 Suporte

### Render.com
- **Documentação**: https://render.com/docs
- **Suporte**: https://render.com/support
- **Status**: https://status.render.com

### Portal Services
- **Issues**: GitHub Issues
- **Documentação**: README.md
- **Logs**: Render Dashboard

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. **Configure Gmail API** para funcionalidade de emails
2. **Teste todas as funcionalidades** no ambiente de produção
3. **Configure domínio personalizado** (opcional)
4. **Monitore logs** e performance
5. **Configure backups** do banco de dados

---

**🚀 Seu Portal Services estará online e pronto para seus clientes!**