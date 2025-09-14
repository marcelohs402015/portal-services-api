#!/bin/bash

# =====================================================
# Portal Services - Verificação de Deploy no Render
# =====================================================

set -e

echo "🔍 Verificando configuração para deploy no Render.com"
echo "====================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log colorido
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[✅]${NC} $1"; }
warning() { echo -e "${YELLOW}[⚠️]${NC} $1"; }
error() { echo -e "${RED}[❌]${NC} $1"; }

# Contador de erros
ERRORS=0

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        success "Arquivo encontrado: $1"
        return 0
    else
        error "Arquivo não encontrado: $1"
        ((ERRORS++))
        return 1
    fi
}

# Função para verificar comando
check_command() {
    if command -v "$1" &> /dev/null; then
        success "Comando disponível: $1"
        return 0
    else
        error "Comando não encontrado: $1"
        ((ERRORS++))
        return 1
    fi
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências do projeto..."
    
    # Verificar package.json do backend
    if check_file "appserver/package.json"; then
        if grep -q '"build"' appserver/package.json; then
            success "Script de build encontrado no backend"
        else
            error "Script de build não encontrado no backend"
            ((ERRORS++))
        fi
        
        if grep -q '"start"' appserver/package.json; then
            success "Script de start encontrado no backend"
        else
            error "Script de start não encontrado no backend"
            ((ERRORS++))
        fi
    fi
    
    # Verificar package.json do frontend
    if check_file "appclient/package.json"; then
        if grep -q '"build"' appclient/package.json; then
            success "Script de build encontrado no frontend"
        else
            error "Script de build não encontrado no frontend"
            ((ERRORS++))
        fi
    fi
}

# Função para verificar render.yaml
check_render_config() {
    log "Verificando configuração do render.yaml..."
    
    if check_file "render.yaml"; then
        # Verificar se tem database
        if grep -q "databases:" render.yaml; then
            success "Configuração de banco de dados encontrada"
        else
            error "Configuração de banco de dados não encontrada"
            ((ERRORS++))
        fi
        
        # Verificar se tem backend service
        if grep -q "portal-services-backend" render.yaml; then
            success "Serviço backend configurado"
        else
            error "Serviço backend não configurado"
            ((ERRORS++))
        fi
        
        # Verificar se tem frontend service
        if grep -q "portal-services-frontend" render.yaml; then
            success "Serviço frontend configurado"
        else
            error "Serviço frontend não configurado"
            ((ERRORS++))
        fi
        
        # Verificar variáveis de ambiente essenciais
        if grep -q "JWT_SECRET" render.yaml; then
            success "JWT_SECRET configurado"
        else
            error "JWT_SECRET não configurado"
            ((ERRORS++))
        fi
        
        if grep -q "SESSION_SECRET" render.yaml; then
            success "SESSION_SECRET configurado"
        else
            error "SESSION_SECRET não configurado"
            ((ERRORS++))
        fi
    fi
}

# Função para testar build local
test_build() {
    log "Testando build local..."
    
    # Testar build do backend
    if [ -d "appserver" ]; then
        log "Testando build do backend..."
        cd appserver
        if npm run build > /dev/null 2>&1; then
            success "Build do backend funcionando"
        else
            error "Build do backend falhou"
            ((ERRORS++))
        fi
        cd ..
    fi
    
    # Testar build do frontend
    if [ -d "appclient" ]; then
        log "Testando build do frontend..."
        cd appclient
        if npm run build > /dev/null 2>&1; then
            success "Build do frontend funcionando"
        else
            error "Build do frontend falhou"
            ((ERRORS++))
        fi
        cd ..
    fi
}

# Função para verificar estrutura do projeto
check_project_structure() {
    log "Verificando estrutura do projeto..."
    
    # Verificar diretórios principais
    local dirs=("appserver" "appclient" "docs")
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            success "Diretório encontrado: $dir"
        else
            error "Diretório não encontrado: $dir"
            ((ERRORS++))
        fi
    done
    
    # Verificar arquivos importantes
    local files=("package.json" "README.md")
    for file in "${files[@]}"; do
        check_file "$file"
    done
}

# Função para mostrar próximos passos
show_next_steps() {
    echo ""
    echo "====================================================="
    if [ $ERRORS -eq 0 ]; then
        success "🎉 Todas as verificações passaram!"
        echo ""
        echo "📋 Próximos passos para deploy:"
        echo "1. 🔑 Substitua a chave da API do Google no render.yaml"
        echo "2. 📤 Faça commit e push para o GitHub:"
        echo "   git add ."
        echo "   git commit -m 'Deploy para produção'"
        echo "   git push origin main"
        echo "3. 🚀 Acesse render.com e crie um Blueprint"
        echo "4. 🔗 Conecte seu repositório GitHub"
        echo "5. ⚙️  Configure as variáveis de ambiente"
        echo "6. 🎯 Execute o deploy"
        echo ""
        echo "📖 Consulte DEPLOY-RENDER.md para instruções detalhadas"
    else
        error "❌ Encontrados $ERRORS erro(s) que precisam ser corrigidos"
        echo ""
        echo "🔧 Corrija os erros acima antes de fazer o deploy"
    fi
    echo "====================================================="
}

# Executar verificações
main() {
    check_project_structure
    check_dependencies
    check_render_config
    test_build
    show_next_steps
    
    exit $ERRORS
}

# Executar função principal
main "$@"
