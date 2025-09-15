# Configuração de Banco de Dados para Vercel

## Opções de Banco PostgreSQL

### 1. **Neon (Recomendado - Gratuito)**
- **URL**: [neon.tech](https://neon.tech)
- **Plano**: Free (3GB storage, 10GB transfer)
- **Vantagens**: Serverless, auto-scaling, backup automático
- **Setup**:
  1. Criar conta no Neon
  2. Criar novo projeto
  3. Copiar connection string
  4. Adicionar no Vercel como `DATABASE_URL`

### 2. **Supabase (Gratuito)**
- **URL**: [supabase.com](https://supabase.com)
- **Plano**: Free (500MB storage, 2GB bandwidth)
- **Vantagens**: Interface web, real-time features
- **Setup**:
  1. Criar projeto no Supabase
  2. Ir em Settings → Database
  3. Copiar connection string
  4. Adicionar no Vercel como `DATABASE_URL`

### 3. **Railway (Gratuito)**
- **URL**: [railway.app](https://railway.app)
- **Plano**: Free ($5 credit/mês)
- **Vantagens**: Fácil setup, integração com GitHub
- **Setup**:
  1. Conectar GitHub no Railway
  2. Deploy PostgreSQL template
  3. Copiar connection string
  4. Adicionar no Vercel como `DATABASE_URL`

### 4. **PlanetScale (MySQL - Alternativa)**
- **URL**: [planetscale.com](https://planetscale.com)
- **Plano**: Free (1GB storage, 1 billion reads/mês)
- **Vantagens**: Serverless MySQL, branching
- **Nota**: Requer mudança de PostgreSQL para MySQL

## Connection String Format

```
# PostgreSQL (Neon/Supabase/Railway)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Exemplo Neon
DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# Exemplo Supabase
DATABASE_URL=postgresql://postgres:password@db.xyz.supabase.co:5432/postgres?sslmode=require
```

## Variáveis de Ambiente Necessárias

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
DB_SSL=true

# API Configuration
NODE_ENV=production
PORT=3000
APP_VERSION=2.0.0
FEATURES=email-management,service-management,quotations

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app
CLIENT_URL=https://your-frontend-domain.vercel.app

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h

# Email (se usando)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER_EMAIL=your-email@gmail.com
```
