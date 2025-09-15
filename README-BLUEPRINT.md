# 🚀 Portal Services API - Render Blueprint

## 📋 Visão Geral

Este projeto está configurado para deploy automático no Render usando Blueprint. O Blueprint permite criar múltiplos serviços (banco de dados + API) com uma única configuração.

## 🎯 Arquivos de Configuração

### 1. `render.yaml` - Configuração Principal
- Configuração completa com banco de dados e API
- Ideal para produção
- URL: `https://portal-services-api.onrender.com`

### 2. `render-simple.yaml` - Configuração Simplificada
- Apenas banco de dados e API essenciais
- Ideal para desenvolvimento e testes
- Deploy mais rápido

### 3. `render-blueprint.yaml` - Configuração Avançada
- Configuração completa com todos os recursos
- Inclui documentação, cron jobs, domínios customizados
- Ideal para produção enterprise

### 4. `render-environments.yaml` - Múltiplos Ambientes
- Configuração para dev, staging e produção
- Ambientes separados
- Ideal para equipes

## 🛠️ Como Usar

### Opção 1: Script Automatizado (Recomendado)

```bash
# Validar configuração
npm run blueprint:validate

# Preparar para deploy
npm run blueprint:prepare

# Deploy completo
npm run blueprint:deploy
```

### Opção 2: Manual

1. **Escolher arquivo de configuração**:
   ```bash
   # Para configuração simples
   cp render-simple.yaml render.yaml
   
   # Para configuração completa
   cp render-blueprint.yaml render.yaml
   
   # Para múltiplos ambientes
   cp render-environments.yaml render.yaml
   ```

2. **Validar configuração**:
   ```bash
   npm run validate:blueprint
   ```

3. **Commit e push**:
   ```bash
   git add .
   git commit -m "Add Blueprint configuration"
   git push origin main
   ```

4. **Deploy no Render**:
   - Acesse [render.com](https://render.com)
   - Clique em "New +" → "Blueprint"
   - Conecte seu repositório Git
   - Clique em "Apply"

## 📊 Serviços Criados

### 🗄️ PostgreSQL Database
- **Nome**: `portal-services-db`
- **Plano**: Starter (gratuito)
- **Configuração**: Automática
- **Inicialização**: Scripts SQL executados

### 🌐 Web Service API
- **Nome**: `portal-services-api`
- **Runtime**: Node.js
- **Plano**: Starter (gratuito)
- **URL**: `https://portal-services-api.onrender.com`
- **Build**: Automático
- **Deploy**: Automático

## 🔧 Configuração Automática

### Variáveis de Ambiente
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

**✨ O Blueprint está configurado para deploy automático! Use os scripts fornecidos para facilitar o processo.**
