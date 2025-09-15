# 🚀 Portal Services API - Deploy no Render

## 📋 Visão Geral

Este projeto está configurado para deploy automático no [Render](https://render.com) usando o arquivo `render.yaml`. O deploy inclui:

- **PostgreSQL Database**: Banco de dados gerenciado
- **Node.js API**: Servidor Express com TypeScript
- **Inicialização Automática**: Tabelas e dados iniciais criados automaticamente

## 🛠️ Configuração do Deploy

### 1. Conectar Repositório

1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" → "Blueprint"
3. Conecte seu repositório Git (GitHub, GitLab, etc.)
4. O Render detectará automaticamente o arquivo `render.yaml`

### 2. Serviços Criados Automaticamente

#### 🗄️ PostgreSQL Database
- **Nome**: `portal-services-db`
- **Plano**: Starter (gratuito)
- **Configuração**: Automática via `render.yaml`

#### 🌐 Web Service (API)
- **Nome**: `portal-services-api`
- **Runtime**: Node.js
- **Plano**: Starter (gratuito)
- **URL**: `https://portal-services-api.onrender.com`

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas Automaticamente

| Tabela | Descrição |
|--------|-----------|
| `categories` | Categorias de serviços |
| `services` | Serviços oferecidos |
| `clients` | Clientes cadastrados |
| `quotations` | Orçamentos |
| `appointments` | Agendamentos |
| `emails` | Emails recebidos |
| `email_templates` | Templates de email |
| `system_settings` | Configurações do sistema |

### Dados Iniciais

- **5 Categorias**: Elétrica, Hidráulica, Pintura, Reformas, Manutenção
- **9 Serviços**: Exemplos de serviços para cada categoria
- **5 Configurações**: Configurações padrão do sistema

## 🔗 Endpoints da API

### Health Check
```
GET /health
GET /api/health
```

### Categorias
```
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Clientes
```
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Serviços
```
GET    /api/services
GET    /api/services/:id
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id
```

### Orçamentos
```
GET    /api/quotations
GET    /api/quotations/:id
POST   /api/quotations
PUT    /api/quotations/:id
DELETE /api/quotations/:id
```

### Agendamentos
```
GET    /api/appointments
GET    /api/appointments/:id
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Emails
```
GET    /api/emails
GET    /api/emails/:id
POST   /api/emails
PUT    /api/emails/:id
DELETE /api/emails/:id
```

### Estatísticas
```
GET    /api/stats/business
GET    /api/stats/dashboard
```

## 🔧 Variáveis de Ambiente

### Configuradas Automaticamente
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Conexão com banco
- `JWT_SECRET`, `SESSION_SECRET` - Geradas automaticamente
- `NODE_ENV=production`
- `PORT=10000`

### Configurações Opcionais
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

## 🧪 Testando o Deploy

### 1. Health Check
```bash
curl https://seu-app.onrender.com/health
```

### 2. Informações da API
```bash
curl https://portal-services-api.onrender.com/api/info
```

### 3. Listar Categorias
```bash
curl https://portal-services-api.onrender.com/api/categories
```

### 4. Estatísticas
```bash
curl https://portal-services-api.onrender.com/api/stats/dashboard
```

## 📈 Monitoramento

### Health Checks
- **API**: `https://portal-services-api.onrender.com/health`
- **Database**: Monitorado automaticamente pelo Render

### Logs
- **Build Logs**: Dashboard → Service → Builds
- **Runtime Logs**: Dashboard → Service → Logs
- **Database Logs**: Dashboard → Database → Logs

## 🚨 Troubleshooting

### Problemas Comuns

**1. Build Falha**
- Verificar se todas as dependências estão no `package.json`
- Verificar logs de build no dashboard do Render

**2. Banco de Dados Não Conecta**
- Verificar se as variáveis de ambiente estão corretas
- Verificar se o banco está ativo no dashboard

**3. API Não Responde**
- Verificar health check: `/health`
- Verificar logs da aplicação no dashboard

### Logs Importantes
```bash
# Verificar se o banco foi inicializado
# Procurar por: "Banco de dados inicializado com sucesso!"

# Verificar se a API está rodando
# Procurar por: "Portal Services Server rodando em"
```

## 🔄 Deploy Automático

### Configuração
- **Auto Deploy**: Habilitado por padrão
- **Branch**: `main` ou `master`
- **Pull Request Previews**: Habilitado

### Processo
1. Push para branch principal
2. Build automático
3. Inicialização do banco de dados
4. Deploy da nova versão
5. Health check
6. Ativação da nova versão

## 📊 Limitações do Plano Gratuito

- **Sleep**: Aplicação "dorme" após 15 minutos de inatividade
- **Runtime**: 750 horas/mês
- **RAM**: 1GB
- **CPU**: 1 core
- **Storage**: 1GB

## 🔒 Segurança

### Configurações Automáticas
- HTTPS automático
- Variáveis de ambiente seguras
- Secrets gerados automaticamente
- Firewall configurado

### Recomendações
- Alterar secrets padrão em produção
- Configurar CORS adequadamente
- Implementar rate limiting
- Monitorar logs de segurança

## 📞 Suporte

### Recursos
- [Documentação Render](https://render.com/docs)
- [Status Page](https://status.render.com)
- [Community Forum](https://community.render.com)

### Contato
- Email: support@render.com
- Chat: Dashboard do Render

## 🎯 Próximos Passos

1. **Deploy Inicial**: Conecte o repositório no Render
2. **Configurar Domínio**: Adicionar domínio customizado
3. **Monitoramento**: Configurar alertas
4. **Backup**: Configurar backup automático
5. **CI/CD**: Configurar pipeline de deploy

---

**✨ O deploy está configurado para ser totalmente automático! Apenas conecte seu repositório no Render e tudo será configurado automaticamente.**
