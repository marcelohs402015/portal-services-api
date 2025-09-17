# 🔑 Bruno - Guia de Configuração de API Key

## 🚀 Como Configurar API Key no Bruno

### 1. **Obter a API Key**

Use esta API Key para todos os testes:

```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 2. **Configurar no Bruno**

#### Opção A: Configurar Globalmente (Recomendado)

1. **Abra o Bruno**
2. **Vá em Settings** (Configurações)
3. **Selecione "Environment"** (Ambiente)
4. **Adicione uma variável:**
   - **Nome**: `API_KEY`
   - **Valor**: `psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

#### Opção B: Configurar por Request

1. **Abra uma requisição**
2. **Vá na aba "Headers"**
3. **Adicione:**
   - **Key**: `Authorization`
   - **Value**: `Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

### 3. **Testar Criação de Categoria**

#### Request para Criar Categoria:

```http
POST http://localhost:3001/api/categories
```

**Headers:**
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Teste Bruno",
  "description": "Categoria criada via Bruno",
  "color": "#FF6B6B",
  "active": true
}
```

### 4. **Exemplos de Requests**

#### ✅ **Listar Categorias** (GET)
```http
GET http://localhost:3001/api/categories
```
**Headers:**
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

#### ✅ **Criar Categoria** (POST)
```http
POST http://localhost:3001/api/categories
```
**Headers:**
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "color": "#3B82F6",
  "active": true
}
```

#### ✅ **Atualizar Categoria** (PUT)
```http
PUT http://localhost:3001/api/categories/1
```
**Headers:**
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Categoria Atualizada",
  "description": "Nova descrição",
  "color": "#FF6B6B",
  "active": true
}
```

#### ✅ **Deletar Categoria** (DELETE)
```http
DELETE http://localhost:3001/api/categories/1
```
**Headers:**
```
Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 5. **Outros Endpoints para Testar**

#### **Clientes:**
```http
GET http://localhost:3001/api/clients
POST http://localhost:3001/api/clients
PUT http://localhost:3001/api/clients/1
DELETE http://localhost:3001/api/clients/1
```

#### **Serviços:**
```http
GET http://localhost:3001/api/services
POST http://localhost:3001/api/services
PUT http://localhost:3001/api/services/1
DELETE http://localhost:3001/api/services/1
```

#### **Orçamentos:**
```http
GET http://localhost:3001/api/quotations
POST http://localhost:3001/api/quotations
PUT http://localhost:3001/api/quotations/1
DELETE http://localhost:3001/api/quotations/1
```

#### **Estatísticas:**
```http
GET http://localhost:3001/api/stats/dashboard
GET http://localhost:3001/api/stats/business
```

### 6. **Exemplos de Body para POST/PUT**

#### **Criar Cliente:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "notes": "Cliente preferencial"
}
```

#### **Criar Serviço:**
```json
{
  "name": "Reparo de Torneira",
  "description": "Reparo completo de torneiras",
  "price": 150.00,
  "category_id": 1,
  "active": true
}
```

#### **Criar Orçamento:**
```json
{
  "client_id": 1,
  "valid_until": "2024-02-15T00:00:00.000Z",
  "items": [
    {
      "service_id": 1,
      "quantity": 2,
      "price": 150.00
    }
  ]
}
```

### 7. **Troubleshooting**

#### **Erro 401 Unauthorized:**
- Verifique se a API Key está correta
- Confirme o formato: `Bearer psk_xxxxx`
- Certifique-se de que não há espaços extras

#### **Erro 403 Forbidden:**
- A API Key pode não ter permissão para a operação
- Use a API Key fornecida que tem todas as permissões

#### **Erro 404 Not Found:**
- Verifique se a URL está correta
- Confirme se o endpoint existe
- Teste primeiro com `GET /health`

#### **Erro 500 Internal Server Error:**
- Verifique se o servidor está rodando
- Confirme se o banco de dados está conectado
- Teste com `GET /health`

### 8. **Teste Rápido**

1. **Teste o Health Check:**
   ```http
   GET http://localhost:3001/health
   ```

2. **Teste Listar Categorias:**
   ```http
   GET http://localhost:3001/api/categories
   Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
   ```

3. **Teste Criar Categoria:**
   ```http
   POST http://localhost:3001/api/categories
   Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
   Content-Type: application/json
   
   {
     "name": "Teste Bruno",
     "description": "Categoria de teste",
     "color": "#FF6B6B",
     "active": true
   }
   ```

### 9. **Permissões da API Key**

Esta API Key tem **TODAS** as permissões:
- ✅ `read:categories` - Ler categorias
- ✅ `create:categories` - Criar categorias
- ✅ `update:categories` - Atualizar categorias
- ✅ `delete:categories` - Deletar categorias
- ✅ `read:clients` - Ler clientes
- ✅ `create:clients` - Criar clientes
- ✅ `update:clients` - Atualizar clientes
- ✅ `delete:clients` - Deletar clientes
- ✅ `read:services` - Ler serviços
- ✅ `create:services` - Criar serviços
- ✅ `update:services` - Atualizar serviços
- ✅ `delete:services` - Deletar serviços
- ✅ `read:quotations` - Ler orçamentos
- ✅ `create:quotations` - Criar orçamentos
- ✅ `update:quotations` - Atualizar orçamentos
- ✅ `delete:quotations` - Deletar orçamentos
- ✅ `read:appointments` - Ler agendamentos
- ✅ `create:appointments` - Criar agendamentos
- ✅ `update:appointments` - Atualizar agendamentos
- ✅ `delete:appointments` - Deletar agendamentos
- ✅ `read:emails` - Ler emails
- ✅ `create:emails` - Criar emails
- ✅ `update:emails` - Atualizar emails
- ✅ `delete:emails` - Deletar emails
- ✅ `read:stats` - Ler estatísticas
- ✅ `admin:all` - Acesso administrativo total

---

## 🎯 **Resumo Rápido:**

1. **API Key**: `psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`
2. **Header**: `Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`
3. **URL Base**: `http://localhost:3001/api`
4. **Para criar categoria**: `POST /api/categories` com body JSON

**🚀 Agora você pode testar todas as APIs no Bruno!**
