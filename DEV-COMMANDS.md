# 🚀 Comandos de Desenvolvimento - Portal Services

## 📋 **Comandos Principais**

### **Sistema Completo (Recomendado)**
```bash
npm run dev
```
**O que faz:**
- ✅ Inicia banco PostgreSQL (Docker)
- ✅ Aguarda banco ficar pronto
- ✅ Inicia servidor backend (porta 3001)
- ✅ Inicia frontend React (porta 3000)
- ✅ Mostra status completo do sistema
- ✅ Cleanup automático ao parar (Ctrl+C)

### **Sistema Simples (Alternativo)**
```bash
npm run dev:simple
```
**O que faz:**
- ✅ Inicia banco, servidor e frontend simultaneamente
- ✅ Usa concurrently para gerenciar processos
- ✅ Menos robusto que o comando principal

### **Apenas Backend + Frontend (Sem Docker)**
```bash
npm run dev:local
```
**O que faz:**
- ✅ Inicia servidor e frontend
- ❌ Não inicia banco (assume que já está rodando)

---

## 🛠️ **Comandos de Gerenciamento**

### **Banco de Dados**
```bash
npm run db:start      # Inicia apenas o banco
npm run db:stop       # Para o banco
npm run db:restart    # Reinicia o banco
```

### **Servidor Backend**
```bash
npm run server:dev    # Inicia servidor em modo dev
npm run server        # Alias para server:dev
```

### **Frontend**
```bash
npm run client:dev    # Inicia frontend React
npm run client        # Alias para client:dev
```

---

## 🐳 **Comandos Docker**

### **Sistema Completo com Docker**
```bash
npm run dev:docker    # Inicia tudo via docker-compose
npm run dev:detached  # Inicia em background
npm run dev:stop      # Para containers
npm run dev:restart   # Reinicia containers
npm run dev:logs      # Ver logs dos containers
```

---

## 📊 **URLs do Sistema**

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface React |
| **Backend API** | http://localhost:3001 | API REST |
| **Banco de Dados** | localhost:5432 | PostgreSQL |
| **Health Check** | http://localhost:3001/health | Status da API |

---

## 🔍 **Testando o Sistema**

### **Verificar Status**
```bash
# Health check da API
curl http://localhost:3001/health

# Listar categorias
curl http://localhost:3001/api/categories

# Listar clientes
curl http://localhost:3001/api/clients

# Listar serviços
curl http://localhost:3001/api/services
```

### **Criar Dados de Teste**
```bash
# Criar cliente
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores, 123",
    "notes": "Cliente teste"
  }'

# Criar categoria
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jardineiro",
    "description": "Serviços de jardinagem",
    "keywords": ["jardinagem", "plantas"],
    "patterns": ["jardinagem"],
    "domains": ["residencial"],
    "color": "#2ECC71"
  }'
```

---

## 🛠️ **Comandos de Manutenção**

### **Instalar Dependências**
```bash
npm run install:all   # Instala todas as dependências
```

### **Build do Projeto**
```bash
npm run build         # Build completo
npm run build:server  # Build apenas do servidor
npm run build:client  # Build apenas do cliente
```

### **Verificação de Tipos**
```bash
npm run typecheck     # Verifica tipos TypeScript
```

### **Testes**
```bash
npm test              # Executa testes
```

---

## 🚨 **Solução de Problemas**

### **Banco não conecta**
```bash
# Verificar se container está rodando
docker ps | grep postalservices-api

# Ver logs do banco
docker logs postalservices-api

# Reiniciar banco
npm run db:restart
```

### **Porta já em uso**
```bash
# Verificar processos nas portas
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Banco

# Parar processos
pkill -f "react-scripts start"
pkill -f "tsx server.ts"
```

### **Dependências desatualizadas**
```bash
# Limpar e reinstalar
rm -rf node_modules appserver/node_modules appclient/node_modules
npm run install:all
```

---

## 📝 **Logs e Debug**

### **Ver Logs do Sistema**
```bash
# Logs do banco
docker logs postalservices-api

# Logs do servidor (arquivo)
tail -f appserver/logs/combined.log

# Logs do servidor (console)
# Aparecem automaticamente no terminal quando roda npm run dev
```

### **Modo Debug**
```bash
# Servidor com logs detalhados
cd appserver && LOG_LEVEL=debug npm run dev

# Frontend com logs detalhados
cd appclient && REACT_APP_DEBUG=true npm run dev
```

---

## 🎯 **Fluxo de Desenvolvimento Recomendado**

1. **Iniciar sistema completo:**
   ```bash
   npm run dev
   ```

2. **Abrir navegador:**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:3001/health

3. **Desenvolver:**
   - Código é recompilado automaticamente
   - Hot reload no frontend
   - Watch mode no backend

4. **Testar:**
   - Usar curl para testar APIs
   - Verificar logs no terminal
   - Testar interface no navegador

5. **Parar sistema:**
   - Pressionar `Ctrl+C`
   - Sistema faz cleanup automático

---

**🎉 Agora você pode desenvolver com `npm run dev` e ter todo o sistema rodando!**
