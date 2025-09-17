# 🔑 Guia de API Keys - Sistema Simples para N8N

## 🎯 **Por que API Keys em vez de JWT?**

- ✅ **Simples:** `Authorization: Bearer psk_xxxxx`
- ✅ **Sem expiração:** Tokens permanentes
- ✅ **Fácil no N8N:** Configuração direta
- ✅ **Sem refresh:** Sem complexidade
- ✅ **Ideal para automações**

---

## 🔑 **API Keys Padrão Criadas Automaticamente**

### **1. N8N Read Only**
```
Key: psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Permissões: read:categories, read:clients, read:services, read:quotations, read:appointments, read:emails, read:stats
Uso: Automações N8N que só precisam ler dados
```

### **2. N8N Full Access**
```
Key: psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Permissões: TODAS (create, read, update, delete)
Uso: Automações N8N que precisam criar/editar dados
```

### **3. Admin**
```
Key: psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Permissões: TODAS + admin:all
Uso: Acesso administrativo completo
```

---

## 🚀 **Como Usar no N8N**

### **1. Configuração no N8N:**
- **Authorization:** Bearer Token
- **Token:** `psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **2. Headers:**
```
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

### **3. Exemplo de Request:**
```http
POST http://localhost:3001/api/categories
Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "name": "Eletricista",
  "description": "Serviços elétricos",
  "color": "#FF6B35",
  "active": true
}
```

---

## 📋 **Endpoints Disponíveis**

### **🔍 Informações das API Keys:**
- `GET /api/keys/me` - Informações da sua API Key
- `GET /api/keys/permissions` - Lista todas as permissões

### **📊 Categorias:**
- `GET /api/categories` - Listar (público)
- `POST /api/categories` - Criar (requer `create:categories`)
- `PUT /api/categories/:id` - Atualizar (requer `update:categories`)
- `DELETE /api/categories/:id` - Deletar (requer `delete:categories`)

### **👥 Clientes:**
- `GET /api/clients` - Listar (público)
- `POST /api/clients` - Criar (requer `create:clients`)
- `PUT /api/clients/:id` - Atualizar (requer `update:clients`)
- `DELETE /api/clients/:id` - Deletar (requer `delete:clients`)

### **🛠️ Serviços:**
- `GET /api/services` - Listar (público)
- `POST /api/services` - Criar (requer `create:services`)
- `PUT /api/services/:id` - Atualizar (requer `update:services`)
- `DELETE /api/services/:id` - Deletar (requer `delete:services`)

### **💰 Orçamentos:**
- `GET /api/quotations` - Listar (público)
- `POST /api/quotations` - Criar (requer `create:quotations`)
- `PUT /api/quotations/:id` - Atualizar (requer `update:quotations`)
- `DELETE /api/quotations/:id` - Deletar (requer `delete:quotations`)

### **📅 Agendamentos:**
- `GET /api/appointments` - Listar (público)
- `POST /api/appointments` - Criar (requer `create:appointments`)
- `PUT /api/appointments/:id` - Atualizar (requer `update:appointments`)
- `DELETE /api/appointments/:id` - Deletar (requer `delete:appointments`)

### **📧 Emails:**
- `GET /api/emails` - Listar (público)
- `POST /api/emails` - Criar (requer `create:emails`)
- `PUT /api/emails/:id` - Atualizar (requer `update:emails`)
- `DELETE /api/emails/:id` - Deletar (requer `delete:emails`)

### **📊 Estatísticas:**
- `GET /api/stats/dashboard` - Dashboard (requer `read:stats`)
- `GET /api/stats/business` - Negócio (requer `read:stats`)

---

## 🔧 **Gerenciamento de API Keys (Admin)**

### **Listar API Keys:**
```http
GET /api/keys
Authorization: Bearer psk_admin_key_here
```

### **Criar Nova API Key:**
```http
POST /api/keys
Authorization: Bearer psk_admin_key_here
Content-Type: application/json

{
  "name": "Minha Integração",
  "permissions": ["read:categories", "create:clients"],
  "description": "Para integração específica"
}
```

### **Desativar API Key:**
```http
PATCH /api/keys/psk_xxxxx/deactivate
Authorization: Bearer psk_admin_key_here
```

### **Ativar API Key:**
```http
PATCH /api/keys/psk_xxxxx/activate
Authorization: Bearer psk_admin_key_here
```

---

## 🧪 **Teste Rápido**

### **1. Obter suas API Keys:**
```bash
curl -X GET http://localhost:3001/api/keys/me \
  -H "Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### **2. Criar categoria:**
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste N8N","description":"Criado via N8N","color":"#FF6B35","active":true}'
```

### **3. Listar categorias:**
```bash
curl -X GET http://localhost:3001/api/categories
```

---

## ⚠️ **Códigos de Erro**

- **401** - API Key não fornecida ou inválida
- **403** - Permissão insuficiente
- **404** - Recurso não encontrado
- **429** - Rate limit excedido
- **500** - Erro interno do servidor

---

## 🎯 **Para N8N - Configuração Recomendada**

### **1. Use a API Key "N8N Full Access"** para automações completas
### **2. Use a API Key "N8N Read Only"** para automações que só leem dados
### **3. Configure no N8N:**
   - **Authentication:** Bearer Token
   - **Token:** Sua API Key (psk_xxxxx)
   - **Base URL:** `http://localhost:3001` (local) ou `https://sua-api.onrender.com` (produção)

---

## ✅ **Vantagens do Sistema de API Keys**

1. **Simplicidade:** Sem JWT complexo
2. **Permanência:** Sem expiração
3. **N8N Friendly:** Configuração direta
4. **Granular:** Permissões específicas
5. **Auditável:** Logs de uso
6. **Gerenciável:** Ativar/desativar facilmente

**Agora seu sistema está PERFEITO para N8N! 🚀**
