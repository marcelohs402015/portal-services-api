# 🚨 Troubleshooting - Erro de Conexão com Banco

## ❌ **Erro: `ECONNREFUSED ::1:5432`**

### 🔍 **Diagnóstico:**
Este erro indica que a aplicação está tentando conectar no **localhost** em vez de usar a **DATABASE_URL** do Render.

### ✅ **Soluções:**

#### **1. Verificar Environment Variables no Render**

1. Acesse seu serviço no Render Dashboard
2. Vá em **"Environment"**
3. Verifique se existe:
   ```
   DATABASE_URL = postgres://user:pass@host:port/database
   NODE_ENV = production
   ```

#### **2. Se DATABASE_URL não existe:**

1. **Crie o banco PostgreSQL no Render:**
   - New+ → PostgreSQL
   - Nome: `portal-services-db`
   - Copie a **Internal Database URL**

2. **Adicione a variável no serviço:**
   - Settings → Environment
   - Add: `DATABASE_URL` = [sua URL do banco]

#### **3. Se DATABASE_URL existe mas não funciona:**

1. **Verifique se é a Internal URL** (não External)
2. **Formato correto:**
   ```
   postgres://username:password@hostname:port/database
   ```

#### **4. Debug das Variáveis:**

O build agora mostra as variáveis de ambiente. Procure por:
```
🔍 Environment Debug:
DATABASE_URL presente: true/false
NODE_ENV: production
```

### 🔧 **Configuração Manual no Render:**

#### **Environment Variables Obrigatórias:**
```
DATABASE_URL = postgres://user:pass@host:port/database
NODE_ENV = production
JWT_SECRET = [clique Generate]
JWT_REFRESH_SECRET = [clique Generate]
PORT = 10000
```

#### **Configuração do Serviço:**
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`
- **Root Directory:** (deixar vazio)

### 🚀 **Deploy Correto:**

1. **Commit e Push:**
```bash
git add .
git commit -m "fix: debug environment variables"
git push origin main
```

2. **No Render:**
   - Aguarde o build completar
   - Verifique os logs de build para ver as variáveis
   - Se DATABASE_URL não aparecer, adicione manualmente

### 📋 **Checklist de Verificação:**

- [ ] Banco PostgreSQL criado no Render
- [ ] DATABASE_URL configurada (Internal, não External)
- [ ] NODE_ENV = production
- [ ] Runtime = Docker
- [ ] Dockerfile Path = ./Dockerfile
- [ ] Build completou sem erros
- [ ] Logs mostram "Usando DATABASE_URL para conexão"

### 🔍 **Logs para Verificar:**

Procure por estas mensagens nos logs:
```
✅ Usando DATABASE_URL para conexão
✅ Banco de dados conectado com sucesso
```

Se aparecer:
```
❌ Usando variáveis individuais para conexão
```
Significa que DATABASE_URL não foi detectada.

### 🆘 **Se ainda não funcionar:**

1. **Verifique a região:** Banco e serviço devem estar na mesma região
2. **Teste a URL:** Use um cliente PostgreSQL para testar a conexão
3. **Logs detalhados:** Verifique os logs completos do serviço

### 📞 **Suporte:**

Se o problema persistir:
1. Copie os logs completos do build
2. Verifique se todas as variáveis estão configuradas
3. Teste a DATABASE_URL em um cliente PostgreSQL

---

**O problema mais comum é a DATABASE_URL não estar configurada ou estar usando a URL External em vez da Internal!** 🎯
