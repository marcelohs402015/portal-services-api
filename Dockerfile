# =====================================================
# Portal Services API - Dockerfile para Produção
# =====================================================

# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (root e appserver)
COPY package*.json ./
COPY appserver/package*.json ./appserver/

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci && cd appserver && npm ci

# Copiar código fonte
COPY . .

# Copiar scripts SQL para inicialização
COPY create-tables.sql /app/
COPY seeds.sql /app/

# Criar diretório de logs
RUN mkdir -p logs

# Compilar TypeScript
RUN npm run build

# Remover devDependencies após o build para reduzir tamanho da imagem
RUN npm prune --production && cd appserver && npm prune --production

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "appserver/dist/server.js"]
