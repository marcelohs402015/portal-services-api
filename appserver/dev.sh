#!/bin/bash

# =====================================================
# Script de Desenvolvimento - Portal Services API
# =====================================================

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Portal Services API - Desenvolvimento${NC}"
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker não está rodando. Iniciando Docker...${NC}"
    exit 1
fi

# Verificar se docker-compose está disponível
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo -e "${YELLOW}❌ Docker Compose não encontrado${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Iniciando ambiente de desenvolvimento...${NC}"

# Parar containers existentes
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# Iniciar ambiente
echo -e "${BLUE}🔨 Iniciando serviços...${NC}"
$DOCKER_COMPOSE up -d

# Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar se a API está respondendo
echo -e "${BLUE}🧪 Testando API...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ API está funcionando!${NC}"
else
    echo -e "${YELLOW}⚠️  API pode não estar pronta ainda. Aguarde alguns segundos.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Ambiente de desenvolvimento iniciado!${NC}"
echo ""
echo -e "${GREEN}📊 Informações:${NC}"
echo "   • API: http://localhost:3001"
echo "   • Health: http://localhost:3001/health"
echo "   • Banco: localhost:5432"
echo ""
echo -e "${GREEN}🔧 Comandos úteis:${NC}"
echo "   • Ver logs: $DOCKER_COMPOSE logs -f"
echo "   • Parar: $DOCKER_COMPOSE down"
echo "   • Status: $DOCKER_COMPOSE ps"
echo ""
echo -e "${GREEN}🧪 Testar APIs:${NC}"
echo "   curl http://localhost:3001/api/categories"
echo "   curl http://localhost:3001/api/clients"
echo "   curl http://localhost:3001/api/services"
echo "   curl http://localhost:3001/api/stats/dashboard"
echo ""
