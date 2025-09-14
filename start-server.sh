#!/bin/bash

echo "🚀 Iniciando servidor Portal Services..."

# Configurar variáveis de ambiente
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=postalservices-db
export DB_USER=admin
export DB_PASSWORD=admin
export DB_SSL=false
export NODE_ENV=development
export PORT=3001
export LOG_LEVEL=debug

echo "🔧 Configurações:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_PORT: $DB_PORT"
echo "  DB_NAME: $DB_NAME"
echo "  DB_USER: $DB_USER"
echo "  PORT: $PORT"

# Ir para o diretório do servidor
cd appserver

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🎯 Iniciando servidor..."
npm run dev
