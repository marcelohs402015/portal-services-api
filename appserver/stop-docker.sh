#!/bin/bash

# =====================================================
# Script para parar o ambiente Docker
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

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado."
    exit 1
fi

# Função para verificar se o Docker Compose está disponível
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    elif docker compose version &> /dev/null; then
        echo "docker compose"
    else
        error "Docker Compose não encontrado"
        exit 1
    fi
}

DOCKER_COMPOSE=$(check_docker_compose)

log "🛑 Parando Portal Services API..."

# Verificar se os containers estão rodando
if ! $DOCKER_COMPOSE ps -q | grep -q .; then
    warning "Nenhum container está rodando."
    exit 0
fi

# Mostrar containers que serão parados
log "📋 Containers que serão parados:"
$DOCKER_COMPOSE ps

# Parar containers
log "⏹️  Parando containers..."
$DOCKER_COMPOSE down

# Verificar se foi solicitada limpeza completa
if [ "$1" = "--clean" ]; then
    log "🧹 Limpando volumes e imagens..."
    $DOCKER_COMPOSE down --volumes --rmi all --remove-orphans
    success "Limpeza completa realizada!"
elif [ "$1" = "--volumes" ]; then
    log "🗑️  Removendo volumes..."
    $DOCKER_COMPOSE down --volumes
    success "Volumes removidos!"
else
    success "Containers parados (dados preservados)!"
fi

# Verificar se ainda há containers rodando
if $DOCKER_COMPOSE ps -q | grep -q .; then
    warning "Alguns containers ainda estão rodando:"
    $DOCKER_COMPOSE ps
else
    success "Todos os containers foram parados com sucesso!"
fi

echo ""
echo -e "${GREEN}📊 Status Final:${NC}"
$DOCKER_COMPOSE ps

echo ""
echo -e "${GREEN}💡 Dicas:${NC}"
echo "   • Para iniciar novamente: ./start-docker.sh"
echo "   • Para limpeza completa: ./stop-docker.sh --clean"
echo "   • Para remover volumes: ./stop-docker.sh --volumes"
echo ""

log "✅ Operação concluída!"
