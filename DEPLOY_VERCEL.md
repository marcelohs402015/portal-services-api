# 🚀 Deploy no Vercel - Portal Services

Guia completo para deploy da aplicação **Portal Services** (Node.js API + React Frontend + PostgreSQL) no Vercel.

## 📋 Pré-requisitos

1. **Conta no Vercel** - [Criar conta gratuita](https://vercel.com)
2. **Repositório no GitHub** - Código deve estar em um repositório público ou privado
3. **Banco PostgreSQL externo** - Neon, Supabase, Railway ou similar
4. **Node.js 18+** - Especificado no `package.json`

## 🏗️ Arquitetura do Deploy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Externo)     │
│   vercel.app    │    │   vercel.app    │    │   neon/supabase │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Passo 1: Configurar Banco de Dados

### Opção A: Neon (Recomendado)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Clique em **"Create Project"**
3. Configure:
   - **Name**: `portal-services-db`
   - **Database**: `portalservicesdb`
   - **Region**: Escolha mais próxima
4. Após criar, copie a **Connection String**
5. Exemplo: `postgresql://user:pass@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `portal-services-db`
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha mais próxima
4. Após criar, vá em **Settings → Database**
5. Copie a **Connection String**

### Opção C: Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta
2. Conecte sua conta GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from Template"**
5. Escolha **"PostgreSQL"**
6. Após deploy, copie a **Connection String**

## 🚀 Passo 2: Deploy da API (Backend)

### 2.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"New Project"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `portal-services`

### 2.2 Configurar API

1. **Root Directory**: Selecione `appserver`
2. **Framework Preset**: `Other`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm ci`

### 2.3 Variáveis de Ambiente

Adicione as seguintes variáveis no Vercel:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
DB_SSL=true

# API Configuration
NODE_ENV=production
PORT=3000
APP_VERSION=2.0.0
FEATURES=email-management,service-management,quotations

# CORS (será atualizado após deploy do frontend)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
CLIENT_URL=https://your-frontend-domain.vercel.app

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h

# Email (se usando)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER_EMAIL=your-email@gmail.com
```

### 2.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Anote a URL da API: `https://your-api-name.vercel.app`

## 🎨 Passo 3: Deploy do Frontend (React)

### 3.1 Criar Novo Projeto

1. No Dashboard do Vercel, clique em **"New Project"**
2. Selecione o mesmo repositório `portal-services`
3. Configure:
   - **Root Directory**: `appclient`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm ci`

### 3.2 Variáveis de Ambiente

Adicione as seguintes variáveis:

```bash
# API URL (use a URL da API criada no passo 2)
REACT_APP_API_URL=https://your-api-name.vercel.app
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

### 3.3 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Anote a URL do Frontend: `https://your-frontend-name.vercel.app`

## 🔄 Passo 4: Atualizar CORS

Após ter ambas as URLs:

1. Vá no projeto da **API** no Vercel
2. Acesse **Settings → Environment Variables**
3. Atualize:
   ```bash
   CORS_ORIGIN=https://your-frontend-name.vercel.app
   CLIENT_URL=https://your-frontend-name.vercel.app
   ```
4. Clique em **"Redeploy"**

## 🗃️ Passo 5: Configurar Banco de Dados

### 5.1 Executar Migrations

Você pode executar as migrations de várias formas:

#### Opção A: Via API (Recomendado)
```bash
# Fazer uma requisição para inicializar o banco
curl -X GET https://your-api-name.vercel.app/api/health
```

#### Opção B: Via Script Local
```bash
# No seu ambiente local, com a DATABASE_URL do Vercel
DATABASE_URL="postgresql://..." npm run db:setup
```

#### Opção C: Via pgAdmin ou DBeaver
1. Conecte ao banco usando a connection string
2. Execute os scripts SQL da pasta `database/`

### 5.2 Verificar Conexão

Teste se a API está conectada ao banco:

```bash
# Health check
curl https://your-api-name.vercel.app/health

# Teste de categorias
curl https://your-api-name.vercel.app/api/categories
```

## 🔧 Configurações Avançadas

### Custom Domains

1. No projeto do Vercel, vá em **Settings → Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### Environment Variables por Ambiente

```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://prod-url

# Preview (para branches)
NODE_ENV=preview
DATABASE_URL=postgresql://preview-url

# Development (local)
NODE_ENV=development
DATABASE_URL=postgresql://dev-url
```

### Monorepo Configuration

Se quiser deploy em um único projeto:

1. Use o `vercel.json` na raiz do projeto
2. Configure builds separados para frontend e backend
3. Use routes para direcionar requisições

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. **Build Falha - TypeScript**
```bash
# Verificar se tsconfig.json está correto
# Verificar se todas as dependências estão no package.json
```

#### 2. **Database Connection Error**
```bash
# Verificar se DATABASE_URL está correta
# Verificar se DB_SSL=true está configurado
# Testar connection string localmente
```

#### 3. **CORS Error**
```bash
# Verificar se CORS_ORIGIN está com a URL correta do frontend
# Verificar se CLIENT_URL está configurado
```

#### 4. **Frontend não carrega API**
```bash
# Verificar se REACT_APP_API_URL está correto
# Verificar se a API está funcionando
# Verificar console do browser para erros
```

### Logs e Debug

- **API Logs**: Vercel Dashboard → Functions → View Function Logs
- **Frontend Logs**: Vercel Dashboard → Functions → View Function Logs
- **Database Logs**: Dashboard do seu provedor de banco

## 📊 URLs Finais

Após o deploy completo:

- **Frontend**: `https://your-frontend-name.vercel.app`
- **API**: `https://your-api-name.vercel.app`
- **Health Check**: `https://your-api-name.vercel.app/health`
- **API Base**: `https://your-api-name.vercel.app/api`

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para o GitHub
2. O Vercel detecta automaticamente e faz redeploy
3. Processo leva ~2-3 minutos

## 💡 Dicas de Performance

### Vercel Free Tier
- **Bandwidth**: 100GB/mês
- **Function Executions**: 100GB-hours/mês
- **Build Time**: 45 minutos/mês
- **Edge Functions**: 500,000 invocations/mês

### Otimizações
1. **API**: Use cache quando possível
2. **Frontend**: Otimize imagens e assets
3. **Database**: Use connection pooling
4. **Build**: Minimize dependências

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

## 🎯 Checklist Final

- [ ] Banco PostgreSQL configurado
- [ ] API deployada no Vercel
- [ ] Frontend deployado no Vercel
- [ ] CORS configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations executadas
- [ ] Health check funcionando
- [ ] Frontend conectando com API
- [ ] Testes básicos realizados

**🎉 Sua aplicação está no ar!**
