#!/bin/bash

echo "=== Portal Services Development Setup ==="
echo ""

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo "Checking dependencies..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"
echo ""

# Verificar se o Docker daemon está rodando
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Parar containers existentes se houver
echo "Stopping any existing containers..."
docker-compose down --remove-orphans >/dev/null 2>&1

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env 2>/dev/null || echo "No .env.example found, skipping .env creation"
fi

# Instalar dependências se necessário
echo "Installing dependencies..."
if [ ! -d "appserver/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd appserver && npm install
    cd ..
fi

if [ ! -d "appclient/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd appclient && npm install --legacy-peer-deps
    cd ..
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start the development environment, run:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - PostgreSQL database on port 5432"
echo "  - Backend API on port 3001"
echo "  - Frontend application on port 3000"
echo ""
echo "To stop the services, run:"
echo "  docker-compose down"
echo ""