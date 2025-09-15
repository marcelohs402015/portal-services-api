# Variáveis de Ambiente para Vercel

## 🔧 API (Backend) - Variáveis de Ambiente

Configure estas variáveis no projeto da **API** no Vercel Dashboard:

### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DB_SSL=true
```

### API Configuration
```bash
NODE_ENV=production
PORT=3000
APP_VERSION=2.0.0
FEATURES=email-management,service-management,quotations
```

### CORS (Atualizar após deploy do frontend)
```bash
CORS_ORIGIN=https://your-frontend-name.vercel.app
CLIENT_URL=https://your-frontend-name.vercel.app
```

### Security
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

### Email (Opcional - se usando Gmail API)
```bash
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER_EMAIL=your-email@gmail.com
```

## 🎨 Frontend (React) - Variáveis de Ambiente

Configure estas variáveis no projeto do **Frontend** no Vercel Dashboard:

### API Connection
```bash
REACT_APP_API_URL=https://your-api-name.vercel.app
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

## 📝 Como Configurar no Vercel

1. **Acesse o projeto no Vercel Dashboard**
2. **Vá em Settings → Environment Variables**
3. **Adicione cada variável:**
   - **Name**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione `Production`, `Preview`, `Development` conforme necessário
4. **Clique em "Save"**
5. **Redeploy o projeto** para aplicar as mudanças

## 🔒 Segurança

- ✅ **Nunca commite** arquivos `.env` no Git
- ✅ **Use valores seguros** para `JWT_SECRET`
- ✅ **Configure CORS** corretamente
- ✅ **Use HTTPS** para todas as URLs
- ✅ **Rotacione secrets** regularmente

## 🧪 Teste das Variáveis

Após configurar, teste se estão funcionando:

```bash
# Teste da API
curl https://your-api-name.vercel.app/health

# Teste do Frontend
curl https://your-frontend-name.vercel.app
```

## 📊 Exemplo Completo

### API Environment Variables
```bash
DATABASE_URL=postgresql://admin:password123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
DB_SSL=true
NODE_ENV=production
PORT=3000
APP_VERSION=2.0.0
FEATURES=email-management,service-management,quotations
CORS_ORIGIN=https://portal-services-frontend.vercel.app
CLIENT_URL=https://portal-services-frontend.vercel.app
JWT_SECRET=my-super-secret-jwt-key-2024
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://portal-services-api.vercel.app
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```
