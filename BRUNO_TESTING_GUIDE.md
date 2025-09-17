# 🧪 Guia Completo de Testes com Bruno

## 🚀 **Configuração Inicial**

### **1. Iniciar a API Local:**
```bash
cd /home/mstech/projetos/portal-services-api
npm run dev
```

### **2. Verificar se está funcionando:**
- **URL Base Local:** `http://localhost:3001`
- **Health Check:** `GET http://localhost:3001/health`

---

## 🔐 **AUTENTICAÇÃO JWT - Endpoints**

### **1. LOGIN (Obter Token)**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@portalservices.com",
  "password": "Admin@123456",
  "rememberMe": false
}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "admin-001",
      "email": "admin@portalservices.com",
      "name": "Administrador",
      "role": "super_admin",
      "permissions": ["*"]
    }
  }
}
```

### **2. REGISTRAR NOVO USUÁRIO**
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Teste Bruno",
  "email": "teste@bruno.com",
  "password": "Teste@123456",
  "role": "user"
}
```

### **3. REFRESH TOKEN**
```http
POST http://localhost:3001/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

### **4. PERFIL DO USUÁRIO (Requer Token)**
```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

### **5. LOGOUT**
```http
POST http://localhost:3001/api/auth/logout
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

---

## 📊 **ENDPOINTS DA API - CATEGORIAS (Protegidos)**

### **1. LISTAR CATEGORIAS (Público - Opcional Auth)**
```http
GET http://localhost:3001/api/categories
# Opcional: Authorization: Bearer SEU_TOKEN_AQUI
```

### **2. CRIAR CATEGORIA (Requer Auth + Permissão)**
```http
POST http://localhost:3001/api/categories
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
Content-Type: application/json

{
  "name": "Categoria Teste Bruno",
  "description": "Descrição da categoria criada via Bruno"
}
```

### **3. ATUALIZAR CATEGORIA (Requer Auth + Permissão)**
```http
PUT http://localhost:3001/api/categories/1
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
Content-Type: application/json

{
  "name": "Categoria Atualizada",
  "description": "Descrição atualizada via Bruno"
}
```

### **4. DELETAR CATEGORIA (Requer Auth + Permissão)**
```http
DELETE http://localhost:3001/api/categories/1
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

---

## 🛡️ **TESTANDO AUTORIZAÇÃO E PERMISSÕES**

### **Usuários Padrão Criados:**

1. **Super Admin:**
   - Email: `admin@portalservices.com`
   - Senha: `Admin@123456`
   - Permissões: **TODAS**

2. **Manager:**
   - Email: `manager@portalservices.com`
   - Senha: `Manager@123456`
   - Permissões: **Limitadas**

3. **User:**
   - Email: `user@portalservices.com`
   - Senha: `User@123456`
   - Permissões: **Básicas**

### **Testando Diferentes Roles:**

1. **Login como Super Admin** → Pode fazer TUDO
2. **Login como Manager** → Pode criar/editar, mas limitações
3. **Login como User** → Apenas leitura na maioria dos casos

---

## 🚨 **TESTANDO RATE LIMITING**

### **Rate Limits Configurados:**

- **Global:** 100 req/15min por IP
- **Auth Endpoints:** 10 req/15min por IP
- **Create Endpoints:** 20 req/15min por IP

### **Como Testar:**
1. Faça múltiplas requisições rápidas no login
2. Após 10 tentativas em 15min, deve retornar `429`
3. Teste também nos endpoints de criação

---

## 🔄 **FLUXO COMPLETO DE TESTE**

### **Passo 1: Health Check**
```http
GET http://localhost:3001/health
```

### **Passo 2: Login**
```http
POST http://localhost:3001/api/auth/login
{
  "email": "admin@portalservices.com",
  "password": "Admin@123456"
}
```

### **Passo 3: Copiar o accessToken da resposta**

### **Passo 4: Testar Endpoint Protegido**
```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer SEU_TOKEN_COPIADO_AQUI
```

### **Passo 5: Criar Categoria**
```http
POST http://localhost:3001/api/categories
Authorization: Bearer SEU_TOKEN_COPIADO_AQUI
{
  "name": "Teste Bruno",
  "description": "Criado via Bruno"
}
```

---

## ❌ **TESTANDO CENÁRIOS DE ERRO**

### **1. Token Inválido:**
```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer token_invalido_aqui
```
**Esperado:** `401 Unauthorized`

### **2. Token Expirado:**
- Use um token antigo
- **Esperado:** `401 Token expirado`

### **3. Sem Permissão:**
- Login como `user` e tente criar categoria
- **Esperado:** `403 Forbidden`

### **4. Rate Limit:**
- Faça 11 logins seguidos
- **Esperado:** `429 Too Many Requests`

---

## 🌐 **CONFIGURAÇÃO PARA RENDER (Produção)**

Quando fizer deploy no Render, substitua:
- `http://localhost:3001` → `https://portal-services-api.onrender.com`
- Tokens funcionam igualmente (mesmos secrets)

---

## 🔧 **Configuração do Bruno**

### **Environment Variables no Bruno:**
```
BASE_URL = http://localhost:3001
ACCESS_TOKEN = (será preenchido após login)
REFRESH_TOKEN = (será preenchido após login)
```

### **Headers Globais:**
```
Content-Type: application/json
```

### **Scripts de Pré-requisição (Bruno):**
```javascript
// Para salvar token após login
if (res.body.data && res.body.data.accessToken) {
  bru.setEnvVar("ACCESS_TOKEN", res.body.data.accessToken);
  bru.setEnvVar("REFRESH_TOKEN", res.body.data.refreshToken);
}
```

---

## 🎯 **Checklist de Testes**

- [ ] Health check funciona
- [ ] Login retorna token válido
- [ ] Token funciona em endpoints protegidos
- [ ] Diferentes roles têm permissões corretas
- [ ] Rate limiting funciona
- [ ] Refresh token funciona
- [ ] Logout revoga tokens
- [ ] Endpoints CRUD funcionam com auth
- [ ] Erros retornam códigos HTTP corretos
- [ ] Respostas seguem padrão `{success, data/error}`

---

**✅ Agora você pode testar tudo no Bruno e depois integrar com N8N!**
