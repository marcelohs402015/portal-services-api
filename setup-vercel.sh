#!/bin/bash

# Portal Services - Vercel Setup Script
# Este script ajuda a configurar o projeto para deploy no Vercel

echo "🚀 Portal Services - Vercel Setup"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ] || [ ! -d "appserver" ] || [ ! -d "appclient" ]; then
    print_error "Execute este script na raiz do projeto portal-services"
    exit 1
fi

print_info "Verificando estrutura do projeto..."

# Verificar arquivos necessários
required_files=(
    "appserver/package.json"
    "appserver/server.ts"
    "appclient/package.json"
    "appserver/vercel.json"
    "appclient/vercel.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Arquivo encontrado: $file"
    else
        print_error "Arquivo não encontrado: $file"
        exit 1
    fi
done

print_info "Estrutura do projeto verificada com sucesso!"

echo ""
echo "📋 Próximos passos para deploy no Vercel:"
echo "=========================================="

echo ""
print_info "1. CONFIGURAR BANCO DE DADOS"
echo "   - Escolha um provedor: Neon, Supabase ou Railway"
echo "   - Crie um banco PostgreSQL"
echo "   - Copie a connection string"

echo ""
print_info "2. DEPLOY DA API (Backend)"
echo "   - Acesse vercel.com"
echo "   - New Project → Conecte GitHub"
echo "   - Root Directory: appserver"
echo "   - Configure variáveis de ambiente"
echo "   - Deploy"

echo ""
print_info "3. DEPLOY DO FRONTEND (React)"
echo "   - New Project → Mesmo repositório"
echo "   - Root Directory: appclient"
echo "   - Configure REACT_APP_API_URL"
echo "   - Deploy"

echo ""
print_info "4. ATUALIZAR CORS"
echo "   - Atualize CORS_ORIGIN na API"
echo "   - Redeploy da API"

echo ""
print_info "5. CONFIGURAR BANCO"
echo "   - Execute migrations"
echo "   - Teste conexão"

echo ""
print_warning "IMPORTANTE:"
echo "- Configure todas as variáveis de ambiente no Vercel"
echo "- Use HTTPS para todas as URLs"
echo "- Teste cada etapa antes de prosseguir"

echo ""
print_info "Documentação completa: DEPLOY_VERCEL.md"
print_info "Configuração de banco: database-config.md"

echo ""
echo "🎯 Checklist rápido:"
echo "===================="
echo "□ Banco PostgreSQL configurado"
echo "□ API deployada no Vercel"
echo "□ Frontend deployado no Vercel"
echo "□ CORS configurado"
echo "□ Variáveis de ambiente configuradas"
echo "□ Database migrations executadas"
echo "□ Health check funcionando"

echo ""
print_status "Setup concluído! Boa sorte com o deploy! 🚀"
