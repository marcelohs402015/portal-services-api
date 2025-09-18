# 🐳 Deploy no Render com PostgreSQL em Docker

## 🎯 Solução: PostgreSQL em Docker no Render

Esta solução mantém sua configuração atual do Docker Compose, mas adapta para funcionar no Render com PostgreSQL rodando em Docker dentro do mesmo container da API.

## 📋 O que esta solução faz:

- ✅ **PostgreSQL em Docker**: Mantém sua configuração atual
- ✅ **API + Banco no mesmo container**: Como no docker-compose
- ✅ **Dados persistentes**: Usando Render Disks
- ✅ **Inicialização automática**: Banco configurado automaticamente
- ✅ **Health checks**: Monitoramento integrado

## 🚀 Deploy em 3 Passos

### Passo 1: Preparar o Repositório

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "feat: deploy with PostgreSQL in Docker on Render"

# 2. Fazer push para GitHub
git push origin main
```

### Passo 2: Deploy no Render

**Opção A: Deploy Automatizado (Recomendado)**
```bash
# Execute o script automatizado
npm run deploy:postgres
```

**Opção B: Deploy Manual**
1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub
4. O Render detectará automaticamente o `render.yaml`
5. Clique em **"Apply"**

### Passo 3: Aguardar Deploy

O Render criará automaticamente:
- 🐳 **Web Service** com PostgreSQL + API em Docker
- 💾 **Disco persistente** para dados do banco
- 🔧 **Todas as variáveis de ambiente**
- 🔗 **Conexão local** entre API e PostgreSQL

## 🔧 Configuração Técnica

### 1. Dockerfile.postgres
```dockerfile
FROM node:18-alpine

# Instalar PostgreSQL
RUN apk add --no-cache postgresql postgresql-contrib

# Configurar PostgreSQL
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=portalservicesdb

# Build da aplicação Node.js
# ... (código da aplicação)

# Script de inicialização
CMD ["/start.sh"]
```

### 2. render.yaml
```yaml
services:
  - type: web
    name: portal-services-api
    runtime: docker
    dockerfilePath: ./Dockerfile.postgres
    
    # Disco persistente para PostgreSQL
    disk:
      name: postgres-data
      mountPath: /var/lib/postgresql/data
      sizeGB: 1
    
    envVars:
      - key: DB_HOST
        value: localhost
      - key: DB_PORT
        value: "5432"
      - key: DB_NAME
        value: portalservicesdb
      - key: DB_USER
        value: admin
      - key: DB_PASSWORD
        value: admin
```

### 3. Script de Inicialização
```bash
#!/bin/sh
# start-with-postgres.sh

# Inicializar PostgreSQL
initdb -D /var/lib/postgresql/data
postgres -D /var/lib/postgresql/data &

# Aguardar PostgreSQL estar pronto
until pg_isready -h localhost -p 5432; do
    sleep 2
done

# Executar scripts de inicialização
for f in /docker-entrypoint-initdb.d/*.sql; do
    psql -d portalservicesdb -f "$f"
done

# Iniciar aplicação Node.js
exec node dist/server.js
```

## 🔍 Monitoramento do Deploy

### 1. Logs de Build
- Acesse o painel do Render
- Vá em **"portal-services-api"** → **"Logs"**
- Monitore o progresso do build

### 2. Logs de Runtime
- Verifique se PostgreSQL iniciou
- Procure por: `✅ PostgreSQL está pronto!`
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

### Problema: PostgreSQL não inicia
**Causa**: Erro na inicialização do banco
**Solução**:
1. Verificar logs de runtime
2. Confirmar se o disco persistente está montado
3. Verificar permissões do diretório `/var/lib/postgresql/data`

### Problema: Build Failed
**Causa**: Erro no Dockerfile ou dependências
**Solução**:
1. Verificar logs de build no Render
2. Confirmar se `Dockerfile.postgres` existe
3. Verificar se todas as dependências estão instaladas

### Problema: Health Check Failed
**Causa**: Aplicação não está respondendo
**Solução**:
1. Verificar logs de runtime
2. Confirmar se PostgreSQL está rodando
3. Verificar se a API iniciou corretamente

### Problema: Dados não persistem
**Causa**: Disco persistente não configurado
**Solução**:
1. Verificar se o `disk` está configurado no `render.yaml`
2. Confirmar se o `mountPath` está correto
3. Verificar se o `PGDATA` está apontando para o disco

## 📊 Estrutura Final

Após o deploy bem-sucedido, você terá:

```
Render Dashboard:
└── portal-services-api (Web Service)
    ├── URL: https://portal-services-api.onrender.com
    ├── Health: https://portal-services-api.onrender.com/health
    ├── API: https://portal-services-api.onrender.com/api
    └── PostgreSQL: localhost:5432 (dentro do container)
        ├── Database: portalservicesdb
        ├── User: admin
        ├── Password: admin
        └── Data: /var/lib/postgresql/data (persistente)
```

## 🔄 Atualizações

### Deploy de Novas Versões
1. Faça as mudanças no código
2. Commit e push para GitHub
3. O Render detectará automaticamente as mudanças
4. Um novo deploy será iniciado
5. **Dados do PostgreSQL serão preservados** (disco persistente)

### Rollback
1. Acesse o painel do Render
2. Vá em **"portal-services-api"** → **"Deploys"**
3. Selecione uma versão anterior
4. Clique em **"Rollback"**

## 🎉 Vantagens desta Solução

- ✅ **Mantém sua configuração atual**: PostgreSQL em Docker
- ✅ **Dados persistentes**: Render Disks preservam dados
- ✅ **Inicialização automática**: Banco configurado automaticamente
- ✅ **Health checks**: Monitoramento integrado
- ✅ **Escalabilidade**: Container único com tudo integrado
- ✅ **Compatibilidade**: Funciona com sua configuração atual

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Render
2. Teste localmente com `docker-compose up`
3. Consulte a documentação do Render
4. Verifique se o `render.yaml` está correto

---

**🎯 Resultado**: Sua API com PostgreSQL em Docker funcionando na nuvem!
