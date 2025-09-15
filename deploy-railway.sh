#!/bin/bash

# 🚀 Portal Services - Deploy Railway
# Script para deploy automático no Railway

set -e

echo "🚀 Portal Services - Deploy Railway"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o git está limpo
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Commitando mudanças..."
    git add .
    git commit -m "feat: Railway deployment - Portal Services $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Verificar se há commits para push
if [ -n "$(git log origin/main..HEAD --oneline)" ]; then
    echo "📤 Enviando para GitHub..."
    git push origin main
    echo "✅ Push realizado com sucesso!"
else
    echo "ℹ️ Nenhum commit novo para enviar"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Acesse: https://railway.com/new"
echo "2. Conecte com GitHub"
echo "3. Selecione: marcelohs402015/portal-services"
echo "4. Railway detectará automaticamente:"
echo "   ✅ Backend em appserver/"
echo "   ✅ Frontend em appclient/"
echo "   ✅ PostgreSQL (criará automaticamente)"
echo ""
echo "5. Configure as variáveis de ambiente:"
echo "   - NODE_ENV=production"
echo "   - DATA_MODE=real"
echo "   - PORT=10000"
echo ""
echo "6. Railway fará deploy automático!"
echo ""
echo "🌐 Seu portal estará online em:"
echo "   https://[seu-projeto].railway.app"
echo ""
echo "✅ Deploy Railway configurado com sucesso!"
