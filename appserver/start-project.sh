#!/bin/bash

# =====================================================
# Portal Services API - Script de Inicialização Completa
# =====================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    PORTAL SERVICES API                      ║"
echo "║                    Backend Completo                         ║"
echo "║                Sistema de Gestão de Serviços                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Docker
log "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi
success "Docker está funcionando"

# Verificar docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    error "Docker Compose não encontrado"
    exit 1
fi
success "Docker Compose disponível"

# Parar containers existentes
log "Parando containers existentes..."
$DOCKER_COMPOSE down --remove-orphans 2>/dev/null || true
success "Containers parados"

# Iniciar ambiente
log "Iniciando ambiente completo..."
$DOCKER_COMPOSE up -d --build
success "Ambiente iniciado"

# Aguardar serviços ficarem prontos
log "Aguardando serviços ficarem prontos..."
sleep 15

# Verificar banco de dados
log "Verificando banco de dados..."
if docker exec portal-services-db pg_isready -U admin -d portalservicesdb > /dev/null 2>&1; then
    success "Banco de dados está pronto"
else
    error "Banco de dados não está respondendo"
    exit 1
fi

# Verificar API
log "Verificando API..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        success "API está respondendo"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    error "API não está respondendo após $max_attempts tentativas"
    log "Logs da API:"
    $DOCKER_COMPOSE logs appserver
    exit 1
fi

echo ""

# Testar todas as APIs
log "Testando todas as APIs..."

# Health Check
info "Testando Health Check..."
if curl -s http://localhost:3001/health | grep -q "success"; then
    success "Health Check: OK"
else
    warning "Health Check: Falhou"
fi

# Categories API
info "Testando API de Categorias..."
categories_response=$(curl -s http://localhost:3001/api/categories)
if echo "$categories_response" | grep -q "success"; then
    category_count=$(echo "$categories_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Categorias: $category_count encontradas"
else
    warning "Categorias: Falhou"
fi

# Clients API
info "Testando API de Clientes..."
clients_response=$(curl -s http://localhost:3001/api/clients)
if echo "$clients_response" | grep -q "success"; then
    client_count=$(echo "$clients_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Clientes: $client_count encontrados"
else
    warning "Clientes: Falhou"
fi

# Services API
info "Testando API de Serviços..."
services_response=$(curl -s http://localhost:3001/api/services)
if echo "$services_response" | grep -q "success"; then
    service_count=$(echo "$services_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Serviços: $service_count encontrados"
else
    warning "Serviços: Falhou"
fi

# Quotations API
info "Testando API de Orçamentos..."
quotations_response=$(curl -s http://localhost:3001/api/quotations)
if echo "$quotations_response" | grep -q "success"; then
    quotation_count=$(echo "$quotations_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Orçamentos: $quotation_count encontrados"
else
    warning "Orçamentos: Falhou"
fi

# Appointments API
info "Testando API de Agendamentos..."
appointments_response=$(curl -s http://localhost:3001/api/appointments)
if echo "$appointments_response" | grep -q "success"; then
    appointment_count=$(echo "$appointments_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Agendamentos: $appointment_count encontrados"
else
    warning "Agendamentos: Falhou"
fi

# Emails API
info "Testando API de Emails..."
emails_response=$(curl -s http://localhost:3001/api/emails)
if echo "$emails_response" | grep -q "success"; then
    email_count=$(echo "$emails_response" | grep -o '"pagination"' | wc -l)
    success "Emails: API funcionando"
else
    warning "Emails: Falhou"
fi

# Stats API
info "Testando API de Estatísticas..."
stats_response=$(curl -s http://localhost:3001/api/stats/dashboard)
if echo "$stats_response" | grep -q "success"; then
    success "Estatísticas: OK"
else
    warning "Estatísticas: Falhou"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 PROJETO INICIADO! 🎉                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Informações do sistema
echo -e "${CYAN}📊 INFORMAÇÕES DO SISTEMA:${NC}"
echo "   • API Server: http://localhost:3001"
echo "   • Health Check: http://localhost:3001/health"
echo "   • Banco de Dados: localhost:5432"
echo "   • Usuário BD: admin"
echo "   • Senha BD: admin"
echo "   • Nome BD: portalservicesdb"
echo ""

# URLs das APIs
echo -e "${CYAN}🔗 ENDPOINTS DA API:${NC}"
echo "   • GET    /api/categories          - Listar categorias"
echo "   • GET    /api/categories/:id      - Obter categoria"
echo "   • POST   /api/categories          - Criar categoria"
echo "   • PUT    /api/categories/:id      - Atualizar categoria"
echo "   • DELETE /api/categories/:id      - Deletar categoria"
echo ""
echo "   • GET    /api/clients             - Listar clientes"
echo "   • GET    /api/clients/:id         - Obter cliente"
echo "   • POST   /api/clients             - Criar cliente"
echo "   • PUT    /api/clients/:id         - Atualizar cliente"
echo "   • DELETE /api/clients/:id         - Deletar cliente"
echo ""
echo "   • GET    /api/services            - Listar serviços"
echo "   • GET    /api/services/:id        - Obter serviço"
echo "   • POST   /api/services            - Criar serviço"
echo "   • PUT    /api/services/:id        - Atualizar serviço"
echo "   • DELETE /api/services/:id        - Deletar serviço"
echo ""
echo "   • GET    /api/quotations          - Listar orçamentos"
echo "   • GET    /api/quotations/:id      - Obter orçamento"
echo "   • POST   /api/quotations          - Criar orçamento"
echo "   • PUT    /api/quotations/:id      - Atualizar orçamento"
echo "   • DELETE /api/quotations/:id      - Deletar orçamento"
echo ""
echo "   • GET    /api/appointments        - Listar agendamentos"
echo "   • GET    /api/appointments/:id    - Obter agendamento"
echo "   • POST   /api/appointments        - Criar agendamento"
echo "   • PUT    /api/appointments/:id    - Atualizar agendamento"
echo "   • DELETE /api/appointments/:id    - Deletar agendamento"
echo ""
echo "   • GET    /api/emails              - Listar emails"
echo "   • GET    /api/emails/:id          - Obter email"
echo "   • POST   /api/emails              - Criar email"
echo "   • PUT    /api/emails/:id          - Atualizar email"
echo "   • DELETE /api/emails/:id          - Deletar email"
echo ""
echo "   • GET    /api/stats/dashboard     - Estatísticas do dashboard"
echo "   • GET    /api/stats/business      - Estatísticas do negócio"
echo ""

# Comandos úteis
echo -e "${CYAN}🔧 COMANDOS ÚTEIS:${NC}"
echo "   • Ver logs: $DOCKER_COMPOSE logs -f"
echo "   • Parar: $DOCKER_COMPOSE down"
echo "   • Status: $DOCKER_COMPOSE ps"
echo "   • Reiniciar: $DOCKER_COMPOSE restart"
echo ""

# Testes rápidos
echo -e "${CYAN}🧪 TESTES RÁPIDOS:${NC}"
echo "   curl http://localhost:3001/health"
echo "   curl http://localhost:3001/api/categories"
echo "   curl http://localhost:3001/api/stats/dashboard"
echo ""

success "Portal Services API está rodando perfeitamente!"
success "Backend completo com banco de dados funcionando!"
echo ""
