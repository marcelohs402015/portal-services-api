#!/bin/bash

# =====================================================
# Script para iniciar o ambiente Docker
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
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
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

log "🚀 Iniciando Portal Services API com Docker..."

# Verificar se o arquivo docker.env existe
if [ ! -f "docker.env" ]; then
    warning "Arquivo docker.env não encontrado. Criando arquivo padrão..."
    cp env.example docker.env
    warning "Por favor, edite o arquivo docker.env com suas configurações antes de continuar."
    exit 1
fi

# Parar containers existentes
log "🛑 Parando containers existentes..."
$DOCKER_COMPOSE down --remove-orphans

# Remover imagens antigas (opcional)
if [ "$1" = "--clean" ]; then
    log "🧹 Limpando imagens antigas..."
    $DOCKER_COMPOSE down --rmi all --volumes --remove-orphans
fi

# Construir e iniciar os serviços
log "🔨 Construindo e iniciando serviços..."
$DOCKER_COMPOSE up --build -d

# Aguardar os serviços ficarem prontos
log "⏳ Aguardando serviços ficarem prontos..."

# Aguardar o banco de dados
log "📊 Aguardando banco de dados..."
timeout=60
counter=0
while ! $DOCKER_COMPOSE exec -T db pg_isready -U admin -d portalservicesdb > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        error "Timeout aguardando banco de dados ficar pronto"
        $DOCKER_COMPOSE logs db
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo ""
success "Banco de dados está pronto!"

# Aguardar a API
log "🌐 Aguardando API ficar pronta..."
timeout=60
counter=0
while ! curl -s http://localhost:3001/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        error "Timeout aguardando API ficar pronta"
        $DOCKER_COMPOSE logs appserver
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
$DOCKER_COMPOSE ps

# Mostrar logs da API
log "📝 Últimas linhas dos logs da API:"
$DOCKER_COMPOSE logs --tail=10 appserver

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
echo "   • Ver logs: $DOCKER_COMPOSE logs -f"
echo "   • Parar serviços: $DOCKER_COMPOSE down"
echo "   • Reiniciar: $DOCKER_COMPOSE restart"
echo "   • Status: $DOCKER_COMPOSE ps"
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
