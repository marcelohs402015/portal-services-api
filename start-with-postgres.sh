#!/bin/sh
set -e

echo "🚀 Iniciando Portal Services com PostgreSQL em Docker..."

# Configurar PostgreSQL
export POSTGRES_USER=${POSTGRES_USER:-admin}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-admin}
export POSTGRES_DB=${POSTGRES_DB:-portalservicesdb}
export PGDATA=${PGDATA:-/var/lib/postgresql/data}

# Criar diretório de dados se não existir
mkdir -p $PGDATA

# Inicializar PostgreSQL se necessário
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "📊 Inicializando PostgreSQL..."
    initdb -D $PGDATA
    echo "✅ PostgreSQL inicializado"
fi

# Iniciar PostgreSQL em background
echo "🗄️ Iniciando PostgreSQL..."
postgres -D $PGDATA &
PG_PID=$!

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
until pg_isready -h localhost -p 5432; do
    echo "PostgreSQL não está pronto ainda..."
    sleep 2
done
echo "✅ PostgreSQL está pronto!"

# Executar scripts de inicialização do banco
if [ -d "/docker-entrypoint-initdb.d" ]; then
    echo "🔧 Executando scripts de inicialização..."
    for f in /docker-entrypoint-initdb.d/*.sql; do
        if [ -f "$f" ]; then
            echo "Executando: $f"
            psql -d $POSTGRES_DB -f "$f"
        fi
    done
    echo "✅ Scripts de inicialização executados"
fi

# Aguardar um pouco mais para garantir que tudo está pronto
sleep 5

# Iniciar aplicação Node.js
echo "🚀 Iniciando aplicação Node.js..."
exec node dist/server.js
