# =====================================================
# Portal Services API - Dockerfile para Produção
# =====================================================

# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Criar diretório de logs
RUN mkdir -p logs

# Compilar TypeScript
RUN npm run build

# Expor porta (Render usa PORT do env)
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["node", "appserver/dist/server.js"]
