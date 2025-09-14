# Portal Services - Arquitetura de Microserviços

Projeto separado em 3 serviços independentes para deploy manual no Render.

## 🏗️ Arquitetura

```
Portal Services
├── 🗄️  Database Service    (PostgreSQL)
├── 🚀  Backend Service     (Node.js API)
└── 🎨  Frontend Service    (React App)
```

## 📋 Ordem de Deploy no Render

### 1. 🗄️ Database Service
**Pasta**: `services/database/`
- **Tipo**: PostgreSQL Database (Managed)
- **Nome**: `portal-services-database`
- **Configuração**: Ver `database/README.md`

### 2. 🚀 Backend Service  
**Pasta**: `services/backend/`
- **Tipo**: Web Service (Node.js)
- **Nome**: `portal-services-backend`
- **Dependência**: Database Service
- **Configuração**: Ver `backend/README.md`

### 3. 🎨 Frontend Service
**Pasta**: `services/frontend/`
- **Tipo**: Static Site (React)
- **Nome**: `portal-services-frontend`  
- **Dependência**: Backend Service
- **Configuração**: Ver `frontend/README.md`

## 🚀 Deploy Manual no Render

### Passo 1: Database
1. Render Dashboard → "New PostgreSQL"
2. Nome: `portal-services-database`
3. Anote a **Database URL**

### Passo 2: Backend
1. Upload da pasta `services/backend/` para Git
2. Render Dashboard → "New Web Service"
3. Conectar repositório
4. Configurar variáveis de ambiente (ver backend/README.md)
5. **Importante**: Usar a Database URL do Passo 1

### Passo 3: Frontend
1. Upload da pasta `services/frontend/` para Git
2. Render Dashboard → "New Static Site"
3. Conectar repositório
4. **Importante**: Configurar `REACT_APP_API_URL` com URL do Backend

## 🔗 URLs Finais

Após os deploys, você terá:
- **Database**: `postgresql://...` (interno)
- **Backend**: `https://portal-services-backend.onrender.com`
- **Frontend**: `https://portal-services-frontend.onrender.com`

## 🔧 Variáveis de Ambiente

### Backend → Frontend
```bash
CLIENT_URL=https://portal-services-frontend.onrender.com
CORS_ORIGIN=https://portal-services-frontend.onrender.com
```

### Frontend → Backend
```bash
REACT_APP_API_URL=https://portal-services-backend.onrender.com
```

## 📁 Estrutura Completa

```
services/
├── database/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── render.yaml
│   ├── init/
│   └── README.md
├── backend/
│   ├── server.ts
│   ├── database/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   ├── render.yaml
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── render.yaml
│   └── README.md
└── README.md (este arquivo)
```

## ✅ Checklist de Deploy

- [ ] Database criado no Render
- [ ] Database URL anotada
- [ ] Backend deployado com Database URL configurada
- [ ] Backend URL anotada
- [ ] Frontend deployado com Backend URL configurada
- [ ] Testar comunicação entre serviços
- [ ] Verificar logs de cada serviço

## 🆘 Troubleshooting

### Backend não conecta ao banco
- Verificar `DATABASE_URL` nas variáveis de ambiente
- Conferir se o database está rodando
- Checar logs do backend

### Frontend não carrega dados
- Verificar `REACT_APP_API_URL`
- Conferir se o backend está respondendo
- Checar CORS no backend

### Erros de CORS
- Verificar `CORS_ORIGIN` no backend
- Confirmar URLs corretas entre serviços
