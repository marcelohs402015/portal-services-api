#!/bin/bash

# Portal Services API - Blueprint Deploy Script
# Script para facilitar o deploy usando Render Blueprint

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Função para mostrar ajuda
show_help() {
    echo "Portal Services API - Blueprint Deploy Script"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  validate    Validar configuração do Blueprint"
    echo "  prepare     Preparar para deploy (validação + build)"
    echo "  deploy      Fazer deploy completo"
    echo "  help        Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 validate    # Validar configuração"
    echo "  $0 prepare     # Preparar para deploy"
    echo "  $0 deploy      # Deploy completo"
}

# Função para validar configuração
validate_config() {
    log_step "Validando configuração do Blueprint..."
    
    # Verificar se o arquivo render.yaml existe
    if [ ! -f "render.yaml" ]; then
        log_error "Arquivo render.yaml não encontrado!"
        log_info "Use um dos arquivos de exemplo:"
        log_info "  - render-simple.yaml (configuração simples)"
        log_info "  - render-blueprint.yaml (configuração completa)"
        log_info "  - render-environments.yaml (múltiplos ambientes)"
        return 1
    fi
    
    # Executar validação
    if command -v node &> /dev/null; then
        log_info "Executando validação com Node.js..."
        node validate-blueprint.js
    else
        log_warning "Node.js não encontrado, validando manualmente..."
        
        # Validação básica
        if grep -q "type: pserv" render.yaml; then
            log_success "Serviço de banco de dados encontrado"
        else
            log_error "Serviço de banco de dados não encontrado"
            return 1
        fi
        
        if grep -q "type: web" render.yaml; then
            log_success "Serviço web encontrado"
        else
            log_error "Serviço web não encontrado"
            return 1
        fi
        
        if grep -q "buildCommand" render.yaml; then
            log_success "Comando de build configurado"
        else
            log_error "Comando de build não configurado"
            return 1
        fi
    fi
    
    log_success "Validação concluída!"
}

# Função para preparar deploy
prepare_deploy() {
    log_step "Preparando para deploy..."
    
    # Validar configuração
    validate_config
    if [ $? -ne 0 ]; then
        log_error "Validação falhou!"
        return 1
    fi
    
    # Verificar se estamos em um repositório Git
    if [ ! -d ".git" ]; then
        log_error "Não estamos em um repositório Git!"
        log_info "Execute: git init && git add . && git commit -m 'Initial commit'"
        return 1
    fi
    
    # Verificar se há mudanças não commitadas
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Há mudanças não commitadas!"
        log_info "Commit as mudanças antes de fazer deploy:"
        log_info "  git add ."
        log_info "  git commit -m 'Prepare for deploy'"
        return 1
    fi
    
    # Fazer build
    log_info "Fazendo build do projeto..."
    if npm run build; then
        log_success "Build concluído com sucesso!"
    else
        log_error "Build falhou!"
        return 1
    fi
    
    log_success "Preparação concluída!"
}

# Função para fazer deploy
deploy() {
    log_step "Iniciando deploy..."
    
    # Preparar deploy
    prepare_deploy
    if [ $? -ne 0 ]; then
        log_error "Preparação falhou!"
        return 1
    fi
    
    # Verificar se o repositório está conectado ao GitHub/GitLab
    remote_url=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -z "$remote_url" ]; then
        log_error "Repositório remoto não configurado!"
        log_info "Configure o repositório remoto:"
        log_info "  git remote add origin <URL_DO_REPOSITORIO>"
        return 1
    fi
    
    log_info "Repositório remoto: $remote_url"
    
    # Fazer push
    log_info "Fazendo push para o repositório..."
    if git push origin main || git push origin master; then
        log_success "Push concluído com sucesso!"
    else
        log_error "Push falhou!"
        return 1
    fi
    
    # Instruções para o Render
    log_success "Deploy iniciado!"
    echo ""
    log_info "Próximos passos no Render:"
    log_info "1. Acesse https://render.com"
    log_info "2. Clique em 'New +' -> 'Blueprint'"
    log_info "3. Conecte seu repositório: $remote_url"
    log_info "4. O Render detectará automaticamente o arquivo render.yaml"
    log_info "5. Clique em 'Apply' para criar os serviços"
    echo ""
    log_info "URLs que serão criadas:"
    log_info "  - API: https://portal-services-api.onrender.com"
    log_info "  - Health: https://portal-services-api.onrender.com/health"
    log_info "  - Info: https://portal-services-api.onrender.com/api/info"
}

# Função principal
main() {
    case "${1:-help}" in
        validate)
            validate_config
            ;;
        prepare)
            prepare_deploy
            ;;
        deploy)
            deploy
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Opção inválida: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
