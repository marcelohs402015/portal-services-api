#!/bin/bash

# =====================================================
# Script para iniciar o ambiente Docker (usando Docker nativo)
# Portal Services API - Sistema de Gestão de Serviços
# =====================================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🚀 Iniciando Portal Services API com Docker nativo..."

# Parar containers existentes
log "🛑 Parando containers existentes..."
docker stop portal-services-db portal-services-api 2>/dev/null || true
docker rm portal-services-db portal-services-api 2>/dev/null || true

# Criar rede se não existir
log "🌐 Criando rede..."
docker network create portal-network 2>/dev/null || true

# Iniciar banco de dados
log "📊 Iniciando banco de dados PostgreSQL..."
docker run -d \
  --name portal-services-db \
  --network portal-network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=portalservicesdb \
  -e POSTGRES_INITDB_ARGS="--encoding=UTF-8 --lc-collate=C --lc-ctype=C" \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -v $(pwd)/database/init:/docker-entrypoint-initdb.d \
  postgres:17-alpine

# Aguardar banco ficar pronto
log "⏳ Aguardando banco de dados ficar pronto..."
timeout=60
counter=0
while ! docker exec portal-services-db pg_isready -U admin -d portalservicesdb > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        error "Timeout aguardando banco de dados ficar pronto"
        docker logs portal-services-db
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo ""
success "Banco de dados está pronto!"

# Construir imagem da API
log "🔨 Construindo imagem da API..."
docker build -t portal-services-api .

# Iniciar API
log "🌐 Iniciando API..."
docker run -d \
  --name portal-services-api \
  --network portal-network \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DB_HOST=portal-services-db \
  -e DB_PORT=5432 \
  -e DB_NAME=portalservicesdb \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_SSL=false \
  -e APP_VERSION=2.0.0 \
  -e LOG_LEVEL=info \
  -p 3001:3001 \
  -v $(pwd)/logs:/app/logs \
  portal-services-api

# Aguardar API ficar pronta
log "⏳ Aguardando API ficar pronta..."
timeout=60
counter=0
while ! curl -s http://localhost:3001/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        error "Timeout aguardando API ficar pronta"
        docker logs portal-services-api
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo ""
success "API está pronta!"

# Mostrar status dos containers
log "📋 Status dos containers:"
docker ps --filter "name=portal-services"

# Mostrar logs da API
log "📝 Últimas linhas dos logs da API:"
docker logs --tail=10 portal-services-api

# Mostrar informações úteis
echo ""
success "🎉 Portal Services API iniciado com sucesso!"
echo ""
echo -e "${GREEN}📊 Informações do Sistema:${NC}"
echo "   • API: http://localhost:3001"
echo "   • Health Check: http://localhost:3001/health"
echo "   • Banco de Dados: localhost:5432"
echo "   • Usuário do BD: admin"
echo "   • Senha do BD: admin"
echo "   • Nome do BD: portalservicesdb"
echo ""
echo -e "${GREEN}🔧 Comandos Úteis:${NC}"
echo "   • Ver logs: docker logs -f portal-services-api"
echo "   • Parar serviços: docker stop portal-services-db portal-services-api"
echo "   • Status: docker ps --filter 'name=portal-services'"
echo ""
echo -e "${GREEN}🧪 Testar API:${NC}"
echo "   curl http://localhost:3001/health"
echo "   curl http://localhost:3001/api/categories"
echo "   curl http://localhost:3001/api/stats/dashboard"
echo ""

# Testar a API
log "🧪 Testando API..."
if curl -s http://localhost:3001/health | grep -q "success"; then
    success "API está respondendo corretamente!"
else
    warning "API pode não estar funcionando corretamente. Verifique os logs."
fi

log "✅ Setup concluído!"
