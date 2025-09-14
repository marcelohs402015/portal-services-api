# Portal Services - Database Service

Serviço PostgreSQL separado para deploy independente no Render.

## 📋 Descrição

Este serviço contém apenas a configuração do banco de dados PostgreSQL, separado do backend para permitir:
- Deploy independente no Render
- Escalabilidade separada
- Manutenção isolada
- Backup e recovery específicos

## 🚀 Deploy no Render

### Opção 1: PostgreSQL Managed (Recomendado)
1. No Render Dashboard, clique em "New PostgreSQL"
2. Configure:
   - **Name**: `portal-services-database`
   - **Database Name**: `portalservicesdb`
   - **User**: `admin`
   - **Region**: Escolha a mais próxima
3. Anote a **Database URL** gerada

### Opção 2: Docker Container
1. Faça upload desta pasta para um repositório Git
2. No Render Dashboard, clique em "New Web Service"
3. Conecte o repositório
4. Configure:
   - **Name**: `portal-services-database`
   - **Environment**: `Docker`
   - **Build Command**: `docker build -t postgres-service .`
   - **Start Command**: `docker run -p $PORT:5432 postgres-service`

## 🔧 Variáveis de Ambiente

```bash
POSTGRES_DB=portalservicesdb
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST_AUTH_METHOD=trust
```

## 🗄️ Estrutura

```
services/database/
├── Dockerfile              # Container PostgreSQL
├── docker-compose.yml      # Desenvolvimento local
├── render.yaml             # Configuração Render
├── init/                   # Scripts de inicialização
│   └── 01-create-extensions.sql
└── README.md              # Este arquivo
```

## 🔗 Conexão

Após o deploy, use a Database URL fornecida pelo Render nos outros serviços:

```
DATABASE_URL=postgresql://admin:password@host:port/portalservicesdb
```
