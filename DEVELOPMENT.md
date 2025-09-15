# Portal Services API - Guia de Desenvolvimento

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- npm ou yarn

### Comandos Principais

#### Desenvolvimento com Docker (Recomendado)
```bash
# Iniciar ambiente completo (PostgreSQL + API)
npm run dev

# Iniciar em background
npm run dev:detached

# Ver logs
npm run dev:logs

# Parar serviços
npm run dev:stop

# Reiniciar serviços
npm run dev:restart

# Limpar volumes e cache
npm run dev:clean
```

#### Desenvolvimento Local (sem Docker)
```bash
# Apenas banco de dados com Docker
npm run db:start

# Servidor local
npm run server:dev

# Ver logs do banco
npm run db:logs
```

## 🏗️ Arquitetura

### Serviços Docker
- **db**: PostgreSQL 17 (porta 5432)
- **api**: Portal Services API (porta 3001)

### Estrutura do Projeto
```
portal-services-api/
├── appserver/           # Backend API
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso a dados
│   ├── routes/          # Rotas da API
│   ├── database/        # Scripts de banco
│   └── Dockerfile       # Container da API
├── docker-compose.yml   # Orquestração dos serviços
└── package.json         # Scripts principais
```

## 🔧 Configuração

### Variáveis de Ambiente
As variáveis de ambiente são configuradas em:
- `appserver/docker.env` - Para ambiente Docker
- `appserver/.env` - Para desenvolvimento local

### Banco de Dados
- **Host**: localhost (desenvolvimento) / db (Docker)
- **Porta**: 5432
- **Database**: portalservicesdb
- **Usuário**: admin
- **Senha**: admin

## 📊 Monitoramento

### Health Checks
- **API**: http://localhost:3001/health
- **Database**: Verificado automaticamente pelo Docker

### Logs
```bash
# Todos os serviços
npm run dev:logs

# Apenas banco de dados
npm run db:logs

# Logs específicos
docker-compose logs -f api
docker-compose logs -f db
```

## 🛠️ Desenvolvimento

### Estrutura de Código
O projeto segue os princípios SOLID e Clean Code:

- **Controllers**: Recebem requisições e retornam respostas
- **Services**: Contêm a lógica de negócio
- **Repositories**: Gerenciam acesso aos dados
- **Types**: Definições TypeScript
- **Utils**: Funções utilitárias

### Padrões Implementados
- Injeção de dependências
- Tratamento robusto de erros
- Logs estruturados com Winston
- Validação com Zod
- Autenticação JWT

### Testes
```bash
# Executar testes
npm test

# Testes com coverage
cd appserver && npm run test:coverage

# Testes de integração
cd appserver && npm run test:integration
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Porta já em uso
```bash
# Verificar processos usando as portas
lsof -i :3001
lsof -i :5432

# Parar containers
npm run dev:stop
```

#### Problemas de banco de dados
```bash
# Reiniciar apenas o banco
npm run db:restart

# Ver logs do banco
npm run db:logs

# Conectar ao banco diretamente
docker exec -it portal-services-db psql -U admin -d portalservicesdb
```

#### Limpeza completa
```bash
# Parar e remover tudo
npm run dev:clean

# Reconstruir do zero
npm run dev
```

### Logs Importantes
- **API**: `appserver/logs/`
- **Docker**: `docker-compose logs`
- **Sistema**: `/var/log/` (Linux)

## 📝 Scripts Disponíveis

### NPM Scripts Principais
- `npm run dev` - Ambiente completo com Docker
- `npm run dev:detached` - Ambiente em background
- `npm run dev:stop` - Parar serviços
- `npm run dev:logs` - Ver logs
- `npm run dev:clean` - Limpeza completa

### Scripts de Banco
- `npm run db:start` - Iniciar apenas banco
- `npm run db:stop` - Parar banco
- `npm run db:restart` - Reiniciar banco
- `npm run db:logs` - Logs do banco

### Scripts de Desenvolvimento
- `npm run server:dev` - Servidor local
- `npm run typecheck` - Verificação TypeScript
- `npm run build` - Build de produção
- `npm test` - Executar testes

## 🔒 Segurança

### Configurações de Produção
⚠️ **IMPORTANTE**: Altere as seguintes configurações para produção:
- JWT_SECRET
- SESSION_SECRET
- Senhas do banco de dados
- Configurações de CORS

### Boas Práticas
- Validação de entrada em todas as rotas
- Sanitização de dados
- Logs sem informações sensíveis
- Rate limiting (implementar se necessário)

## 📚 Recursos Adicionais

- [Documentação da API](./appserver/API-DOCUMENTATION.md)
- [Configuração Docker](./appserver/README-Docker.md)
- [Guia de Contribuição](./CONTRIBUTING.md)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `npm run dev:logs`
2. Consulte a documentação da API
3. Verifique as issues do projeto
4. Entre em contato com a equipe de desenvolvimento
