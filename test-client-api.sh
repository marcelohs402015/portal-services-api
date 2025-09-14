#!/bin/bash

echo "🚀 Testando API de Clientes - Portal Services"
echo "=============================================="

# Verificar se o servidor está rodando
echo "1. Verificando se o servidor está rodando..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Servidor está rodando"
else
    echo "❌ Servidor não está rodando"
    echo "Iniciando servidor..."
    cd appserver && DB_NAME=portalservicesdb npm run dev &
    sleep 10
fi

echo ""
echo "2. Testando criação de cliente..."

# Criar cliente
CLIENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João da Silva",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "phone_secondary": "1133333333",
    "address": "Rua das Flores, 123 - Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "document": "123.456.789-00",
    "document_type": "cpf",
    "notes": "Cliente preferencial"
  }')

echo "Resposta da criação:"
echo "$CLIENT_RESPONSE" | jq . 2>/dev/null || echo "$CLIENT_RESPONSE"

echo ""
echo "3. Testando listagem de clientes..."

# Listar clientes
CLIENTS_RESPONSE=$(curl -s http://localhost:3001/api/clients)
echo "Resposta da listagem:"
echo "$CLIENTS_RESPONSE" | jq . 2>/dev/null || echo "$CLIENTS_RESPONSE"

echo ""
echo "✅ Testes concluídos!"
