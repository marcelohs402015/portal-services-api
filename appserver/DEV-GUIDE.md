# 🚀 Portal Services API - Guia de Desenvolvimento

## 🎯 Início Rápido

### 1. Subir API + Banco (Recomendado)
```bash
npm run dev
```
- ✅ Sobe API e PostgreSQL automaticamente
- ✅ Build automático
- ✅ Testa conexões
- ✅ Mostra token de teste

### 2. Outros comandos úteis
```bash
npm run dev:watch    # Sobe com logs em tempo real
npm run dev:logs     # Ver logs dos containers
npm run dev:stop     # Parar todos os serviços
npm run dev:clean    # Limpeza completa + restart
npm run dev:local    # Apenas o servidor (precisa do banco rodando)
```

## 🔑 Autenticação (API Keys)

### Token de Teste (Fixo)
```
psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Como usar no Bruno
1. **Auth** → **Bearer Token**
2. Cole o token acima
3. **Body** → **JSON**:
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "color": "#FF6B6B",
  "active": true
}
```
4. **POST** → `http://localhost:3001/api/categories`

### Como usar no N8N
- **Authentication**: Generic Credential Type
- **Header Name**: `Authorization`
- **Header Value**: `Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

## 🌐 Endpoints Disponíveis

### Públicos
- `GET /health` - Health check
- `GET /api/categories` - Listar categorias

### Protegidos (requerem API Key)
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- E todos os outros endpoints...

## 🧪 Testando

### cURL
```bash
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Teste","description":"Categoria teste","color":"#FF6B6B","active":true}' \
     http://localhost:3001/api/categories
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🔧 Resolução de Problemas

### Container já em uso
```bash
npm run dev:clean
```

### Ver logs
```bash
npm run dev:logs
```

### Resetar tudo
```bash
npm run dev:stop
docker system prune -f
npm run dev
```

## 📋 URLs Importantes

- **API**: http://localhost:3001
- **Health**: http://localhost:3001/health  
- **Categorias**: http://localhost:3001/api/categories
- **Banco**: localhost:5432 (admin/admin)

---

✅ **Sistema 100% funcional com API Keys (sem JWT)**  
🔑 **Pronto para integração N8N**  
🚀 **Desenvolvimento simplificado**
