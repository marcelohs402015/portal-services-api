FROM postgres:15-alpine

# Instalar extensões necessárias
RUN apk add --no-cache curl

# Copiar scripts de inicialização
COPY init/ /docker-entrypoint-initdb.d/

# Criar diretório para dados
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql/data

# Expor porta
EXPOSE 5432

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD pg_isready -U ${POSTGRES_USER:-admin} -d ${POSTGRES_DB:-dbportalservices} || exit 1

# Comando padrão
CMD ["postgres"]
