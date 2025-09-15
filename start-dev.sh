#!/bin/bash

# Portal Services API - Development Startup Script
# Este script inicia o ambiente de desenvolvimento completo com Docker

set -e

echo "🚀 Iniciando Portal Services API - Ambiente de Desenvolvimento"
echo "=============================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

log_info "Docker está rodando ✓"

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    log_error "docker-compose não está instalado. Por favor, instale o docker-compose."
    exit 1
fi

log_info "docker-compose está disponível ✓"

# Parar containers existentes se estiverem rodando
log_info "Parando containers existentes..."
docker-compose down > /dev/null 2>&1 || true

# Limpar volumes se solicitado
if [ "$1" = "--clean" ]; then
    log_warning "Limpando volumes e cache do Docker..."
    docker-compose down -v > /dev/null 2>&1 || true
    docker system prune -f > /dev/null 2>&1 || true
    log_success "Limpeza concluída"
fi

# Verificar se as dependências estão instaladas
log_info "Verificando dependências..."

if [ ! -d "appserver/node_modules" ]; then
    log_warning "Dependências do servidor não encontradas. Instalando..."
    cd appserver && npm install && cd ..
    log_success "Dependências do servidor instaladas ✓"
else
    log_success "Dependências do servidor encontradas ✓"
fi

# Iniciar os serviços
log_info "Iniciando serviços com Docker Compose..."
echo ""

# Mostrar status dos serviços
docker-compose up --build

# Se chegou aqui, os serviços foram parados
log_info "Serviços parados. Use 'npm run dev:logs' para ver logs ou 'npm run dev:detached' para rodar em background."
