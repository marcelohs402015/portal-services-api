/**
 * Portal Services API - Configuration
 * Configuração centralizada para identificação da API pelo frontend
 */

const config = {
  // URLs da API
  api: {
    // URL base da API (produção)
    baseUrl: process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:3001',
    
    // URL para o frontend (pode ser diferente da API)
    frontendUrl: process.env.FRONTEND_URL || process.env.API_URL || 'http://localhost:3001',
    
    // URL completa da API
    fullUrl: process.env.API_URL || 'http://localhost:3001',
    
    // Ambiente
    environment: process.env.NODE_ENV || 'development',
    
    // Versão da API
    version: '2.0.0'
  },
  
  // Endpoints da API
  endpoints: {
    // Informações da API
    info: '/api/info',
    health: '/health',
    apiHealth: '/api/health',
    
    // CRUD Endpoints
    categories: '/api/categories',
    clients: '/api/clients',
    services: '/api/services',
    quotations: '/api/quotations',
    appointments: '/api/appointments',
    emails: '/api/emails',
    
    // Estatísticas
    stats: {
      business: '/api/stats/business',
      dashboard: '/api/stats/dashboard'
    }
  },
  
  // Features disponíveis
  features: process.env.FEATURES ? process.env.FEATURES.split(',') : [
    'email-management',
    'service-management', 
    'quotations'
  ],
  
  // Configurações de CORS
  cors: {
    origin: process.env.FRONTEND_URL || process.env.API_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // Configurações de segurança
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production'
  }
};

// Função para obter URL completa de um endpoint
config.getEndpointUrl = function(endpoint) {
  return `${this.api.baseUrl}${endpoint}`;
};

// Função para obter informações completas da API
config.getApiInfo = function() {
  return {
    name: 'Portal Services API',
    version: this.api.version,
    environment: this.api.environment,
    apiUrl: this.api.baseUrl,
    baseUrl: this.api.baseUrl,
    frontendUrl: this.api.frontendUrl,
    endpoints: this.endpoints,
    features: this.features,
    cors: this.cors,
    timestamp: new Date().toISOString()
  };
};

// Função para verificar se é ambiente de produção
config.isProduction = function() {
  return this.api.environment === 'production';
};

// Função para verificar se é ambiente de desenvolvimento
config.isDevelopment = function() {
  return this.api.environment === 'development';
};

module.exports = config;
