#!/bin/bash

# =====================================================
# Portal Services - Deploy Simples no Render.com
# =====================================================

echo "🚀 Portal Services - Deploy Simples"
echo "===================================="

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 INSTRUÇÕES SIMPLES:${NC}"
echo ""
echo -e "${YELLOW}1. 🎨 FRONTEND (Static Site):${NC}"
echo "   • Acesse: https://dashboard.render.com"
echo "   • Clique: 'New +' → 'Static Site'"
echo "   • Conecte: marcelohs402015/portal-services"
echo "   • Configure:"
echo "     - Name: portal-services-frontend"
echo "     - Root Directory: appclient"
echo "     - Build Command: npm ci --legacy-peer-deps && npm run build"
echo "     - Publish Directory: build"
echo ""
echo -e "${YELLOW}2. 🔧 BACKEND (Web Service):${NC}"
echo "   • Clique: 'New +' → 'Web Service'"
echo "   • Conecte: marcelohs402015/portal-services"
echo "   • Configure:"
echo "     - Name: portal-services-backend"
echo "     - Runtime: Node"
echo "     - Root Directory: appserver"
echo "     - Start Command: npx tsx server.ts"
echo ""
echo -e "${YELLOW}3. 🔧 VARIÁVEIS DE AMBIENTE (Backend):${NC}"
echo "   • NODE_ENV=production"
echo "   • DATABASE_URL=postgresql://portal_services_db_user:mw3cpereld27I0onwD9oNMXgruyfYvNb@dpg-d33u8afdiees739si410-a.oregon-postgres.render.com/portal_services_db"
echo "   • DB_SSL=true"
echo "   • DB_HOST=dpg-d33u8afdiees739si410-a"
echo "   • DB_PORT=5432"
echo "   • DB_NAME=portal_services_db"
echo "   • DB_USER=portal_services_db_user"
echo "   • DB_PASSWORD=mw3cpereld27I0onwD9oNMXgruyfYvNb"
echo "   • JWT_SECRET=[clique em Generate]"
echo "   • SESSION_SECRET=[clique em Generate]"
echo ""
echo -e "${YELLOW}4. 🎨 VARIÁVEIS DE AMBIENTE (Frontend):${NC}"
echo "   • REACT_APP_API_URL=https://portal-services-backend.onrender.com"
echo "   • REACT_APP_ENVIRONMENT=production"
echo "   • GENERATE_SOURCEMAP=false"
echo "   • CI=false"
echo ""
echo -e "${GREEN}🎉 PRONTO! URLs FINAIS:${NC}"
echo "   • Frontend: https://portal-services-frontend.onrender.com"
echo "   • Backend: https://portal-services-backend.onrender.com"
echo ""
echo -e "${BLUE}📚 Documentação completa: DEPLOY-STATIC-SITE.md${NC}"
