#!/bin/bash

# Script de Deploy para Render
# Automatiza o processo de deploy com validações

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy para Render..."

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
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se Dockerfile.render existe
if [ ! -f "Dockerfile.render" ]; then
    error "Dockerfile.render não encontrado"
    exit 1
fi

log "Verificando pré-requisitos..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado"
    exit 1
fi

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    error "git não está instalado"
    exit 1
fi

success "Pré-requisitos verificados"

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warning "Há mudanças não commitadas. Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deploy cancelado"
        exit 0
    fi
fi

# Verificar se estamos na branch principal
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    warning "Você não está na branch principal ($current_branch). Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deploy cancelado"
        exit 0
    fi
fi

log "Executando testes de configuração..."

# Executar teste de configuração
if ! npm run test:render-config; then
    error "Testes de configuração falharam"
    log "Corrija os problemas antes de continuar"
    exit 1
fi

success "Testes de configuração passaram"

log "Preparando build..."

# Instalar dependências
log "Instalando dependências..."
npm install

# Build da aplicação
log "Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "appserver/dist" ]; then
    error "Build falhou - diretório dist não encontrado"
    exit 1
fi

success "Build concluído"

# Testar Dockerfile.render localmente (opcional)
if command -v docker &> /dev/null; then
    log "Testando Dockerfile.render..."
    if docker build -f Dockerfile.render -t portal-services-render-test .; then
        success "Dockerfile.render testado com sucesso"
        docker rmi portal-services-render-test 2>/dev/null || true
    else
        error "Falha ao testar Dockerfile.render"
        exit 1
    fi
else
    warning "Docker não encontrado - pulando teste do Dockerfile"
fi

# Verificar se há commits para push
if [ -z "$(git log origin/$current_branch..HEAD 2>/dev/null)" ]; then
    warning "Não há commits novos para push"
    log "Deseja fazer push mesmo assim? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deploy cancelado"
        exit 0
    fi
fi

# Fazer push para o repositório
log "Fazendo push para o repositório..."
git push origin "$current_branch"

success "Push concluído"

# Instruções finais
echo ""
echo "🎉 Deploy iniciado com sucesso!"
echo ""
echo "📋 Próximos passos no Render:"
echo "1. Acesse o painel do Render"
echo "2. Verifique se o build está em andamento"
echo "3. Configure as variáveis de ambiente:"
echo "   - DATABASE_URL (do banco PostgreSQL do Render)"
echo "   - NODE_ENV=production"
echo "   - PORT=3001"
echo "4. Aguarde o deploy ser concluído"
echo "5. Execute o script de inicialização do banco:"
echo "   npm run init-db:production"
echo ""
echo "🔍 Para monitorar o deploy:"
echo "- Acesse os logs no painel do Render"
echo "- Teste o health check: https://your-app.onrender.com/health"
echo ""
echo "📚 Documentação completa: DEPLOY_RENDER_NEW_STRATEGY.md"

success "Deploy script concluído!"
