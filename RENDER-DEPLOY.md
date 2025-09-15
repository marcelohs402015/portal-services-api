# Portal Services API - Deploy no Render

## 🚀 Configuração para Deploy no Render

Este documento explica como fazer o deploy da Portal Services API no Render usando o arquivo `render.yaml`.

### 📋 Pré-requisitos

1. **Conta no Render**: Crie uma conta em [render.com](https://render.com)
2. **Repositório Git**: O código deve estar em um repositório Git (GitHub, GitLab, etc.)
3. **Arquivo render.yaml**: Já configurado na raiz do projeto

### 🔧 Configuração do Deploy

#### 1. Conectar Repositório

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em "New +" → "Blueprint"
3. Conecte seu repositório Git
4. O Render detectará automaticamente o arquivo `render.yaml`

#### 2. Serviços Configurados

O `render.yaml` configura automaticamente:

- **PostgreSQL Database**: Banco de dados gerenciado
- **Web Service**: API Node.js com build automático
- **Variáveis de Ambiente**: Configuradas automaticamente
- **Health Checks**: Monitoramento automático

### 🗄️ Banco de Dados

#### Configuração Automática
- **Tipo**: PostgreSQL gerenciado
- **Plano**: Starter (gratuito)
- **Inicialização**: Scripts SQL executados automaticamente
- **Backup**: Automático (plano pago)

#### Tabelas Criadas
- `categories` - Categorias de serviços
- `services` - Serviços oferecidos
- `clients` - Clientes cadastrados
- `quotations` - Orçamentos
- `appointments` - Agendamentos
- `emails` - Emails recebidos
- `email_templates` - Templates de email
- `system_settings` - Configurações do sistema

### 🌐 API Web Service

#### Configuração
- **Runtime**: Node.js 18+
- **Build Command**: `cd appserver && npm install && npm run build`
- **Start Command**: `cd appserver && npm start`
- **Port**: 10000 (padrão do Render)

#### Endpoints Disponíveis
```
GET  /health                    - Health check
GET  /api/health               - API health check
GET  /api/categories           - Listar categorias
POST /api/categories           - Criar categoria
GET  /api/clients              - Listar clientes
POST /api/clients              - Criar cliente
GET  /api/services             - Listar serviços
POST /api/services             - Criar serviço
GET  /api/quotations           - Listar orçamentos
POST /api/quotations           - Criar orçamento
GET  /api/appointments         - Listar agendamentos
POST /api/appointments         - Criar agendamento
GET  /api/emails               - Listar emails
POST /api/emails               - Criar email
GET  /api/stats/business       - Estatísticas do negócio
GET  /api/stats/dashboard      - Estatísticas do dashboard
```

### 🔐 Variáveis de Ambiente

#### Configuradas Automaticamente
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Conexão com banco
- `JWT_SECRET`, `SESSION_SECRET` - Geradas automaticamente
- `NODE_ENV=production`
- `PORT=10000`

#### Configurações Opcionais
Para configurar recursos adicionais, adicione no dashboard do Render:

```bash
# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
EMAIL_FROM=seu-email@gmail.com

# Google APIs
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://portal-services-api.onrender.com/auth/google/callback
```

### 📊 Monitoramento

#### Health Checks
- **API**: `https://seu-app.onrender.com/health`
- **Database**: Monitorado automaticamente pelo Render
- **Logs**: Disponíveis no dashboard do Render

#### Métricas
- Uptime
- Response time
- Error rate
- Resource usage

### 🔄 Deploy Automático

#### Configuração
- **Auto Deploy**: Habilitado por padrão
- **Branch**: `main` ou `master`
- **Pull Request Previews**: Habilitado

#### Processo de Deploy
1. Push para branch principal
2. Build automático
3. Deploy da nova versão
4. Health check
5. Ativação da nova versão

### 🛠️ Comandos Úteis

#### Build Local (para testar)
```bash
# Instalar dependências
cd appserver && npm install

# Build de produção
npm run build

# Testar localmente
npm start
```

#### Verificar Deploy
```bash
# Health check
curl https://seu-app.onrender.com/health

# Testar API
curl https://seu-app.onrender.com/api/categories
```

### 🚨 Troubleshooting

#### Problemas Comuns

**1. Build Falha**
- Verificar se todas as dependências estão no `package.json`
- Verificar se o comando de build está correto
- Verificar logs de build no dashboard

**2. Banco de Dados Não Conecta**
- Verificar se as variáveis de ambiente estão corretas
- Verificar se o banco está ativo
- Verificar logs da aplicação

**3. API Não Responde**
- Verificar health check: `/health`
- Verificar logs da aplicação
- Verificar se a porta está correta (10000)

#### Logs
- **Build Logs**: Dashboard → Service → Builds
- **Runtime Logs**: Dashboard → Service → Logs
- **Database Logs**: Dashboard → Database → Logs

### 📈 Escalabilidade

#### Planos Disponíveis
- **Starter**: Gratuito (limitações)
- **Standard**: $7/mês
- **Pro**: $25/mês
- **Enterprise**: Customizado

#### Limitações do Plano Gratuito
- Sleep após 15 minutos de inatividade
- 750 horas/mês de runtime
- 1GB RAM
- 1 CPU

### 🔒 Segurança

#### Configurações de Produção
- HTTPS automático
- Variáveis de ambiente seguras
- Secrets gerados automaticamente
- Firewall configurado

#### Recomendações
- Alterar secrets padrão
- Configurar CORS adequadamente
- Implementar rate limiting
- Monitorar logs de segurança

### 📞 Suporte

#### Recursos
- [Documentação Render](https://render.com/docs)
- [Status Page](https://status.render.com)
- [Community Forum](https://community.render.com)

#### Contato
- Email: support@render.com
- Chat: Dashboard do Render

### 🎯 Próximos Passos

1. **Deploy Inicial**: Siga os passos acima
2. **Configurar Domínio**: Adicionar domínio customizado
3. **Monitoramento**: Configurar alertas
4. **Backup**: Configurar backup automático
5. **CI/CD**: Configurar pipeline de deploy

---

**Nota**: Este arquivo `render.yaml` está configurado para deploy automático. Apenas conecte seu repositório no Render e o deploy será feito automaticamente!
