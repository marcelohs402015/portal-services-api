#!/bin/bash

# =====================================================
# Portal Services - Script de Desenvolvimento
# =====================================================

set -e

echo "🚀 Iniciando Portal Services - Ambiente de Desenvolvimento"
echo "=========================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para verificar se o banco está pronto
wait_for_db() {
    log "Aguardando banco de dados ficar pronto..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec postalservices-api pg_isready -U admin -d portalservicesdb > /dev/null 2>&1; then
            success "Banco de dados está pronto!"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aguardando banco..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Banco de dados não ficou pronto em tempo hábil"
    return 1
}

# Função para limpar processos anteriores
cleanup() {
    log "Limpando processos anteriores..."
    
    # Parar containers Docker
    if docker ps | grep -q postalservices-api; then
        log "Parando container do banco..."
        docker stop postalservices-api > /dev/null 2>&1 || true
    fi
    
    # Parar processos Node.js
    pkill -f "tsx server.ts" > /dev/null 2>&1 || true
    pkill -f "react-scripts start" > /dev/null 2>&1 || true
    
    sleep 2
}

# Função para instalar dependências se necessário
install_deps() {
    log "Verificando dependências..."
    
    if [ ! -d "node_modules" ]; then
        log "Instalando dependências do projeto principal..."
        npm install
    fi
    
    if [ ! -d "appserver/node_modules" ]; then
        log "Instalando dependências do servidor..."
        cd appserver && npm install && cd ..
    fi
    
    if [ ! -d "appclient/node_modules" ]; then
        log "Instalando dependências do cliente..."
        cd appclient && npm install --legacy-peer-deps && cd ..
    fi
}

# Função para iniciar o banco de dados
start_database() {
    log "Iniciando banco de dados PostgreSQL..."
    
    cd appserver
    docker-compose up -d db
    cd ..
    
    # Aguardar o container iniciar
    sleep 5
    
    # Verificar se o banco está pronto
    if ! wait_for_db; then
        error "Falha ao iniciar banco de dados"
        exit 1
    fi
}

# Função para iniciar o servidor
start_server() {
    log "Iniciando servidor backend..."
    cd appserver
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    # Aguardar servidor iniciar
    sleep 3
    
    # Verificar se o servidor está rodando
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            success "Servidor backend está rodando em http://localhost:3001"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aguardando servidor..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Servidor backend não iniciou corretamente"
    return 1
}

# Função para iniciar o cliente
start_client() {
    log "Iniciando cliente frontend..."
    cd appclient
    npm run dev &
    CLIENT_PID=$!
    cd ..
    
    # Aguardar cliente iniciar
    sleep 5
    
    success "Cliente frontend está rodando em http://localhost:3000"
}

# Função para mostrar status
show_status() {
    echo ""
    echo "=========================================================="
    success "🎉 Portal Services está rodando!"
    echo "=========================================================="
    echo ""
    echo "📊 Status dos Serviços:"
    echo "  🗄️  Banco de Dados: http://localhost:5432 (portalservicesdb)"
    echo "  🔧 Backend API:     http://localhost:3001"
    echo "  🌐 Frontend:        http://localhost:3000"
    echo ""
    echo "📋 Comandos Úteis:"
    echo "  • Ver logs:         docker logs postalservices-api"
    echo "  • Parar sistema:    Ctrl+C"
    echo "  • Reiniciar banco:  npm run db:restart"
    echo ""
    echo "🔍 Testando APIs:"
    echo "  • Health Check:     curl http://localhost:3001/health"
    echo "  • Categorias:       curl http://localhost:3001/api/categories"
    echo "  • Clientes:         curl http://localhost:3001/api/clients"
    echo ""
    echo "=========================================================="
}

# Função para cleanup ao sair
cleanup_on_exit() {
    echo ""
    log "Parando sistema..."
    
    # Parar processos
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID > /dev/null 2>&1 || true
    fi
    
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID > /dev/null 2>&1 || true
    fi
    
    # Parar container do banco
    if docker ps | grep -q postalservices-api; then
        log "Parando banco de dados..."
        docker stop postalservices-api > /dev/null 2>&1 || true
    fi
    
    success "Sistema parado com sucesso!"
    exit 0
}

# Configurar trap para cleanup
trap cleanup_on_exit SIGINT SIGTERM

# Executar sequência de inicialização
main() {
    cleanup
    install_deps
    start_database
    start_server
    start_client
    show_status
    
    # Manter script rodando
    log "Sistema rodando... Pressione Ctrl+C para parar"
    wait
}

# Executar função principal
main "$@"
