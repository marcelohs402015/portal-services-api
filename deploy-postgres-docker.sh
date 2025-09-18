#!/bin/bash

# Script de Deploy para Render com PostgreSQL em Docker
# Mantém a configuração atual do Docker Compose

set -e  # Parar em caso de erro

echo "🐳 Deploy para Render com PostgreSQL em Docker"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Verificar se estamos no diretório correto
if [ ! -f "render.yaml" ]; then
    error "render.yaml não encontrado. Execute este script na raiz do projeto"
    exit 1
fi

if [ ! -f "Dockerfile.postgres" ]; then
    error "Dockerfile.postgres não encontrado"
    exit 1
fi

if [ ! -f "start-with-postgres.sh" ]; then
    error "start-with-postgres.sh não encontrado"
    exit 1
fi

log "Verificando pré-requisitos..."

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    error "git não está instalado"
    exit 1
fi

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    error "Este não é um repositório git. Execute 'git init' primeiro"
    exit 1
fi

success "Pré-requisitos verificados"

# Verificar status do git
log "Verificando status do git..."
if [ -n "$(git status --porcelain)" ]; then
    warning "Há mudanças não commitadas:"
    git status --short
    
    echo ""
    warning "Deseja fazer commit das mudanças? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log "Fazendo commit das mudanças..."
        git add .
        git commit -m "feat: deploy with PostgreSQL in Docker on Render"
        success "Commit realizado"
    else
        warning "Continuando sem commit..."
    fi
fi

# Verificar se há commits para push
current_branch=$(git branch --show-current)
if [ -z "$(git log origin/$current_branch..HEAD 2>/dev/null)" ]; then
    warning "Não há commits novos para push"
    log "Deseja fazer push mesmo assim? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deploy cancelado"
        exit 0
    fi
fi

# Verificar se o repositório remoto está configurado
if ! git remote get-url origin &> /dev/null; then
    error "Repositório remoto não configurado"
    log "Configure o repositório remoto com:"
    log "git remote add origin https://github.com/SEU_USUARIO/portal-services-api.git"
    exit 1
fi

# Mostrar informações do repositório
log "Informações do repositório:"
echo "  - Branch atual: $current_branch"
echo "  - Repositório remoto: $(git remote get-url origin)"

# Fazer push para o repositório
log "Fazendo push para o repositório..."
git push origin "$current_branch"

success "Push concluído"

# Gerar URL de deploy
repo_url=$(git remote get-url origin)
if [[ $repo_url == *"github.com"* ]]; then
    # Extrair usuário e repositório da URL
    if [[ $repo_url == *"https://github.com/"* ]]; then
        repo_path=$(echo $repo_url | sed 's|https://github.com/||' | sed 's|\.git$||')
        deploy_url="https://render.com/deploy?repo=https://github.com/$repo_path"
    else
        deploy_url="https://render.com/deploy?repo=$repo_url"
    fi
else
    deploy_url="https://render.com"
fi

# Instruções finais
echo ""
echo "🐳 Deploy com PostgreSQL em Docker iniciado!"
echo ""
echo "📋 O que será criado no Render:"
echo "✅ Web Service com PostgreSQL em Docker"
echo "✅ Disco persistente para dados do banco"
echo "✅ API Node.js + PostgreSQL no mesmo container"
echo "✅ Inicialização automática do banco"
echo "✅ Health checks integrados"
echo ""
echo "🔧 Configuração:"
echo "  - PostgreSQL: localhost:5432"
echo "  - API: porta 10000"
echo "  - Dados persistentes: /var/lib/postgresql/data"
echo "  - Usuário: admin / admin"
echo "  - Banco: portalservicesdb"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse: $deploy_url"
echo "2. Clique em 'Deploy' para usar o render.yaml"
echo "3. Aguarde 5-10 minutos para o deploy completo"
echo "4. Teste: https://portal-services-api.onrender.com/health"
echo ""
echo "🔍 Para monitorar:"
echo "- Acesse o painel do Render"
echo "- Verifique os logs de build e deploy"
echo "- Procure por: 'PostgreSQL está pronto!'"
echo "- Procure por: 'Portal Services Server iniciado'"
echo ""
echo "📚 Documentação: DEPLOY_RENDER_YAML.md"

success "Deploy script concluído!"
echo ""
echo "🚀 Acesse agora: $deploy_url"
