# Portal Services API - Docker Setup

Este documento explica como configurar e executar o Portal Services API usando Docker.

## 📋 Pré-requisitos

- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)
- Git

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Clone o repositório (se ainda não fez)
git clone <repository-url>
cd portal-services-api/appserver

# Copie o arquivo de ambiente
cp env.example docker.env

# Edite as configurações se necessário
nano docker.env
```

### 2. Iniciar o Ambiente

```bash
# Iniciar todos os serviços
./start-docker.sh

# Ou com limpeza completa (remove imagens antigas)
./start-docker.sh --clean
```

### 3. Verificar se está Funcionando

```bash
# Testar health check
curl http://localhost:3001/health

# Testar API de categorias
curl http://localhost:3001/api/categories

# Testar estatísticas
curl http://localhost:3001/api/stats/dashboard
```

## 🛑 Parar o Ambiente

```bash
# Parar containers (preserva dados)
./stop-docker.sh

# Parar e remover volumes (remove dados do banco)
./stop-docker.sh --volumes

# Parar e limpeza completa (remove tudo)
./stop-docker.sh --clean
```

## 📊 Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| API Server | 3001 | Portal Services API |
| PostgreSQL | 5432 | Banco de dados |

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f appserver
docker-compose logs -f db

# Reiniciar um serviço
docker-compose restart appserver

# Executar comando no container
docker-compose exec appserver sh
docker-compose exec db psql -U admin -d portalservicesdb
```

### Gerenciamento de Dados

```bash
# Fazer backup do banco
docker-compose exec db pg_dump -U admin portalservicesdb > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U admin -d portalservicesdb < backup.sql

# Conectar ao banco
docker-compose exec db psql -U admin -d portalservicesdb
```

## 🗂️ Estrutura de Arquivos

```
appserver/
├── docker-compose.yml          # Configuração dos serviços
├── Dockerfile                  # Imagem da API
├── docker.env                  # Variáveis de ambiente
├── start-docker.sh            # Script de inicialização
├── stop-docker.sh             # Script de parada
├── healthcheck.js             # Health check da API
├── database/
│   └── init/
│       ├── 01-create-tables.sql    # Criação das tabelas
│       └── 02-seed-data.sql        # Dados iniciais
└── logs/                      # Logs da aplicação
```

## 🔐 Configuração de Segurança

### Variáveis de Ambiente Importantes

Edite o arquivo `docker.env` para configurar:

```bash
# API Keys (para integração N8N)
API_KEYS_ENABLED=true

# Banco de dados
DB_PASSWORD=admin  # Mude para uma senha forte

# Email (opcional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Produção

Para ambiente de produção:

1. **Mude todas as senhas padrão**
2. **Use HTTPS**
3. **Configure firewall**
4. **Use secrets do Docker**
5. **Configure backup automático**

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso

```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5432

# Parar outros serviços ou mudar as portas no docker-compose.yml
```

#### 2. Banco não conecta

```bash
# Verificar logs do banco
docker-compose logs db

# Verificar se o banco está rodando
docker-compose exec db pg_isready -U admin -d portalservicesdb
```

#### 3. API não responde

```bash
# Verificar logs da API
docker-compose logs appserver

# Verificar se a API está rodando
curl http://localhost:3001/health
```

#### 4. Problemas de permissão

```bash
# Dar permissão aos scripts
chmod +x start-docker.sh stop-docker.sh

# Verificar permissões dos logs
sudo chown -R $USER:$USER logs/
```

### Logs e Debug

```bash
# Ver todos os logs
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs appserver
docker-compose logs db

# Ver logs em tempo real
docker-compose logs -f

# Verificar status dos containers
docker-compose ps

# Verificar uso de recursos
docker stats
```

## 📈 Monitoramento

### Health Checks

- **API**: http://localhost:3001/health
- **Banco**: Verificado automaticamente pelo Docker

### Métricas

```bash
# Verificar uso de recursos
docker stats

# Verificar espaço em disco
docker system df

# Limpar recursos não utilizados
docker system prune
```

## 🔄 Atualizações

### Atualizar a Aplicação

```bash
# Parar serviços
./stop-docker.sh

# Atualizar código
git pull

# Reconstruir e iniciar
./start-docker.sh --clean
```

### Atualizar Dados

```bash
# Fazer backup primeiro
docker-compose exec db pg_dump -U admin portalservicesdb > backup-$(date +%Y%m%d).sql

# Aplicar migrações (se houver)
docker-compose exec appserver npm run db:migrate
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Consulte este README
3. Verifique as issues do projeto
4. Abra uma nova issue se necessário

## 🎯 Próximos Passos

Após o setup:

1. **Configure o frontend** para conectar na API
2. **Configure email** se necessário
3. **Configure backup automático**
4. **Configure monitoramento**
5. **Configure CI/CD** para deploy automático
