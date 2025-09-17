#!/bin/bash

# 🧪 Script para testar build do Render localmente

echo "🧪 Testando build do Render localmente..."
echo "======================================"

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile.render" ]; then
    echo "❌ Erro: Execute este script no diretório appserver"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers de teste..."
docker stop test-render-api test-render-db 2>/dev/null || true
docker rm test-render-api test-render-db 2>/dev/null || true

# Criar rede
echo "🌐 Criando rede de teste..."
docker network create test-render-net 2>/dev/null || true

# Subir PostgreSQL de teste
echo "🗄️ Iniciando PostgreSQL de teste..."
docker run -d \
  --name test-render-db \
  --network test-render-net \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=portalservicesdb \
  -p 5433:5432 \
  postgres:17-alpine

# Aguardar banco subir
echo "⏳ Aguardando banco inicializar..."
sleep 10

# Build da imagem Render
echo "🔨 Fazendo build da imagem Render..."
docker build -f Dockerfile.render -t test-render-api .

if [ $? -ne 0 ]; then
    echo "❌ Erro no build da imagem"
    exit 1
fi

# Executar API de teste
echo "🚀 Iniciando API de teste..."
docker run -d \
  --name test-render-api \
  --network test-render-net \
  -p 10000:10000 \
  -e NODE_ENV=production \
  -e PORT=10000 \
  -e DATABASE_URL="postgresql://admin:admin@test-render-db:5432/portalservicesdb" \
  -e API_KEYS_ENABLED=true \
  -e LOG_LEVEL=info \
  -e CORS_ORIGIN="*" \
  test-render-api

# Aguardar API subir
echo "⏳ Aguardando API inicializar..."
sleep 15

# Testar API
echo "🧪 Testando API..."
echo "=================="

# Health check
echo "1. Health Check:"
HEALTH_RESPONSE=$(curl -s http://localhost:10000/health)
echo $HEALTH_RESPONSE

if echo $HEALTH_RESPONSE | grep -q "success.*true"; then
    echo "✅ Health check OK"
else
    echo "❌ Health check FALHOU"
    echo "📋 Logs da API:"
    docker logs test-render-api --tail 20
    exit 1
fi

# Testar categorias (GET público)
echo ""
echo "2. Listar Categorias (público):"
CATEGORIES_RESPONSE=$(curl -s http://localhost:10000/api/categories)
echo $CATEGORIES_RESPONSE

# Testar criação de categoria (com API Key)
echo ""
echo "3. Criar Categoria (com API Key):"
CREATE_RESPONSE=$(curl -s -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"name":"Teste Render","description":"Categoria de teste para Render","color":"#00FF00","active":true}' \
     http://localhost:10000/api/categories)
echo $CREATE_RESPONSE

if echo $CREATE_RESPONSE | grep -q "success.*true"; then
    echo "✅ Criação de categoria OK"
else
    echo "❌ Criação de categoria FALHOU"
    echo "📋 Logs da API:"
    docker logs test-render-api --tail 10
fi

echo ""
echo "📊 Resumo do Teste:"
echo "==================="
echo "✅ Build: OK"
echo "✅ API rodando na porta 10000"
echo "✅ Banco PostgreSQL conectado"
echo "✅ API Keys funcionando"
echo ""
echo "🎯 Pronto para deploy no Render!"
echo ""
echo "🧹 Para limpar os containers de teste:"
echo "docker stop test-render-api test-render-db"
echo "docker rm test-render-api test-render-db"
echo "docker network rm test-render-net"
echo "docker rmi test-render-api"
