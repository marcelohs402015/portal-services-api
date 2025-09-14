#!/bin/bash

# 🧪 Script de Execução de Testes - Portal Services
# Playwright + MCP Context7

set -e

echo "🧪 Iniciando testes do Portal Services..."
echo "📋 Projeto: Frontend com Playwright"
echo "🔧 Funcionalidades: Autenticação, Dashboard, Emails, Orçamentos, Clientes, IA Chat"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "playwright.config.ts" ]; then
    error "playwright.config.ts não encontrado. Execute este script na pasta appclient."
    exit 1
fi

# Verificar se o Playwright está instalado
if [ ! -d "node_modules/@playwright" ]; then
    warn "Playwright não encontrado. Instalando..."
    npm install --save-dev @playwright/test
    npx playwright install
fi

# Função para executar testes específicos
run_test_suite() {
    local suite_name=$1
    local test_file=$2
    
    log "Executando suite: $suite_name"
    npx playwright test "$test_file" --reporter=line
}

# Função para executar todos os testes
run_all_tests() {
    log "Executando todos os testes..."
    npx playwright test --reporter=html
}

# Função para executar testes em modo headed (com navegador visível)
run_tests_headed() {
    log "Executando testes em modo headed..."
    npx playwright test --headed --reporter=line
}

# Função para executar testes em modo debug
run_tests_debug() {
    log "Executando testes em modo debug..."
    npx playwright test --debug --reporter=line
}

# Função para gerar relatório
generate_report() {
    log "Gerando relatório de testes..."
    npx playwright show-report
}

# Função para limpar resultados anteriores
clean_results() {
    log "Limpando resultados anteriores..."
    rm -rf test-results/
    rm -rf playwright-report/
}

# Menu principal
show_menu() {
    echo ""
    echo "🎯 Escolha uma opção:"
    echo "1) Executar todos os testes"
    echo "2) Executar testes de autenticação"
    echo "3) Executar testes do dashboard"
    echo "4) Executar testes de emails"
    echo "5) Executar testes de orçamentos"
    echo "6) Executar testes de clientes"
    echo "7) Executar testes de IA Chat"
    echo "8) Executar testes de integração"
    echo "9) Executar testes em modo headed"
    echo "10) Executar testes em modo debug"
    echo "11) Gerar relatório"
    echo "12) Limpar resultados"
    echo "13) Sair"
    echo ""
}

# Loop principal
while true; do
    show_menu
    read -p "Digite sua opção (1-13): " choice
    
    case $choice in
        1)
            clean_results
            run_all_tests
            generate_report
            ;;
        2)
            run_test_suite "Autenticação" "tests/auth.spec.ts"
            ;;
        3)
            run_test_suite "Dashboard" "tests/dashboard.spec.ts"
            ;;
        4)
            run_test_suite "Emails" "tests/emails.spec.ts"
            ;;
        5)
            run_test_suite "Orçamentos" "tests/quotes.spec.ts"
            ;;
        6)
            run_test_suite "Clientes" "tests/clients.spec.ts"
            ;;
        7)
            run_test_suite "IA Chat" "tests/ai-chat.spec.ts"
            ;;
        8)
            run_test_suite "Integração" "tests/integration.spec.ts"
            ;;
        9)
            run_tests_headed
            ;;
        10)
            run_tests_debug
            ;;
        11)
            generate_report
            ;;
        12)
            clean_results
            log "Resultados limpos!"
            ;;
        13)
            log "Saindo..."
            exit 0
            ;;
        *)
            error "Opção inválida. Tente novamente."
            ;;
    esac
    
    echo ""
    read -p "Pressione Enter para continuar..."
done
