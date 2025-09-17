#!/bin/bash

# 🚀 Portal Services API - Script de Desenvolvimento
# Este script inicia a API e o banco PostgreSQL usando Docker Compose

echo "🚀 Iniciando Portal Services API..."
echo "=================================="

# Verificar se docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erro: docker-compose.yml não encontrado"
    exit 1
fi

# Parar containers existentes (se houver)
echo "🛑 Parando containers existentes..."
docker-compose down
docker container prune -f

# Iniciar os serviços
echo "🔄 Iniciando API e Banco de Dados..."
docker-compose up -d --build

# Aguardar os serviços subirem
echo "⏳ Aguardando serviços iniciarem..."
sleep 15

# Verificar se os serviços estão rodando
echo "🔍 Verificando status dos serviços..."
docker-compose ps

# Testar a API
echo "🧪 Testando conexão com a API..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API funcionando em http://localhost:3001"
    echo "✅ Health Check: http://localhost:3001/health"
    echo "✅ Categorias: http://localhost:3001/api/categories"
    echo ""
    echo "🔑 Token de teste para Bruno/N8N:"
    echo "psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    echo ""
    echo "📋 Comandos úteis:"
    echo "  npm run dev:logs  - Ver logs em tempo real"
    echo "  npm run dev:stop  - Parar os serviços"
    echo "  npm run dev:clean - Limpar e reiniciar tudo"
else
    echo "❌ API não está respondendo. Verificando logs..."
    docker-compose logs api
fi

echo ""
echo "🎯 Desenvolvimento iniciado com sucesso!"
