# 🐳 Configurações Docker Database - Portal Services

## 📋 **CONFIGURAÇÕES ATUAIS (FUNCIONANDO)**

### **1. Docker Compose Configuration**
**Arquivo:** `appserver/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres_db:
    image: postgres:latest
    container_name: postgres_portalservices
    environment:
      POSTGRES_DB: portalservicesdb
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### **2. Variáveis de Ambiente**
**Arquivo:** `env.dev`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portalservicesdb
DB_USER=admin
DB_PASSWORD=admin123
DB_SSL=false
```

### **3. Status Atual do Container**
```
Container: postgres_portalservices
Status: Up 19 minutes
Port: 0.0.0.0:5432->5432/tcp
Database: portalservicesdb (UTF8, en_US.utf8)
```

---

## 🚀 **COMANDOS PARA SUBIR O BANCO**

### **Método 1: Docker Compose (Recomendado)**
```bash
# Navegar para o diretório do appserver
cd appserver

# Subir apenas o PostgreSQL
docker-compose up -d postgres_db

# Verificar status
docker ps --filter "name=postgres_portalservices"
```

### **Método 2: Docker Run Direto**
```bash
# Parar container existente (se houver)
docker stop postgres_portalservices
docker rm postgres_portalservices

# Criar novo container
docker run -d \
  --name postgres_portalservices \
  -e POSTGRES_DB=portalservicesdb \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:latest
```

### **Método 3: Script Automatizado**
```bash
# Usar o script que criamos
./start-with-docker.sh
```

---

## 🔧 **CONFIGURAÇÕES DETALHADAS**

### **PostgreSQL Container**
- **Imagem:** `postgres:latest`
- **Container Name:** `postgres_portalservices`
- **Porta:** `5432:5432`
- **Volume:** `postgres_data` (persistente)

### **Credenciais do Banco**
- **Database:** `portalservicesdb`
- **User:** `admin`
- **Password:** `admin` (no docker-compose) / `admin123` (no env.dev)
- **Host:** `localhost`
- **Port:** `5432`
- **SSL:** `false`

### **Volumes**
- **Dados Persistentes:** `postgres_data:/var/lib/postgresql/data`
- **Backup:** Automático via volume Docker

---

## 🧪 **VERIFICAÇÃO DO BANCO**

### **1. Verificar Container**
```bash
# Status do container
docker ps --filter "name=postgres_portalservices"

# Logs do container
docker logs postgres_portalservices

# Conectar ao banco
docker exec -it postgres_portalservices psql -U admin -d portalservicesdb
```

### **2. Verificar Conexão**
```bash
# Testar conexão
docker exec postgres_portalservices pg_isready -U admin -d portalservicesdb

# Listar databases
docker exec postgres_portalservices psql -U admin -d portalservicesdb -c "\l"

# Listar tabelas
docker exec postgres_portalservices psql -U admin -d portalservicesdb -c "\dt"
```

### **3. Verificar Dados**
```bash
# Contar registros em cada tabela
docker exec postgres_portalservices psql -U admin -d portalservicesdb -c "
SELECT 
  'categories' as tabela, COUNT(*) as registros FROM categories
UNION ALL
SELECT 
  'services' as tabela, COUNT(*) as registros FROM services
UNION ALL
SELECT 
  'clients' as tabela, COUNT(*) as registros FROM clients
UNION ALL
SELECT 
  'quotations' as tabela, COUNT(*) as registros FROM quotations
UNION ALL
SELECT 
  'appointments' as tabela, COUNT(*) as registros FROM appointments
UNION ALL
SELECT 
  'emails' as tabela, COUNT(*) as registros FROM emails;
"
```

---

## 🛠️ **MANUTENÇÃO**

### **Parar o Banco**
```bash
# Parar container
docker stop postgres_portalservices

# Remover container
docker rm postgres_portalservices

# OU usar docker-compose
cd appserver
docker-compose down
```

### **Backup do Banco**
```bash
# Backup completo
docker exec postgres_portalservices pg_dump -U admin portalservicesdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas dados
docker exec postgres_portalservices pg_dump -U admin -a portalservicesdb > data_backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Restaurar Backup**
```bash
# Restaurar backup
docker exec -i postgres_portalservices psql -U admin portalservicesdb < backup_file.sql
```

### **Limpar Volumes**
```bash
# CUIDADO: Remove todos os dados!
docker-compose down -v
docker volume rm appserver_postgres_data
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema: Porta 5432 já em uso**
```bash
# Verificar o que está usando a porta
sudo lsof -i :5432

# Parar processo conflitante
sudo kill -9 <PID>

# OU usar porta diferente
# Alterar no docker-compose.yml: "5433:5432"
# Alterar no env.dev: DB_PORT=5433
```

### **Problema: Container não inicia**
```bash
# Verificar logs
docker logs postgres_portalservices

# Verificar espaço em disco
df -h

# Limpar containers parados
docker container prune
```

### **Problema: Conexão recusada**
```bash
# Verificar se container está rodando
docker ps

# Verificar se porta está exposta
docker port postgres_portalservices

# Testar conectividade
telnet localhost 5432
```

---

## 📊 **CONFIGURAÇÕES DE PRODUÇÃO**

### **Para Produção (Recomendado)**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres_db:
    image: postgres:15-alpine
    container_name: postgres_portalservices_prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./backups:/backups
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_prod:
```

### **Variáveis de Ambiente Produção**
```env
# .env.production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portalservicesdb_prod
DB_USER=admin_prod
DB_PASSWORD=senha_super_segura_aqui
DB_SSL=true
```

---

## ✅ **CHECKLIST DE CONFIGURAÇÃO**

- [ ] Docker instalado e funcionando
- [ ] Porta 5432 disponível
- [ ] Arquivo `docker-compose.yml` configurado
- [ ] Variáveis de ambiente definidas
- [ ] Container PostgreSQL rodando
- [ ] Conexão com banco funcionando
- [ ] Dados carregados automaticamente
- [ ] Backup configurado (produção)

---

**🎉 Com essas configurações, o banco PostgreSQL estará funcionando perfeitamente no Docker!**
