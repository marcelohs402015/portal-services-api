# 🚀 Deploy Automatizado no Render com render.yaml

## 🎯 Solução Completa

Este deploy usa o **render.yaml** para subir automaticamente:
- ✅ **PostgreSQL gerenciado** pelo Render
- ✅ **API Node.js** com Docker
- ✅ **Todas as variáveis de ambiente** configuradas automaticamente
- ✅ **Inicialização automática** do banco de dados

## 📋 Pré-requisitos

1. **Conta no Render**: [render.com](https://render.com)
2. **Repositório no GitHub**: Com o código da aplicação
3. **render.yaml**: Já configurado no projeto

## 🚀 Deploy em 3 Passos

### Passo 1: Preparar o Repositório

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "feat: prepare for Render deploy with render.yaml"

# 2. Fazer push para GitHub
git push origin main
```

### Passo 2: Deploy no Render

**Opção A: Deploy Automatizado (Recomendado)**
```bash
# Execute o script automatizado
./deploy-render-yaml.sh
```

**Opção B: Deploy Manual**
1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub
4. O Render detectará automaticamente o `render.yaml`
5. Clique em **"Apply"**

### Passo 3: Aguardar Deploy

O Render criará automaticamente:
- 🗄️ **PostgreSQL Database** (`portal-services-db`)
- 🚀 **Web Service** (`portal-services-api`)
- 🔧 **Todas as variáveis de ambiente**
- 🔗 **Conexão automática** entre API e banco

## 🔧 O que o render.yaml Faz

### 1. Cria PostgreSQL Gerenciado
```yaml
- type: pserv
  name: portal-services-db
  plan: free
  databaseName: portalservicesdb
  user: portalservicesdb_user
  region: oregon
```

### 2. Configura API com Docker
```yaml
- type: web
  name: portal-services-api
  runtime: docker
  dockerfilePath: ./Dockerfile.render
  healthCheckPath: /health
```

### 3. Conecta API ao Banco Automaticamente
```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: portal-services-db
      property: connectionString
```

### 4. Configura Todas as Variáveis
- `NODE_ENV=production`
- `PORT=10000`
- `DB_SSL=true`
- `API_KEYS_ENABLED=true`
- E muitas outras...

## 🔍 Monitoramento do Deploy

### 1. Logs de Build
- Acesse o painel do Render
- Vá em **"portal-services-api"** → **"Logs"**
- Monitore o progresso do build

### 2. Logs de Runtime
- Verifique se a aplicação iniciou
- Procure por: `✅ Banco inicializado com sucesso!`
- Procure por: `🚀 Portal Services Server iniciado`

### 3. Health Check
```bash
# Teste a aplicação
curl https://portal-services-api.onrender.com/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "connected": true,
      "latency": 45
    }
  }
}
```

## 🛠️ Troubleshooting

### Problema: Build Failed
**Causa**: Erro no Dockerfile ou dependências
**Solução**:
1. Verificar logs de build no Render
2. Confirmar se `Dockerfile.render` existe
3. Verificar se todas as dependências estão no `package.json`

### Problema: Database Connection Failed
**Causa**: Banco não foi criado ou variáveis incorretas
**Solução**:
1. Verificar se o banco `portal-services-db` foi criado
2. Verificar logs da aplicação para erros de conexão
3. Confirmar se `DATABASE_URL` está sendo passada corretamente

### Problema: Health Check Failed
**Causa**: Aplicação não está respondendo
**Solução**:
1. Verificar logs de runtime
2. Confirmar se a porta 10000 está sendo usada
3. Verificar se o banco foi inicializado

### Problema: Auto-init Failed
**Causa**: Erro na inicialização do banco
**Solução**:
1. Verificar logs da aplicação
2. Confirmar se os scripts SQL existem
3. Verificar permissões do banco

## 📊 Estrutura Final

Após o deploy bem-sucedido, você terá:

```
Render Dashboard:
├── portal-services-db (PostgreSQL)
│   ├── Host: dpg-xxxxx-a.oregon-postgres.render.com
│   ├── Database: portalservicesdb_xxxx
│   └── User: portalservicesdb_user
│
└── portal-services-api (Web Service)
    ├── URL: https://portal-services-api.onrender.com
    ├── Health: https://portal-services-api.onrender.com/health
    └── API: https://portal-services-api.onrender.com/api
```

## 🔄 Atualizações

### Deploy de Novas Versões
1. Faça as mudanças no código
2. Commit e push para GitHub
3. O Render detectará automaticamente as mudanças
4. Um novo deploy será iniciado

### Rollback
1. Acesse o painel do Render
2. Vá em **"portal-services-api"** → **"Deploys"**
3. Selecione uma versão anterior
4. Clique em **"Rollback"**

## 🎉 Vantagens desta Solução

- ✅ **Zero Configuração Manual**: Tudo automático via render.yaml
- ✅ **PostgreSQL Gerenciado**: Sem problemas de conexão
- ✅ **SSL Automático**: Conexões seguras
- ✅ **Auto-inicialização**: Banco configurado automaticamente
- ✅ **Health Checks**: Monitoramento integrado
- ✅ **Escalabilidade**: Banco e API escalam independentemente
- ✅ **Backups Automáticos**: Render gerencia backups do banco

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Render
2. Teste localmente com as mesmas configurações
3. Consulte a documentação do Render
4. Verifique se o `render.yaml` está correto

---

**🎯 Resultado**: Sua API estará funcionando na nuvem sem erros de conexão!
