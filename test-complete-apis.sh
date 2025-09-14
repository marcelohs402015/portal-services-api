#!/bin/bash

# Script para testar todas as APIs do Postal Services Complete Server
# Uso: ./test-complete-apis.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
TIMEOUT=10

echo -e "${BLUE}🚀 Testando todas as APIs do Postal Services Complete Server${NC}"
echo -e "${BLUE}📍 Base URL: ${BASE_URL}${NC}"
echo ""

# Função para testar endpoint
test_endpoint() {
    local name="$1"
    local path="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"
    
    echo -e "${YELLOW}🔍 Testando: ${name}${NC}"
    echo -e "${YELLOW}   ${method} ${path}${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${path}" --max-time $TIMEOUT)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${path}" \
            -H "Content-Type: application/json" \
            -d "$data" --max-time $TIMEOUT)
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}${path}" \
            -H "Content-Type: application/json" \
            -d "$data" --max-time $TIMEOUT)
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "${BASE_URL}${path}" --max-time $TIMEOUT)
    fi
    
    # Extrair status code (última linha)
    status_code=$(echo "$response" | tail -n1)
    # Extrair body (todas as linhas exceto a última)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}   ✅ Status: ${status_code} (esperado: ${expected_status})${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo -e "${GREEN}   📄 Response: ${body:0:100}...${NC}"
        fi
        return 0
    else
        echo -e "${RED}   ❌ Status: ${status_code} (esperado: ${expected_status})${NC}"
        if [ -n "$body" ]; then
            echo -e "${RED}   📄 Response: ${body:0:100}...${NC}"
        fi
        return 1
    fi
}

# Contadores
success_count=0
total_count=0

echo -e "${BLUE}=== TESTANDO HEALTH ENDPOINTS ===${NC}"

# Teste 1: Health Check
total_count=$((total_count + 1))
if test_endpoint "Health Check" "/health" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 2: API Health
total_count=$((total_count + 1))
if test_endpoint "API Health" "/api/health" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO EMAILS API ===${NC}"

# Teste 3: Listar Emails
total_count=$((total_count + 1))
if test_endpoint "Listar Emails" "/api/emails" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 4: Criar Email
total_count=$((total_count + 1))
if test_endpoint "Criar Email" "/api/emails" "POST" '{"subject":"Teste","sender":"test@test.com","recipient":"client@test.com","body":"Email de teste"}' "201"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO CATEGORIES API ===${NC}"

# Teste 5: Listar Categorias
total_count=$((total_count + 1))
if test_endpoint "Listar Categorias" "/api/categories" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 6: Criar Categoria
total_count=$((total_count + 1))
if test_endpoint "Criar Categoria" "/api/categories" "POST" '{"name":"Teste API","description":"Categoria de teste","color":"#FF0000"}' "201"; then
    success_count=$((success_count + 1))
fi

# Teste 7: Buscar Categoria por ID
total_count=$((total_count + 1))
if test_endpoint "Buscar Categoria ID 1" "/api/categories/1" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO SERVICES API ===${NC}"

# Teste 8: Listar Serviços
total_count=$((total_count + 1))
if test_endpoint "Listar Serviços" "/api/services" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 9: Criar Serviço
total_count=$((total_count + 1))
if test_endpoint "Criar Serviço" "/api/services" "POST" '{"name":"Serviço Teste","description":"Descrição do serviço","price":100.00,"duration":60,"category_id":1}' "201"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO CLIENTS API ===${NC}"

# Teste 10: Listar Clientes
total_count=$((total_count + 1))
if test_endpoint "Listar Clientes" "/api/clients" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 11: Criar Cliente
total_count=$((total_count + 1))
if test_endpoint "Criar Cliente" "/api/clients" "POST" '{"name":"Cliente Teste","email":"cliente@test.com","phone":"11999999999","address":"Rua Teste, 123"}' "201"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO APPOINTMENTS API ===${NC}"

# Teste 12: Listar Agendamentos
total_count=$((total_count + 1))
if test_endpoint "Listar Agendamentos" "/api/appointments" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 13: Criar Agendamento
total_count=$((total_count + 1))
if test_endpoint "Criar Agendamento" "/api/appointments" "POST" '{"title":"Agendamento Teste","description":"Descrição do agendamento","start_date":"2024-01-01T10:00:00Z","end_date":"2024-01-01T11:00:00Z","client_id":1,"service_id":1}' "201"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO QUOTATIONS API ===${NC}"

# Teste 14: Listar Orçamentos
total_count=$((total_count + 1))
if test_endpoint "Listar Orçamentos" "/api/quotations" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Teste 15: Criar Orçamento
total_count=$((total_count + 1))
if test_endpoint "Criar Orçamento" "/api/quotations" "POST" '{"title":"Orçamento Teste","description":"Descrição do orçamento","total_amount":500.00,"client_id":1}' "201"; then
    success_count=$((success_count + 1))
fi

echo -e "\n${BLUE}=== TESTANDO STATS API ===${NC}"

# Teste 16: Estatísticas
total_count=$((total_count + 1))
if test_endpoint "Estatísticas" "/api/stats" "GET" "" "200"; then
    success_count=$((success_count + 1))
fi

# Resumo
echo ""
echo -e "${BLUE}📊 Resumo dos Testes:${NC}"
echo -e "${GREEN}✅ Sucessos: ${success_count}/${total_count}${NC}"
echo -e "${RED}❌ Falhas: $((total_count - success_count))/${total_count}${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Alguns testes falharam. Verifique os logs acima.${NC}"
    exit 1
fi
