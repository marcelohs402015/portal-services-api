#!/bin/bash

echo "🔍 DIAGNÓSTICO DO SISTEMA"
echo "========================="

echo ""
echo "1. Verificando containers Docker:"
docker ps | grep postgres

echo ""
echo "2. Verificando se a porta 3001 está em uso:"
netstat -tlnp | grep 3001 || echo "Porta 3001 livre"

echo ""
echo "3. Verificando se a porta 5432 está em uso:"
netstat -tlnp | grep 5432 || echo "Porta 5432 livre"

echo ""
echo "4. Testando conexão com PostgreSQL:"
PGPASSWORD=admin psql -h localhost -p 5432 -U admin -d postalservices-db -c "SELECT 1;" 2>/dev/null && echo "✅ Conexão OK" || echo "❌ Erro na conexão"

echo ""
echo "5. Verificando tabelas no banco:"
PGPASSWORD=admin psql -h localhost -p 5432 -U admin -d postalservices-db -c "\dt" 2>/dev/null || echo "❌ Erro ao listar tabelas"

echo ""
echo "6. Verificando processos Node.js:"
ps aux | grep node | grep -v grep || echo "Nenhum processo Node.js rodando"

echo ""
echo "7. Verificando arquivos de configuração:"
ls -la appserver/.env 2>/dev/null && echo "✅ .env existe" || echo "❌ .env não existe"
ls -la env.dev && echo "✅ env.dev existe" || echo "❌ env.dev não existe"

echo ""
echo "8. Testando endpoint de health:"
curl -s http://localhost:3001/health 2>/dev/null && echo "✅ Servidor respondendo" || echo "❌ Servidor não responde"

echo ""
echo "DIAGNÓSTICO CONCLUÍDO"
