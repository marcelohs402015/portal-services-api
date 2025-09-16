# 🚀 Portal Services API - Deploy no Render

## 📋 Pré-requisitos

1. **Conta no Render**: [render.com](https://render.com/)
2. **Repositório Git**: GitHub, GitLab ou Bitbucket
3. **Código commitado**: Todos os arquivos devem estar no repositório

## 🔧 Configuração do Deploy

### 1. **Conectar Repositório**
- Acesse [render.com](https://render.com/)
- Clique em "New" → "Web Service"
- Selecione "Build and deploy from a Git repository"
- Conecte seu repositório

### 2. **Configurações do Web Service**

#### **Configurações Básicas:**
- **Name**: `portal-services-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main` (ou sua branch principal)

#### **Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node appserver/dist/server.js`
- **Dockerfile Path**: `./Dockerfile`

#### **Variáveis de Ambiente:**
```bash
NODE_ENV=production
PORT=3001
DB_HOST=<host_do_banco>
DB_PORT=5432
DB_NAME=portalservicesdb
DB_USER=<usuario_do_banco>
DB_PASSWORD=<senha_do_banco>
DB_SSL=true
JWT_SECRET=<seu_jwt_secret>
LOG_LEVEL=info
```

### 3. **Configuração do Banco PostgreSQL**

#### **Criar Database:**
- No painel do Render, clique em "New" → "PostgreSQL"
- **Name**: `portal-services-db`
- **Database**: `portalservicesdb`
- **User**: `admin`
- **Plan**: `Free` (ou pago conforme necessidade)

#### **Obter Credenciais:**
- Após criar o banco, copie as credenciais
- Adicione as variáveis de ambiente no Web Service

### 4. **Inicialização do Banco**

Após o deploy, você tem 3 opções para inicializar o banco:

#### **Opção 1: Via Render Shell (Recomendado)**
```bash
# No painel do Render, vá em "Shell" do seu Web Service
npm run init-db
```

#### **Opção 2: Via pgAdmin ou psql**
```bash
# Conecte ao banco usando as credenciais do Render
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME>

# Execute os scripts manualmente
\i create-tables.sql
\i seeds.sql
```

#### **Opção 3: Automática no Deploy**
Adicione ao `render.yaml`:
```yaml
services:
  - type: web
    # ... outras configurações
    buildCommand: npm install && npm run build
    startCommand: npm run init-db && node appserver/dist/server.js
```

## 📁 Arquivos de Configuração

### **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "appserver/dist/server.js"]
```

### **render.yaml** (Blueprint)
```yaml
services:
  - type: web
    name: portal-services-api
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node appserver/dist/server.js
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      # ... outras variáveis
```

## 🚀 Deploy Automático

### **Via Blueprint (Recomendado):**
1. Commit o arquivo `render.yaml`
2. No Render, clique em "New" → "Blueprint"
3. Conecte o repositório
4. O Render criará automaticamente todos os serviços

### **Via Web Service Manual:**
1. Siga as configurações acima
2. Clique em "Create Web Service"
3. Aguarde o build e deploy

## 🔍 Verificação do Deploy

### **Endpoints para Testar:**
```bash
# Health Check
GET https://portal-services-api.onrender.com/health

# Categorias
GET https://portal-services-api.onrender.com/api/categories

# Clientes
GET https://portal-services-api.onrender.com/api/clients
```

### **Logs:**
- Acesse o painel do Render
- Vá em "Logs" para ver os logs da aplicação

## ⚠️ Considerações Importantes

### **Plano Gratuito:**
- **Sleep Mode**: Aplicação "dorme" após 15min de inatividade
- **Cold Start**: Primeira requisição pode demorar ~30s
- **Limite de Horas**: 750 horas/mês

### **Performance:**
- Use `DB_SSL=true` para conexões seguras
- Configure `LOG_LEVEL=info` para produção
- Monitore os logs para identificar problemas

### **Segurança:**
- Nunca commite credenciais
- Use variáveis de ambiente para secrets
- Configure CORS adequadamente

## 🛠️ Troubleshooting

### **Build Falha:**
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `Dockerfile` está correto
- Verifique os logs de build

### **Banco não Conecta:**
- Confirme as variáveis de ambiente
- Verifique se o banco está ativo
- Teste a conexão localmente

### **API não Responde:**
- Verifique se a porta está correta
- Confirme se o `startCommand` está correto
- Verifique os logs da aplicação

## 📞 Suporte

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Status Page**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)

---

**🎉 Sucesso! Sua API estará disponível em `https://portal-services-api.onrender.com`**
