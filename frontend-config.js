/**
 * Portal Services API - Frontend Configuration
 * Configuração para o frontend identificar e usar a API
 */

// Configuração da API
const API_CONFIG = {
  // URL base da API (produção)
  BASE_URL: 'https://portal-services-api.onrender.com',
  
  // URLs alternativas para desenvolvimento
  DEV_URL: 'http://localhost:3001',
  
  // Endpoints da API
  ENDPOINTS: {
    // Informações da API
    INFO: '/api/info',
    HEALTH: '/health',
    API_HEALTH: '/api/health',
    
    // CRUD Endpoints
    CATEGORIES: '/api/categories',
    CLIENTS: '/api/clients',
    SERVICES: '/api/services',
    QUOTATIONS: '/api/quotations',
    APPOINTMENTS: '/api/appointments',
    EMAILS: '/api/emails',
    
    // Estatísticas
    STATS: {
      BUSINESS: '/api/stats/business',
      DASHBOARD: '/api/stats/dashboard'
    }
  },
  
  // Configurações de requisição
  REQUEST_CONFIG: {
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};

// Função para obter a URL base da API
function getApiBaseUrl() {
  // Verificar se estamos em produção ou desenvolvimento
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
  
  return isProduction ? API_CONFIG.BASE_URL : API_CONFIG.DEV_URL;
}

// Função para obter URL completa de um endpoint
function getApiUrl(endpoint) {
  return `${getApiBaseUrl()}${endpoint}`;
}

// Função para fazer requisições para a API
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Função para obter informações da API
async function getApiInfo() {
  return await apiRequest(API_CONFIG.ENDPOINTS.INFO);
}

// Função para verificar se a API está funcionando
async function checkApiHealth() {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.API_HEALTH);
    return response.success;
  } catch (error) {
    return false;
  }
}

// Exemplo de uso para diferentes frameworks

// Para React
const ReactApiService = {
  // Obter informações da API
  getApiInfo: getApiInfo,
  
  // Verificar saúde da API
  checkHealth: checkApiHealth,
  
  // CRUD de Categorias
  categories: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.CATEGORIES),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // CRUD de Clientes
  clients: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.CLIENTS),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.CLIENTS, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // CRUD de Serviços
  services: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.SERVICES),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.SERVICES, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // CRUD de Orçamentos
  quotations: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.QUOTATIONS),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.QUOTATIONS}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.QUOTATIONS, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.QUOTATIONS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.QUOTATIONS}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // CRUD de Agendamentos
  appointments: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // CRUD de Emails
  emails: {
    list: () => apiRequest(API_CONFIG.ENDPOINTS.EMAILS),
    get: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.EMAILS}/${id}`),
    create: (data) => apiRequest(API_CONFIG.ENDPOINTS.EMAILS, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`${API_CONFIG.ENDPOINTS.EMAILS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`${API_CONFIG.ENDPOINTS.EMAILS}/${id}`, {
      method: 'DELETE'
    })
  },
  
  // Estatísticas
  stats: {
    business: () => apiRequest(API_CONFIG.ENDPOINTS.STATS.BUSINESS),
    dashboard: () => apiRequest(API_CONFIG.ENDPOINTS.STATS.DASHBOARD)
  }
};

// Exportar para uso em diferentes ambientes
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    API_CONFIG,
    getApiBaseUrl,
    getApiUrl,
    apiRequest,
    getApiInfo,
    checkApiHealth,
    ReactApiService
  };
} else if (typeof window !== 'undefined') {
  // Browser
  window.PortalServicesAPI = {
    API_CONFIG,
    getApiBaseUrl,
    getApiUrl,
    apiRequest,
    getApiInfo,
    checkApiHealth,
    ReactApiService
  };
}

// Exemplo de uso:
/*
// Verificar informações da API
const apiInfo = await getApiInfo();
console.log('API Info:', apiInfo);

// Verificar saúde da API
const isHealthy = await checkApiHealth();
console.log('API Health:', isHealthy);

// Listar categorias
const categories = await ReactApiService.categories.list();
console.log('Categories:', categories);

// Criar nova categoria
const newCategory = await ReactApiService.categories.create({
  name: 'Nova Categoria',
  description: 'Descrição da categoria',
  color: '#FF6B6B'
});
console.log('New Category:', newCategory);
*/
