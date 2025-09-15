# 🔗 Portal Services API - Integração Frontend

## 📋 Visão Geral

Este documento explica como o frontend pode identificar e integrar com a API Portal Services, padronizada com a URL `https://portal-services-api.onrender.com`.

## 🌐 URL da API

### Produção
```
https://portal-services-api.onrender.com
```

### Desenvolvimento Local
```
http://localhost:3001
```

## 🔍 Identificação da API

### Endpoint de Informações
```http
GET https://portal-services-api.onrender.com/api/info
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "name": "Portal Services API",
    "version": "2.0.0",
    "environment": "production",
    "apiUrl": "https://portal-services-api.onrender.com",
    "baseUrl": "https://portal-services-api.onrender.com",
    "frontendUrl": "https://portal-services-api.onrender.com",
    "endpoints": {
      "health": "/health",
      "apiHealth": "/api/health",
      "categories": "/api/categories",
      "clients": "/api/clients",
      "services": "/api/services",
      "quotations": "/api/quotations",
      "appointments": "/api/appointments",
      "emails": "/api/emails",
      "stats": "/api/stats"
    },
    "features": [
      "email-management",
      "service-management",
      "quotations"
    ],
    "timestamp": "2025-01-15T16:45:22.620Z"
  }
}
```

## 🛠️ Configuração do Frontend

### 1. Arquivo de Configuração

Use o arquivo `frontend-config.js` fornecido:

```javascript
// Importar configuração
import { ReactApiService, getApiInfo } from './frontend-config.js';

// Verificar informações da API
const apiInfo = await getApiInfo();
console.log('API URL:', apiInfo.data.apiUrl);
```

### 2. Detecção Automática de Ambiente

```javascript
function getApiBaseUrl() {
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
  
  return isProduction 
    ? 'https://portal-services-api.onrender.com'
    : 'http://localhost:3001';
}
```

## 📡 Endpoints da API

### Health Check
```http
GET /health
GET /api/health
```

### Categorias
```http
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Clientes
```http
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Serviços
```http
GET    /api/services
GET    /api/services/:id
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id
```

### Orçamentos
```http
GET    /api/quotations
GET    /api/quotations/:id
POST   /api/quotations
PUT    /api/quotations/:id
DELETE /api/quotations/:id
```

### Agendamentos
```http
GET    /api/appointments
GET    /api/appointments/:id
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Emails
```http
GET    /api/emails
GET    /api/emails/:id
POST   /api/emails
PUT    /api/emails/:id
DELETE /api/emails/:id
```

### Estatísticas
```http
GET    /api/stats/business
GET    /api/stats/dashboard
```

## 🧪 Exemplos de Uso

### React/JavaScript

```javascript
// Verificar informações da API
const checkApi = async () => {
  try {
    const response = await fetch('https://portal-services-api.onrender.com/api/info');
    const data = await response.json();
    console.log('API Info:', data.data);
  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
  }
};

// Listar categorias
const getCategories = async () => {
  try {
    const response = await fetch('https://portal-services-api.onrender.com/api/categories');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

// Criar nova categoria
const createCategory = async (categoryData) => {
  try {
    const response = await fetch('https://portal-services-api.onrender.com/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};
```

### Vue.js

```javascript
// Composição Vue 3
import { ref, onMounted } from 'vue';

export function useApi() {
  const apiUrl = ref('https://portal-services-api.onrender.com');
  const isLoading = ref(false);
  const error = ref(null);

  const fetchData = async (endpoint) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${apiUrl.value}${endpoint}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getCategories = () => fetchData('/api/categories');
  const getClients = () => fetchData('/api/clients');
  const getServices = () => fetchData('/api/services');

  return {
    apiUrl,
    isLoading,
    error,
    getCategories,
    getClients,
    getServices
  };
}
```

### Angular

```typescript
// Service Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://portal-services-api.onrender.com';

  constructor(private http: HttpClient) {}

  getApiInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/info`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/categories`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/categories`, category);
  }
}
```

## 🔧 Configuração de CORS

A API está configurada para aceitar requisições do frontend:

```javascript
// Configuração CORS no backend
cors: {
  origin: 'https://portal-services-api.onrender.com',
  credentials: true
}
```

## 📊 Monitoramento

### Health Check
```javascript
const checkApiHealth = async () => {
  try {
    const response = await fetch('https://portal-services-api.onrender.com/health');
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
};
```

### Logs de Requisições
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const url = `https://portal-services-api.onrender.com${endpoint}`;
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error:`, error);
    throw error;
  }
};
```

## 🚨 Tratamento de Erros

### Estrutura de Resposta de Erro
```json
{
  "success": false,
  "error": "Mensagem de erro específica"
}
```

### Tratamento no Frontend
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Erro HTTP
    console.error('Erro HTTP:', error.response.status, error.response.data);
  } else if (error.request) {
    // Erro de rede
    console.error('Erro de rede:', error.request);
  } else {
    // Outros erros
    console.error('Erro:', error.message);
  }
};
```

## 🔄 Cache e Performance

### Cache de Informações da API
```javascript
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheTimeout) {
      return item.data;
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getApiInfo() {
    const cached = this.get('api-info');
    if (cached) return cached;

    const response = await fetch('https://portal-services-api.onrender.com/api/info');
    const data = await response.json();
    this.set('api-info', data.data);
    return data.data;
  }
}
```

## 📱 Responsividade

### Detecção de Ambiente Mobile
```javascript
const isMobile = () => {
  return window.innerWidth <= 768;
};

const getApiConfig = () => {
  const baseUrl = 'https://portal-services-api.onrender.com';
  const timeout = isMobile() ? 60000 : 30000; // Mobile: 60s, Desktop: 30s
  
  return {
    baseUrl,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};
```

## 🎯 Próximos Passos

1. **Implementar no Frontend**: Use o arquivo `frontend-config.js`
2. **Configurar CORS**: Ajustar origem se necessário
3. **Implementar Cache**: Para melhor performance
4. **Monitoramento**: Configurar logs e métricas
5. **Testes**: Implementar testes de integração

---

**✨ A API está pronta para integração! Use a URL `https://portal-services-api.onrender.com` como padrão.**
