# 🚀 Portal Services API - Guia Blueprint Render

## 📋 Visão Geral

Este guia explica como usar o Render Blueprint para fazer deploy automático da Portal Services API. O Blueprint é uma forma avançada de configurar múltiplos serviços no Render usando um arquivo YAML.

## 🎯 Arquivos de Configuração

### 1. `render.yaml` - Configuração Principal
- Configuração completa com todos os recursos
- Inclui banco de dados, API, documentação e cron jobs
- Ideal para produção

### 2. `render-simple.yaml` - Configuração Simplificada
- Apenas banco de dados e API
- Ideal para desenvolvimento e testes
- Deploy mais rápido

### 3. `render-blueprint.yaml` - Configuração Avançada
- Configuração completa com todos os recursos avançados
- Inclui domínios customizados, cron jobs, etc.
- Ideal para produção enterprise

## 🛠️ Como Usar o Blueprint

### Passo 1: Preparar o Repositório

1. **Commit dos arquivos**:
   ```bash
   git add render.yaml
   git commit -m "Add Render Blueprint configuration"
   git push origin main
   ```

2. **Verificar estrutura**:
   ```
   portal-services-api/
   ├── render.yaml (ou render-simple.yaml)
   ├── appserver/
   │   ├── package.json
   │   ├── server.ts
   │   └── scripts/init-database.js
   └── Dockerfile.db
   ```

### Passo 2: Conectar no Render

1. **Acesse o Render**:
   - Vá para [render.com](https://render.com)
   - Faça login na sua conta

2. **Criar Blueprint**:
   - Clique em "New +"
   - Selecione "Blueprint"
   - Conecte seu repositório Git

3. **Configurar Blueprint**:
   - O Render detectará automaticamente o arquivo `render.yaml`
   - Selecione o arquivo de configuração desejado
   - Clique em "Apply"

### Passo 3: Configuração Automática

O Render criará automaticamente:

#### 🗄️ PostgreSQL Database
- **Nome**: `portal-services-db`
- **Plano**: Starter (gratuito)
- **Configuração**: Automática
- **Inicialização**: Scripts SQL executados

#### 🌐 Web Service API
- **Nome**: `portal-services-api`
- **Runtime**: Node.js
- **Plano**: Starter (gratuito)
- **URL**: `https://portal-services-api.onrender.com`
- **Build**: Automático
- **Deploy**: Automático

## 📊 Serviços Criados

### Database Service
```yaml
- type: pserv
  name: portal-services-db
  plan: starter
  envVars:
    - key: POSTGRES_USER
      value: admin
    - key: POSTGRES_PASSWORD
      generateValue: true
    - key: POSTGRES_DB
      value: portalservicesdb
```

### Web Service
```yaml
- type: web
  name: portal-services-api
  runtime: node
  plan: starter
  buildCommand: cd appserver && npm install && npm run build && npm run init-db
  startCommand: cd appserver && npm start
```

## 🔧 Variáveis de Ambiente

### Configuradas Automaticamente
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Conexão com banco
- `JWT_SECRET`, `SESSION_SECRET` - Geradas automaticamente
- `NODE_ENV=production`
- `PORT=10000`

### URLs da API
- `API_URL=https://portal-services-api.onrender.com`
- `API_BASE_URL=https://portal-services-api.onrender.com`
- `FRONTEND_URL=https://portal-services-api.onrender.com`

## 🧪 Testando o Deploy

### 1. Health Check
```bash
curl https://portal-services-api.onrender.com/health
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

### Dashboard do Render
- **Services**: Lista de todos os serviços
- **Logs**: Logs em tempo real
- **Metrics**: Métricas de performance
- **Health**: Status de saúde dos serviços

### Health Checks
- **API**: `https://portal-services-api.onrender.com/health`
- **Database**: Monitorado automaticamente
- **Build**: Status de build e deploy

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

## 🚨 Troubleshooting

### Problemas Comuns

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

### Logs Importantes
```bash
# Verificar se o banco foi inicializado
# Procurar por: "Banco de dados inicializado com sucesso!"

# Verificar se a API está rodando
# Procurar por: "Portal Services Server rodando em"
```

## 📊 Configurações Avançadas

### Domínios Customizados
```yaml
customDomains:
  - domain: api.portalservices.com
    service: portal-services-api
```

### Cron Jobs
```yaml
cronJobs:
  - name: portal-services-cleanup
    schedule: "0 2 * * *"  # Diariamente às 2h
    command: cd appserver && node scripts/cleanup.js
```

### Environment Groups
```yaml
envVarGroups:
  - name: portal-services-shared
    envVars:
      - key: COMPANY_NAME
        value: Portal Services
```

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

## 📱 Integração Frontend

### URL da API
```javascript
const API_URL = 'https://portal-services-api.onrender.com';
```

### Verificar Informações
```javascript
const apiInfo = await fetch(`${API_URL}/api/info`).then(r => r.json());
console.log('API URL:', apiInfo.data.apiUrl);
```

### Exemplo de Uso
```javascript
// Listar categorias
const categories = await fetch(`${API_URL}/api/categories`).then(r => r.json());

// Criar categoria
const newCategory = await fetch(`${API_URL}/api/categories`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nova Categoria',
    description: 'Descrição da categoria',
    color: '#FF6B6B'
  })
}).then(r => r.json());
```

## 🎯 Próximos Passos

1. **Deploy Inicial**: Use o Blueprint para criar os serviços
2. **Configurar Domínio**: Adicionar domínio customizado
3. **Monitoramento**: Configurar alertas
4. **Backup**: Configurar backup automático
5. **CI/CD**: Configurar pipeline de deploy

## 📞 Suporte

### Recursos
- [Documentação Render](https://render.com/docs)
- [Blueprint Documentation](https://render.com/docs/blueprint-spec)
- [Status Page](https://status.render.com)

### Contato
- Email: support@render.com
- Chat: Dashboard do Render

---

**✨ O Blueprint está configurado para deploy automático! Apenas conecte seu repositório no Render e tudo será criado automaticamente.**
