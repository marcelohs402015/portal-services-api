# 🚀 Portal Services - Guia de Integração Frontend

## 📋 Visão Geral

Este guia mostra como integrar seu frontend React (do repositório [portal-services](https://github.com/marcelohs402015/portal-services)) com a API backend que usa **API Keys** para autenticação.

## 🔑 Sistema de Autenticação

### API Keys vs JWT
- ✅ **API Keys**: Simples, ideais para automações e integrações
- ❌ **JWT**: Removido - não é necessário para este projeto
- 🎯 **Formato**: `Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🌐 Configuração da API

### URLs da API
```javascript
// Desenvolvimento Local
const API_BASE_URL = 'http://localhost:3001/api';

// Produção (Render.com)
const API_BASE_URL = 'https://sua-api.onrender.com/api';
```

### API Key Padrão
```javascript
// Use esta API Key para desenvolvimento
const DEFAULT_API_KEY = 'psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
```

## 🔧 Configuração do Frontend

### 1. Arquivo de Configuração da API

Crie/atualize `appclient/src/config/api.js`:

```javascript
// Configuração da API
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  apiKey: process.env.REACT_APP_API_KEY || 'psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Portal-Services-Frontend/1.0'
  }
};

// Função para criar headers com autenticação
export const createAuthHeaders = (customHeaders = {}) => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${API_CONFIG.apiKey}`,
  ...customHeaders
});

// Função para fazer requisições autenticadas
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const config = {
    ...options,
    headers: createAuthHeaders(options.headers)
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default API_CONFIG;
```

### 2. Serviços da API

Crie/atualize `appclient/src/services/apiService.js`:

```javascript
import { apiRequest } from '../config/api';

// ===== CATEGORIAS =====
export const categoriesService = {
  // Listar categorias
  getAll: () => apiRequest('/categories'),
  
  // Obter categoria por ID
  getById: (id) => apiRequest(`/categories/${id}`),
  
  // Criar categoria
  create: (data) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar categoria
  update: (id, data) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar categoria
  delete: (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE'
  })
};

// ===== CLIENTES =====
export const clientsService = {
  // Listar clientes
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/clients${queryString ? `?${queryString}` : ''}`);
  },
  
  // Obter cliente por ID
  getById: (id) => apiRequest(`/clients/${id}`),
  
  // Criar cliente
  create: (data) => apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar cliente
  update: (id, data) => apiRequest(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar cliente
  delete: (id) => apiRequest(`/clients/${id}`, {
    method: 'DELETE'
  })
};

// ===== SERVIÇOS =====
export const servicesService = {
  // Listar serviços
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/services${queryString ? `?${queryString}` : ''}`);
  },
  
  // Obter serviço por ID
  getById: (id) => apiRequest(`/services/${id}`),
  
  // Criar serviço
  create: (data) => apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar serviço
  update: (id, data) => apiRequest(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar serviço
  delete: (id) => apiRequest(`/services/${id}`, {
    method: 'DELETE'
  })
};

// ===== ORÇAMENTOS =====
export const quotationsService = {
  // Listar orçamentos
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/quotations${queryString ? `?${queryString}` : ''}`);
  },
  
  // Obter orçamento por ID
  getById: (id) => apiRequest(`/quotations/${id}`),
  
  // Criar orçamento
  create: (data) => apiRequest('/quotations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar orçamento
  update: (id, data) => apiRequest(`/quotations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar orçamento
  delete: (id) => apiRequest(`/quotations/${id}`, {
    method: 'DELETE'
  })
};

// ===== AGENDAMENTOS =====
export const appointmentsService = {
  // Listar agendamentos
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/appointments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Obter agendamento por ID
  getById: (id) => apiRequest(`/appointments/${id}`),
  
  // Criar agendamento
  create: (data) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar agendamento
  update: (id, data) => apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar agendamento
  delete: (id) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE'
  })
};

// ===== EMAILS =====
export const emailsService = {
  // Listar emails
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/emails${queryString ? `?${queryString}` : ''}`);
  },
  
  // Obter email por ID
  getById: (id) => apiRequest(`/emails/${id}`),
  
  // Criar email
  create: (data) => apiRequest('/emails', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Atualizar email
  update: (id, data) => apiRequest(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Deletar email
  delete: (id) => apiRequest(`/emails/${id}`, {
    method: 'DELETE'
  })
};

// ===== ESTATÍSTICAS =====
export const statsService = {
  // Dashboard stats
  getDashboard: () => apiRequest('/stats/dashboard'),
  
  // Business stats
  getBusiness: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stats/business${queryString ? `?${queryString}` : ''}`);
  },
  
  // Revenue monthly
  getRevenueMonthly: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stats/revenue/monthly${queryString ? `?${queryString}` : ''}`);
  }
};

// ===== HEALTH CHECK =====
export const healthService = {
  // API health
  check: () => apiRequest('/health')
};
```

### 3. Hook Personalizado para API

Crie `appclient/src/hooks/useApi.js`:

```javascript
import { useState, useEffect } from 'react';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook para operações CRUD
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
```

### 4. Exemplo de Uso nos Componentes

#### Componente de Lista de Clientes

```javascript
// appclient/src/components/ClientsList.jsx
import React from 'react';
import { useApi } from '../hooks/useApi';
import { clientsService } from '../services/apiService';

const ClientsList = () => {
  const { data, loading, error, refetch } = useApi(clientsService.getAll);

  if (loading) return <div>Carregando clientes...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Clientes</h2>
      <button onClick={refetch}>Atualizar</button>
      <ul>
        {data?.data?.map(client => (
          <li key={client.id}>
            {client.name} - {client.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientsList;
```

#### Componente de Criação de Cliente

```javascript
// appclient/src/components/CreateClient.jsx
import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { clientsService } from '../services/apiService';

const CreateClient = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const { mutate, loading, error } = useApiMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutate(() => clientsService.create(formData));
      onSuccess?.();
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Criar Cliente</h3>
      {error && <div style={{color: 'red'}}>Erro: {error}</div>}
      
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      
      <textarea
        placeholder="Endereço"
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Cliente'}
      </button>
    </form>
  );
};

export default CreateClient;
```

### 5. Variáveis de Ambiente

Crie/atualize `appclient/.env`:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_KEY=psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Para produção, use:
# REACT_APP_API_URL=https://sua-api.onrender.com/api
# REACT_APP_API_KEY=sua_api_key_de_producao
```

### 6. Configuração CORS

A API já está configurada para aceitar requisições do frontend:

```javascript
// No backend (já configurado)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));
```

## 🚀 Exemplos de Integração

### Dashboard com Estatísticas

```javascript
// appclient/src/pages/Dashboard.jsx
import React from 'react';
import { useApi } from '../hooks/useApi';
import { statsService } from '../services/apiService';

const Dashboard = () => {
  const { data: dashboardStats, loading } = useApi(statsService.getDashboard);

  if (loading) return <div>Carregando dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Clientes</h3>
          <p>{dashboardStats?.data?.total_clients || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total de Serviços</h3>
          <p>{dashboardStats?.data?.total_services || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Receita Total</h3>
          <p>R$ {dashboardStats?.data?.total_revenue || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Orçamentos Pendentes</h3>
          <p>{dashboardStats?.data?.pending_quotations || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### Lista de Orçamentos com Filtros

```javascript
// appclient/src/pages/Quotations.jsx
import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { quotationsService } from '../services/apiService';

const Quotations = () => {
  const [filters, setFilters] = useState({
    status: '',
    client_id: '',
    date_from: '',
    date_to: ''
  });

  const { data, loading, error, refetch } = useApi(
    () => quotationsService.getAll(filters),
    [filters]
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h1>Orçamentos</h1>
      
      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>
        
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => handleFilterChange('date_from', e.target.value)}
          placeholder="Data Início"
        />
        
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => handleFilterChange('date_to', e.target.value)}
          placeholder="Data Fim"
        />
      </div>

      {loading && <div>Carregando orçamentos...</div>}
      {error && <div>Erro: {error}</div>}
      
      <div className="quotations-list">
        {data?.data?.map(quotation => (
          <div key={quotation.id} className="quotation-card">
            <h3>Orçamento #{quotation.id}</h3>
            <p>Cliente ID: {quotation.client_id}</p>
            <p>Total: R$ {quotation.total}</p>
            <p>Status: {quotation.status}</p>
            <p>Válido até: {new Date(quotation.valid_until).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotations;
```

## 🔧 Tratamento de Erros

### Interceptor de Erros Global

```javascript
// appclient/src/utils/errorHandler.js
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Mapear códigos de erro para mensagens amigáveis
  const errorMessages = {
    'NO_API_KEY': 'API Key não configurada',
    'INVALID_API_KEY': 'API Key inválida',
    'INSUFFICIENT_PERMISSIONS': 'Permissão insuficiente',
    'NOT_FOUND': 'Recurso não encontrado',
    'VALIDATION_ERROR': 'Dados inválidos',
    'INTERNAL_ERROR': 'Erro interno do servidor'
  };

  return errorMessages[error.code] || error.message || 'Erro desconhecido';
};

// Hook para tratamento de erros
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    const friendlyMessage = handleApiError(err);
    setError(friendlyMessage);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};
```

## 🚀 Deploy e Produção

### 1. Configuração de Produção

```bash
# appclient/.env.production
REACT_APP_API_URL=https://sua-api.onrender.com/api
REACT_APP_API_KEY=sua_api_key_de_producao
```

### 2. Build para Produção

```bash
# No diretório do frontend
cd appclient
npm run build

# O build será criado em appclient/build/
```

### 3. Deploy no Render/Vercel/Netlify

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Defina o diretório de build como `appclient`
4. Configure o comando de build: `npm run build`
5. Configure o diretório público: `appclient/build`

## 📝 Checklist de Integração

- [ ] ✅ API backend funcionando com API Keys
- [ ] ✅ Frontend configurado com serviços da API
- [ ] ✅ Hooks personalizados criados
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Tratamento de erros implementado
- [ ] ✅ CORS configurado
- [ ] ✅ Testes locais funcionando
- [ ] ✅ Build de produção testado
- [ ] ✅ Deploy configurado

## 🔍 Troubleshooting

### Problemas Comuns

1. **CORS Error**
   - Verifique se a API está rodando
   - Confirme as URLs nas variáveis de ambiente

2. **401 Unauthorized**
   - Verifique se a API Key está correta
   - Confirme o formato: `Bearer psk_xxxxx`

3. **404 Not Found**
   - Verifique se a URL da API está correta
   - Confirme se o endpoint existe

4. **Network Error**
   - Verifique se a API está acessível
   - Teste com curl: `curl http://localhost:3001/health`

### Testes Manuais

```bash
# Testar API diretamente
curl -H "Authorization: Bearer psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
     http://localhost:3001/api/categories

# Testar health check
curl http://localhost:3001/health
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Teste a API diretamente com curl
3. Verifique as variáveis de ambiente
4. Confirme se a API está rodando

**Versão da API**: 2.0.0  
**Compatibilidade Frontend**: React 18+  
**Última atualização**: 2024-01-01
