# Deploy no Render - Nova Estratégia com PostgreSQL Gerenciado

## 🎯 Estratégia

Esta nova abordagem resolve o problema de "connection refused" usando:
- **PostgreSQL Gerenciado**: Banco criado diretamente no Render
- **Aplicação via Dockerfile**: Deploy da API usando container
- **Conexão SSL**: Configuração segura para produção

## 📋 Pré-requisitos

1. Conta no Render
2. Repositório no GitHub
3. Dockerfile otimizado (já criado)

## 🗄️ Passo 1: Criar Banco PostgreSQL no Render

### 1.1 Acessar o Painel do Render
- Faça login em [render.com](https://render.com)
- Clique em **"New +"** → **"PostgreSQL"**

### 1.2 Configurar o Banco
```
Name: portal-services-db
Database: portalservicesdb
User: portalservicesdb_user
Region: Oregon (US West)
PostgreSQL Version: 15
```

### 1.3 Salvar Credenciais
Após a criação, o Render fornecerá:
- **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `portalservicesdb_xxxx`
- **User**: `portalservicesdb_user`
- **Password**: `[senha gerada]`
- **External Database URL**: `postgresql://user:password@host:port/database`

⚠️ **IMPORTANTE**: Salve essas credenciais em local seguro!

## 🚀 Passo 2: Deploy da Aplicação

### 2.1 Criar Web Service
- Clique em **"New +"** → **"Web Service"**
- Conecte seu repositório GitHub
- Selecione o repositório `portal-services-api`

### 2.2 Configurar o Build
```
Name: portal-services-api
Environment: Docker
Dockerfile Path: Dockerfile.render
Docker Context: /
```

### 2.3 Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
APP_VERSION=2.0.0

# Database Configuration (usar DATABASE_URL do Render)
DATABASE_URL=postgresql://portalservicesdb_user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/portalservicesdb_xxxx

# Ou variáveis individuais (alternativa)
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=portalservicesdb_xxxx
DB_USER=portalservicesdb_user
DB_PASSWORD=your_password_here
DB_SSL=true

# Client Configuration
CLIENT_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info

# API Keys
API_KEYS_ENABLED=true
```

### 2.4 Configurar Health Check
```
Health Check Path: /health
```

## 🔧 Passo 3: Inicialização do Banco

### 3.1 Executar Script de Inicialização

Após o deploy, execute o script de inicialização:

```bash
# Via Render Shell (se disponível)
node appserver/scripts/init-production-db.js

# Ou via API endpoint (se implementado)
curl -X POST https://your-app.onrender.com/api/admin/init-db
```

### 3.2 Verificar Estrutura

Acesse o banco via Render Dashboard e verifique se as tabelas foram criadas:
- `emails`
- `services` 
- `quotations`
- `api_keys`

## 🔍 Passo 4: Verificação e Testes

### 4.1 Health Check
```bash
curl https://your-app.onrender.com/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "database": {
      "connected": true,
      "latency": 45
    },
    "version": "2.0.0"
  }
}
```

### 4.2 Teste de Conexão
```bash
curl https://your-app.onrender.com/api/services
```

### 4.3 Logs de Deploy
Verifique os logs no painel do Render para confirmar:
- ✅ Build bem-sucedido
- ✅ Conexão com banco estabelecida
- ✅ Aplicação iniciada na porta 3001

## 🛠️ Troubleshooting

### Problema: Connection Refused
**Causa**: Configuração incorreta de conexão
**Solução**:
1. Verificar se `DATABASE_URL` está correta
2. Confirmar se `DB_SSL=true` está definido
3. Verificar se o banco está ativo no Render

### Problema: Build Failed
**Causa**: Erro no Dockerfile ou dependências
**Solução**:
1. Verificar logs de build
2. Confirmar se `Dockerfile.render` existe
3. Verificar se todas as dependências estão no `package.json`

### Problema: Health Check Failed
**Causa**: Aplicação não está respondendo
**Solução**:
1. Verificar logs da aplicação
2. Confirmar se a porta 3001 está exposta
3. Verificar se o banco está acessível

## 📊 Monitoramento

### Logs Importantes
- **Build logs**: Verificar se o build foi bem-sucedido
- **Runtime logs**: Monitorar erros de aplicação
- **Database logs**: Verificar conexões com banco

### Métricas a Observar
- Tempo de resposta da API
- Latência do banco de dados
- Uso de memória e CPU
- Taxa de erro das requisições

## 🔄 Atualizações

### Deploy de Novas Versões
1. Faça push para a branch principal
2. O Render detectará automaticamente as mudanças
3. Um novo build será iniciado
4. A aplicação será atualizada sem downtime

### Rollback
1. Acesse o painel do Render
2. Vá em **"Deploys"**
3. Selecione uma versão anterior
4. Clique em **"Rollback"**

## 🎉 Vantagens desta Estratégia

1. **Confiabilidade**: PostgreSQL gerenciado pelo Render
2. **Segurança**: Conexões SSL automáticas
3. **Escalabilidade**: Banco e aplicação escalam independentemente
4. **Manutenção**: Render gerencia backups e updates do banco
5. **Monitoramento**: Logs e métricas integrados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Render
2. Consulte a documentação do Render
3. Teste a conexão localmente com as mesmas credenciais
4. Verifique se todas as variáveis de ambiente estão corretas

---

**Próximos Passos**: Após o deploy bem-sucedido, configure o frontend para apontar para a nova URL da API.
