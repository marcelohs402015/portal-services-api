#!/bin/bash

# =====================================================
# Portal Services - Deploy Script for Render.com
# Sistema de gestão de serviços e orçamentos com IA
# =====================================================

echo "🚀 Portal Services - Deploy para Render.com"
echo "==========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto Portal Services"
    exit 1
fi

# Verificar se o git está configurado
if ! git status &> /dev/null; then
    error "Este não é um repositório Git válido"
    exit 1
fi

log "Verificando status do Git..."
if [ -n "$(git status --porcelain)" ]; then
    warning "Há mudanças não commitadas. Fazendo commit automático..."
    
    # Adicionar todas as mudanças
    git add .
    
    # Commit com mensagem automática
    git commit -m "feat: Deploy para Render.com - $(date +'%Y-%m-%d %H:%M:%S')"
    
    success "Mudanças commitadas automaticamente"
fi

# Verificar se estamos na branch main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    warning "Você está na branch '$current_branch'. Mudando para 'main'..."
    git checkout main
fi

log "Verificando se o repositório remoto está configurado..."
if ! git remote get-url origin &> /dev/null; then
    error "Repositório remoto 'origin' não configurado"
    echo "Configure com: git remote add origin <seu-repositorio-git>"
    exit 1
fi

# Verificar se há commits para push
if [ "$(git rev-list --count origin/main..HEAD)" -eq 0 ]; then
    warning "Não há commits novos para enviar"
else
    log "Enviando commits para o repositório remoto..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        success "Commits enviados com sucesso para o repositório remoto"
    else
        error "Falha ao enviar commits para o repositório remoto"
        exit 1
    fi
fi

# Verificar se o render.yaml existe
if [ ! -f "render.yaml" ]; then
    error "Arquivo render.yaml não encontrado"
    exit 1
fi

success "Arquivo render.yaml encontrado"

# Mostrar informações do deploy
echo ""
log "📋 Informações do Deploy:"
echo "   • Repositório: $(git remote get-url origin)"
echo "   • Branch: $(git branch --show-current)"
echo "   • Último commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
echo "   • Arquivo de configuração: render.yaml"

echo ""
log "🎯 Próximos passos no Render.com:"
echo "   1. Acesse https://dashboard.render.com"
echo "   2. Clique em 'New +' → 'Blueprint'"
echo "   3. Conecte seu repositório GitHub"
echo "   4. Selecione este repositório"
echo "   5. O Render detectará automaticamente o render.yaml"
echo "   6. Clique em 'Apply' para criar todos os serviços"

echo ""
log "📊 Serviços que serão criados:"
echo "   • 🗄️  Database: portal-services-db (PostgreSQL)"
echo "   • 🔧 Backend: portal-services-backend (Node.js API)"
echo "   • 🎨 Frontend: portal-services-frontend (React Static)"
echo "   • ⚙️  DB Setup: portal-services-db-setup (Cron Job)"
echo "   • 🔍 Health Check: portal-services-health-check (Cron Job)"

echo ""
log "🔧 Configurações importantes:"
echo "   • Runtime: Node.js"
echo "   • Plan: Starter (gratuito)"
echo "   • Region: Oregon"
echo "   • Auto-deploy: Habilitado"
echo "   • Health Check: /health"

echo ""
warning "⚠️  Lembre-se de configurar as variáveis de ambiente:"
echo "   • GMAIL_CLIENT_ID"
echo "   • GMAIL_CLIENT_SECRET" 
echo "   • GMAIL_REFRESH_TOKEN"

echo ""
success "🎉 Deploy preparado com sucesso!"
echo "   Acesse: https://dashboard.render.com"
echo "   Crie um novo Blueprint e conecte este repositório"

echo ""
log "📚 Documentação:"
echo "   • Render Blueprint: https://render.com/docs/blueprint-spec"
echo "   • Portal Services: README.md"

exit 0
