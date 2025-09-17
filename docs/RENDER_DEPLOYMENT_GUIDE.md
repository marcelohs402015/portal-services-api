# 🚀 Guia de Deploy no Render.com

## Visão Geral

Este guia mostra como fazer deploy da API Portal Services no Render.com com PostgreSQL.

## ✅ Pré-requisitos

1. Conta no [Render.com](https://render.com)
2. Repositório no GitHub, GitLab ou Bitbucket
3. Código commitado e pushado para o repositório

## 📋 Passo a Passo

### 1️⃣ Preparar o Repositório

```bash
# Commit todas as mudanças
git add .
git commit -m "feat: configuração para deploy no Render"
git push origin main
```

### 2️⃣ Deploy Automático com Blueprint (Recomendado)

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub/GitLab
4. Selecione o repositório `portal-services-api`
5. O Render detectará automaticamente o arquivo `render.yaml`
6. Clique em **"Apply"**
7. Aguarde a criação dos serviços

### 3️⃣ Deploy Manual (Alternativa)

#### Criar o Banco de Dados PostgreSQL

1. No Dashboard, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `portal-services-db`
   - **Database**: `portalservicesdb`
   - **User**: `portaladmin`
   - **Region**: Oregon (ou mais próxima)
   - **Plan**: Free (ou superior)
3. Clique em **"Create Database"**
4. Copie a **Internal Database URL** (começará com `postgres://`)

#### Criar o Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório
3. Configure:
   - **Name**: `portal-services-api`
   - **Region**: Mesma do banco (Oregon)
   - **Branch**: `main`
   - **Root Directory**: deixe vazio
   - **Runtime**: `Node`
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `cd appserver && node dist/server.js`
   - **Plan**: Free (ou superior)

4. Em **Environment Variables**, adicione:
   ```
   DATABASE_URL = [Cole a Internal Database URL aqui]
   NODE_ENV = production
   JWT_SECRET = [Clique em "Generate" para criar]
   JWT_REFRESH_SECRET = [Clique em "Generate" para criar]
   ```

5. Clique em **"Create Web Service"**

### 4️⃣ Configurar o Banco de Dados

Após o deploy, você precisa inicializar o banco:

1. No dashboard do banco PostgreSQL, vá em **"Connect"** → **"PSQL Command"**
2. Copie o comando e execute no terminal local
3. Execute o script de inicialização:

```sql
-- Cole o conteúdo do arquivo appserver/database/init.sql
```

Ou use o comando direto:

```bash
psql [DATABASE_URL] < appserver/database/init.sql
```

### 5️⃣ Verificar o Deploy

1. Acesse a URL do seu serviço (algo como `https://portal-services-api.onrender.com`)
2. Teste o health check: `https://portal-services-api.onrender.com/health`
3. Você deve ver:

```json
{
  "success": true,
  "message": "Portal Services API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "environment": "production",
  "database": {
    "connected": true,
    "latency": 5
  }
}
```

## 🔐 Configurar Autenticação

### Testar Login

```bash
curl -X POST https://portal-services-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@portalservices.com",
    "password": "Admin@123456"
  }'
```

### Criar Usuário Admin Personalizado

```bash
curl -X POST https://portal-services-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@empresa.com",
    "password": "SuaSenhaForte@123",
    "name": "Seu Nome",
    "role": "admin"
  }'
```

## 🔧 Variáveis de Ambiente Importantes

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | URL de conexão PostgreSQL | `postgres://user:pass@host/db` |
| NODE_ENV | Ambiente de execução | `production` |
| JWT_SECRET | Secret para tokens JWT | String aleatória forte |
| JWT_REFRESH_SECRET | Secret para refresh tokens | String aleatória forte |

### Opcionais

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta do servidor | 10000 |
| CORS_ORIGIN | Origens permitidas | * |
| LOG_LEVEL | Nível de log | info |
| DB_POOL_MAX | Máximo de conexões | 20 |
| JWT_ACCESS_EXPIRY | Expiração do token | 15m |
| JWT_REFRESH_EXPIRY | Expiração do refresh | 7d |

## 📊 Monitoramento

### Logs

1. No dashboard do serviço, clique em **"Logs"**
2. Você verá logs em tempo real
3. Use os filtros para buscar erros específicos

### Métricas

1. Vá em **"Metrics"** no dashboard
2. Monitore:
   - CPU Usage
   - Memory Usage
   - Response Time
   - Request Rate

### Health Checks

O Render faz health checks automáticos em `/health`. Se falhar 3 vezes consecutivas, o serviço será reiniciado.

## 🔄 Deploy Contínuo

### Configurar Auto-Deploy

1. No dashboard do serviço, vá em **"Settings"**
2. Em **"Build & Deploy"**, ative **"Auto-Deploy"**
3. Selecione a branch (`main`)
4. Agora todo push para `main` fará deploy automático

### Deploy Manual

1. No dashboard, clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"** se necessário
3. Clique em **"Deploy"**

## 🚨 Troubleshooting

### Erro: "Database connection failed"

**Causa**: DATABASE_URL não configurada ou incorreta

**Solução**:
1. Verifique se a variável DATABASE_URL está configurada
2. Use a Internal Database URL (não a External)
3. Verifique se o banco está na mesma região

### Erro: "Build failed"

**Causa**: Dependências não instaladas ou TypeScript com erros

**Solução**:
1. Verifique os logs de build
2. Teste o build localmente: `cd appserver && npm run build`
3. Certifique-se que o arquivo `render-build.sh` tem permissão de execução

### Erro: "Port 10000 is not available"

**Causa**: Porta incorreta configurada

**Solução**:
1. Use a variável PORT fornecida pelo Render
2. Não hardcode a porta no código

### Serviço fica "Suspended"

**Causa**: Plano gratuito tem limites

**Solução**:
1. O plano free suspende após 15 minutos de inatividade
2. Primeira requisição demora ~30 segundos para acordar
3. Considere upgrade para plano Starter ($7/mês) para serviço sempre ativo

## 📈 Otimizações para Produção

### 1. Configurar Domínio Personalizado

1. Em **"Settings"** → **"Custom Domains"**
2. Adicione seu domínio: `api.suaempresa.com`
3. Configure o DNS conforme instruções

### 2. Configurar SSL

- SSL é automático e gratuito no Render
- Certificados Let's Encrypt renovados automaticamente

### 3. Configurar CORS

Atualize a variável `CORS_ORIGIN` para permitir apenas seu frontend:

```
CORS_ORIGIN = https://app.suaempresa.com
```

### 4. Backup do Banco

1. No dashboard do PostgreSQL
2. Clique em **"Backups"**
3. Configure backups automáticos (planos pagos)

### 5. Escalonamento

Para alta disponibilidade:
1. Upgrade para plano Standard ou Pro
2. Configure múltiplas instâncias
3. Use load balancing automático

## 🎯 Checklist de Produção

- [ ] DATABASE_URL configurada
- [ ] JWT secrets fortes e únicos
- [ ] CORS configurado para domínio específico
- [ ] Health check funcionando
- [ ] Logs configurados em nível apropriado
- [ ] Auto-deploy configurado
- [ ] Backup do banco configurado
- [ ] Domínio personalizado (opcional)
- [ ] Monitoramento configurado
- [ ] Rate limiting ativo

## 📚 Links Úteis

- [Render Documentation](https://render.com/docs)
- [Node on Render](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

## 💡 Dicas

1. **Use Internal Database URL**: Mais rápido e sem custos de banda
2. **Configure Alerts**: Receba notificações de problemas
3. **Use Secrets**: Nunca commite secrets no código
4. **Monitore Custos**: Fique atento aos limites do plano free
5. **Teste Localmente**: Sempre teste com `npm run build` antes de fazer push

## 🆘 Suporte

- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
- Email: support@render.com

---

**Pronto!** Sua API está rodando no Render.com com PostgreSQL e autenticação JWT! 🎉
