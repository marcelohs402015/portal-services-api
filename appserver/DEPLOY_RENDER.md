# Deploy no Render.com - Portal Services API

## 📋 Pré-requisitos

1. **Conta no Render.com** - [Criar conta gratuita](https://render.com)
2. **Repositório no GitHub** - Código deve estar em um repositório público ou privado
3. **Node.js 18+** - Especificado no `package.json`

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub com os seguintes arquivos:
- ✅ `render.yaml` (configurado)
- ✅ `package.json` (com scripts de build e start)
- ✅ `tsconfig.json` (configurado)
- ✅ `env.example` (variáveis de ambiente)

### 2. Conectar ao Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `portal-services`

### 3. Configuração do Web Service

O Render irá detectar automaticamente o arquivo `render.yaml` e configurar:
- ✅ **Web Service** (plano gratuito)
- ✅ **Build e Start commands**
- ✅ **Variáveis de ambiente básicas**

### 4. Configurar Database Separadamente

1. No Dashboard do Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `portalservices-db`
   - **Database**: `portalservicesdb`
   - **User**: `admin`
   - **Plan**: Free
3. Após criar, copie a **Connection String** (DATABASE_URL)

### 5. Configurar Variáveis de Ambiente

No Dashboard do Web Service, vá em **"Environment"** e adicione:

```bash
# Variáveis do Sistema (já configuradas pelo render.yaml)
NODE_ENV=production
APP_VERSION=2.0.0
FEATURES=email-management,service-management,quotations
DB_SSL=true

# Variável do Banco (configure manualmente)
DATABASE_URL=postgresql://admin:senha@host:port/portalservicesdb
```

**Importante**: Substitua a `DATABASE_URL` pela connection string real do seu banco PostgreSQL criado no passo 4.

### 6. Processo de Deploy

O Render executará automaticamente:

```bash
# Build
npm ci                    # Instala dependências
npm run build            # Compila TypeScript

# Start
node dist/server.js      # Inicia o servidor
```

### 7. Verificação do Deploy

Após o deploy, verifique:

1. **Health Check**: `https://seu-app.onrender.com/health`
2. **API Base**: `https://seu-app.onrender.com/api`
3. **Categorias**: `https://seu-app.onrender.com/api/categories`

## 🔧 Configurações Importantes

### Database PostgreSQL
- **Plano**: Free (1GB storage)
- **Backup**: Automático
- **SSL**: Habilitado por padrão
- **Connection Pooling**: Disponível

### Web Service
- **Plano**: Free (512MB RAM)
- **Sleep**: Após 15min de inatividade
- **Wake up**: ~30 segundos
- **Custom Domain**: Disponível

### Build & Deploy
- **Node.js**: 18.x (especificado no package.json)
- **Build Timeout**: 20 minutos
- **Auto Deploy**: A cada push na branch main

## 🐛 Troubleshooting

### Problemas Comuns

1. **Build Falha**
   ```bash
   # Verificar logs no Render Dashboard
   # Verificar se todas as dependências estão no package.json
   ```

2. **Database Connection Error**
   ```bash
   # Verificar se DB_SSL=true está configurado
   # Verificar se DATABASE_URL está sendo usada
   ```

3. **App não inicia**
   ```bash
   # Verificar se dist/server.js existe após build
   # Verificar logs de startup
   ```

### Logs e Monitoramento

- **Logs**: Disponíveis no Dashboard do Render
- **Metrics**: CPU, Memory, Response Time
- **Health Checks**: Automático em `/health`

## 📊 URLs Importantes

Após o deploy, você terá:

- **API Base**: `https://portal-services-api.onrender.com`
- **Health Check**: `https://portal-services-api.onrender.com/health`
- **API Endpoints**: `https://portal-services-api.onrender.com/api/*`
- **Database**: Gerenciado pelo Render (não acessível diretamente)

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para o GitHub
2. O Render detecta automaticamente e faz redeploy
3. O processo leva ~2-3 minutos

## 💡 Dicas de Performance

1. **Free Tier Limitations**:
   - App "dorme" após 15min de inatividade
   - Wake up leva ~30 segundos
   - 512MB RAM limit

2. **Otimizações**:
   - Use cache quando possível
   - Otimize queries de banco
   - Minimize dependências

3. **Upgrade para Paid**:
   - Sem sleep mode
   - Mais RAM e CPU
   - Custom domains
   - SSL certificates

## 📞 Suporte

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Status Page**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)
