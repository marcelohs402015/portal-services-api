# Portal Services - Frontend

Interface React para o Portal Services, separada para deploy independente no Render.

## 📋 Descrição

Este serviço contém a interface web completa:
- Dashboard de estatísticas
- Gestão de clientes e serviços
- Visualização de emails e orçamentos
- Interface de configurações
- Sistema de templates

## 🚀 Deploy no Render

1. Faça upload desta pasta para um repositório Git
2. No Render Dashboard, clique em "New Static Site"
3. Conecte o repositório
4. Configure:
   - **Name**: `portal-services-frontend`
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build`
   - **Publish Directory**: `build`

## 🔧 Variáveis de Ambiente

```bash
REACT_APP_API_URL=https://portal-services-backend.onrender.com
REACT_APP_VERSION=3.1.0
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
CI=false
```

## 📁 Estrutura

```
services/frontend/
├── public/               # Arquivos públicos
├── src/                 # Código fonte React
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Hooks customizados
│   ├── services/       # Serviços de API
│   ├── config/         # Configurações
│   └── styles/         # Estilos CSS/Tailwind
├── package.json        # Dependências
├── render.yaml         # Configuração Render
└── README.md          # Este arquivo
```

## 🎨 Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado servidor
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 🔗 Páginas Principais

- `/` - Dashboard principal
- `/clients` - Gestão de clientes
- `/services` - Gestão de serviços
- `/quotations` - Orçamentos
- `/emails` - Processamento de emails
- `/stats` - Estatísticas detalhadas
- `/settings` - Configurações

## 🧪 Testes

```bash
npm test                # Testes unitários
npm run test:e2e       # Testes end-to-end (Playwright)
```

## 📦 Scripts

```bash
npm start              # Desenvolvimento
npm run build         # Build para produção
npm run typecheck     # Verificação de tipos
npm run lint          # Linting
```

## 🌐 Funcionalidades

### Dashboard
- Estatísticas em tempo real
- Gráficos de performance
- Resumo de atividades

### Gestão
- CRUD completo de clientes
- Catálogo de serviços
- Geração de orçamentos

### Emails
- Visualização de emails processados
- Categorização automática
- Templates de resposta

### Configurações
- Gestão de templates
- Configurações da IA
- Preferências do usuário