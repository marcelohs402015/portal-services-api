#!/bin/bash

# =====================================================
# Portal Services - Docker Environment Startup Script
# =====================================================

set -e

echo "🚀 Iniciando ambiente Docker do Portal Services..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está rodando
log_info "Verificando se Docker está rodando..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi
log_success "Docker está rodando"

# Verificar se docker-compose está disponível
log_info "Verificando docker-compose..."
if ! command -v docker-compose &> /dev/null; then
    log_error "docker-compose não encontrado. Por favor, instale o docker-compose."
    exit 1
fi
log_success "docker-compose disponível"

# Parar containers existentes se houver
log_info "Parando containers existentes..."
docker-compose down --remove-orphans || true

# Remover volumes órfãos
log_info "Limpando volumes órfãos..."
docker volume prune -f || true

# Construir e iniciar os serviços
log_info "Construindo e iniciando serviços..."
docker-compose up --build -d

# Aguardar os serviços ficarem prontos
log_info "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
log_info "Verificando status dos containers..."
docker-compose ps

# Testar conexão com o banco
log_info "Testando conexão com o banco de dados..."
if node test-database-connection.js; then
    log_success "Conexão com banco de dados OK"
else
    log_warning "Problema na conexão com banco de dados"
fi

# Mostrar logs dos serviços
log_info "Mostrando logs dos serviços (últimas 20 linhas)..."
echo "=================================================="
docker-compose logs --tail=20

echo ""
echo "=================================================="
log_success "Ambiente Docker iniciado com sucesso!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs:     docker-compose logs -f"
echo "   Parar:        docker-compose down"
echo "   Reiniciar:    docker-compose restart"
echo "   Status:       docker-compose ps"
echo ""
echo "🔍 Testar APIs:"
echo "   Health:       curl http://localhost:3001/health"
echo "   Categories:   curl http://localhost:3001/api/categories"
echo ""
echo "=================================================="
