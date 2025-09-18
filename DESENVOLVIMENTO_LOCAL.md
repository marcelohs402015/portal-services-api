# 🚀 Desenvolvimento Local - Portal Services API

## 📋 **Pré-requisitos**

- Node.js 18+ 
- npm 8+
- Banco PostgreSQL no Render (configurado separadamente)

## 🔧 **Configuração Inicial**

### 1. **Instalar Dependências**
```bash
npm run install:all
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp env.dev .env

# Edite o arquivo .env e configure:
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. **Verificar Conexão**
```bash
cd appserver
npm run dev
```

## 🎯 **Scripts Disponíveis**

### **Desenvolvimento**
```bash
npm run dev        # Inicia servidor em modo watch
npm start          # Inicia servidor em produção
```

### **Build e Deploy**
```bash
npm run build      # Compila TypeScript
npm run typecheck  # Verifica tipos
```

### **Testes**
```bash
npm run test       # Executa todos os testes
```

## 🔑 **Autenticação API Key**

### **Token Fixo para Desenvolvimento**
```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### **Como Usar**
```bash
# cURL
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X GET \
     http://localhost:3001/api/categories

# Bruno API Client
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## 🗄️ **Banco de Dados**

### **Configuração**
- **Tipo**: PostgreSQL no Render
- **Variável**: `DATABASE_URL` (obrigatória)
- **SSL**: Automático em produção

### **Health Check**
```bash
curl http://localhost:3001/health
```

## 📡 **APIs Disponíveis**

### **Principais Endpoints**
- `GET /health` - Status da aplicação
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço

### **Exemplo de Uso**
```bash
# Criar categoria
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Categoria Teste","description":"Nova categoria","color":"#FF6B6B","active":true}' \
     http://localhost:3001/api/categories
```

## 🚀 **Deploy no Render**

### **Configuração Automática**
O projeto já está configurado para deploy automático no Render usando:
- `Dockerfile` otimizado
- `render.yaml` (Blueprint)
- Variáveis de ambiente automáticas

### **Variáveis Necessárias no Render**
```
DATABASE_URL=postgresql://... (do seu PostgreSQL no Render)
NODE_ENV=production
API_KEY_SECRET=portal-services-api-key-secret-2024
```

## 🔍 **Troubleshooting**

### **Erro: DATABASE_URL não encontrada**
```bash
# Configure no .env
DATABASE_URL=postgresql://user:password@host:port/database
```

### **Erro: Token inválido**
```bash
# Use o token correto
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### **Erro: Porta em uso**
```bash
# Mude a porta no .env
PORT=3002
```

## 📚 **Documentação Adicional**

- `API_KEYS_GUIDE.md` - Guia completo de API Keys
- `FRONTEND_INTEGRATION_GUIDE.md` - Integração com frontend
- `API_N8N_INTEGRATION_GUIDE.md` - Integração com N8N
- `DEPLOY_RENDER.md` - Deploy detalhado no Render

---

**🎉 Pronto! Sua API está funcionando localmente e pronta para deploy!**
