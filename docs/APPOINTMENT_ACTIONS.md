# 📅 Ações de Agendamento - Portal Services

## 🎯 **OPÇÕES DISPONÍVEIS**

### **1. 🚫 Cancelar Agendamento**
**Ação:** Muda o status para "cancelled" (mantém o registro no banco)

**Via API:**
```bash
PUT http://localhost:3001/api/appointments/{id}/cancel
Content-Type: application/json

# Resposta:
{
  "success": true,
  "data": { ... },
  "message": "Appointment cancelled successfully"
}
```

**Via Frontend:**
- Botão "Cancelar" no agendamento
- Status muda para "cancelled"
- Agendamento fica visível mas marcado como cancelado

---

### **2. 🗑️ Apagar Agendamento**
**Ação:** Remove permanentemente do banco de dados

**Via API:**
```bash
DELETE http://localhost:3001/api/appointments/{id}
Content-Type: application/json

# Resposta:
{
  "success": true,
  "message": "Appointment deleted permanently"
}
```

**Via Frontend:**
- Botão "Apagar" ou "Excluir" no agendamento
- Confirmação de segurança
- Agendamento é removido completamente

---

### **3. ✏️ Editar Agendamento**
**Ação:** Atualiza dados do agendamento

**Via API:**
```bash
PUT http://localhost:3001/api/appointments/{id}
Content-Type: application/json

{
  "clientId": 1,
  "clientName": "João Silva",
  "serviceIds": [1, 2],
  "serviceNames": ["Eletricista", "Pintura"],
  "date": "2025-09-15",
  "time": "14:00",
  "duration": 120,
  "address": "Rua das Flores, 123",
  "notes": "Cliente preferencial",
  "status": "confirmed"
}
```

---

### **4. 📊 Alterar Status**
**Ação:** Muda apenas o status do agendamento

**Status disponíveis:**
- `scheduled` - Agendado
- `confirmed` - Confirmado
- `cancelled` - Cancelado
- `completed` - Concluído
- `no_show` - Não compareceu

**Via API:**
```bash
PUT http://localhost:3001/api/appointments/{id}
Content-Type: application/json

{
  "status": "completed"
}
```

---

## 🔧 **COMANDOS SQL DIRETOS**

### **Cancelar Agendamento:**
```sql
UPDATE appointments 
SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
WHERE id = {id_do_agendamento};
```

### **Apagar Agendamento:**
```sql
DELETE FROM appointments WHERE id = {id_do_agendamento};
```

### **Ver Agendamentos:**
```sql
SELECT id, client_name, date, time, status, notes 
FROM appointments 
ORDER BY date DESC, time DESC;
```

---

## 🎨 **INTERFACE DO USUÁRIO**

### **Botões Sugeridos:**
1. **"Cancelar"** - Muda status para cancelled
2. **"Apagar"** - Remove permanentemente
3. **"Editar"** - Abre formulário de edição
4. **"Confirmar"** - Muda status para confirmed
5. **"Concluir"** - Muda status para completed

### **Confirmações de Segurança:**
- **Cancelar:** "Tem certeza que deseja cancelar este agendamento?"
- **Apagar:** "⚠️ ATENÇÃO: Esta ação não pode ser desfeita. Tem certeza que deseja apagar permanentemente este agendamento?"

---

## 📱 **EXEMPLOS DE USO**

### **Cancelar agendamento ID 5:**
```bash
curl -X PUT http://localhost:3001/api/appointments/5/cancel
```

### **Apagar agendamento ID 3:**
```bash
curl -X DELETE http://localhost:3001/api/appointments/3
```

### **Listar todos os agendamentos:**
```bash
curl -X GET http://localhost:3001/api/appointments
```

---

## ✅ **STATUS ATUAL**

- ✅ **Rota de Cancelar:** `/api/appointments/:id/cancel` (PUT)
- ✅ **Rota de Apagar:** `/api/appointments/:id` (DELETE)
- ✅ **Rota de Editar:** `/api/appointments/:id` (PUT)
- ✅ **Rota de Listar:** `/api/appointments` (GET)
- ✅ **Validações:** Implementadas
- ✅ **Logs:** Configurados
- ✅ **Tratamento de Erros:** Implementado

**Próximo passo:** Implementar os botões no frontend! 🚀
