#!/usr/bin/env node

// =====================================================
// Portal Services - Test All APIs
// =====================================================

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logSuccess(`${method} ${url} - Status: ${response.status}`);
      return { success: true, data: response.data };
    } else {
      logError(`${method} ${url} - Expected: ${expectedStatus}, Got: ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    if (error.response) {
      logError(`${method} ${url} - Status: ${error.response.status} - ${error.response.data?.error || 'Error'}`);
      return { success: false, status: error.response.status, error: error.response.data };
    } else {
      logError(`${method} ${url} - Network Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function testHealthChecks() {
  logInfo('Testing Health Checks...');
  
  const results = await Promise.all([
    testEndpoint('GET', '/health'),
    testEndpoint('GET', '/api/health')
  ]);

  return results.every(r => r.success);
}

async function testCategoriesAPI() {
  logInfo('Testing Categories API...');
  
  const results = await Promise.all([
    testEndpoint('GET', '/api/categories'),
    testEndpoint('GET', '/api/categories/active'),
    testEndpoint('GET', '/api/categories/stats')
  ]);

  // Test CRUD operations
  const createResult = await testEndpoint('POST', '/api/categories', {
    name: 'Test Category',
    description: 'Category created by API test',
    color: '#FF0000',
    icon: '🧪'
  }, 201);

  if (createResult.success && createResult.data?.data?.id) {
    const categoryId = createResult.data.data.id;
    
    await testEndpoint('GET', `/api/categories/${categoryId}`);
    await testEndpoint('PUT', `/api/categories/${categoryId}`, {
      description: 'Updated description'
    });
    await testEndpoint('DELETE', `/api/categories/${categoryId}`);
  }

  return results.every(r => r.success);
}

async function testServicesAPI() {
  logInfo('Testing Services API...');
  
  const results = await Promise.all([
    testEndpoint('GET', '/api/services'),
    testEndpoint('GET', '/api/services/active'),
    testEndpoint('GET', '/api/services/requiring-quote'),
    testEndpoint('GET', '/api/services/search?q=test'),
    testEndpoint('GET', '/api/services/stats')
  ]);

  // Test CRUD operations
  const createResult = await testEndpoint('POST', '/api/services', {
    name: 'Test Service',
    description: 'Service created by API test',
    price: 100.00,
    duration: 60
  }, 201);

  if (createResult.success && createResult.data?.data?.id) {
    const serviceId = createResult.data.data.id;
    
    await testEndpoint('GET', `/api/services/${serviceId}`);
    await testEndpoint('PUT', `/api/services/${serviceId}`, {
      description: 'Updated service description'
    });
    await testEndpoint('DELETE', `/api/services/${serviceId}`);
  }

  return results.every(r => r.success);
}

async function testClientsAPI() {
  logInfo('Testing Clients API...');
  
  const results = await Promise.all([
    testEndpoint('GET', '/api/clients'),
    testEndpoint('GET', '/api/clients/active'),
    testEndpoint('GET', '/api/clients/search?q=test'),
    testEndpoint('GET', '/api/clients/stats')
  ]);

  // Test CRUD operations
  const createResult = await testEndpoint('POST', '/api/clients', {
    name: 'Test Client',
    email: 'test@example.com',
    phone: '11999999999',
    document: '12345678901',
    document_type: 'cpf'
  }, 201);

  if (createResult.success && createResult.data?.data?.id) {
    const clientId = createResult.data.data.id;
    
    await testEndpoint('GET', `/api/clients/${clientId}`);
    await testEndpoint('PUT', `/api/clients/${clientId}`, {
      phone: '11888888888'
    });
    await testEndpoint('DELETE', `/api/clients/${clientId}`);
  }

  return results.every(r => r.success);
}

async function testLegacyAPIs() {
  logInfo('Testing Legacy APIs...');
  
  const results = await Promise.all([
    testEndpoint('GET', '/api/legacy/emails'),
    testEndpoint('GET', '/api/legacy/services'),
    testEndpoint('GET', '/api/legacy/clients'),
    testEndpoint('GET', '/api/legacy/quotations'),
    testEndpoint('GET', '/api/legacy/appointments')
  ]);

  return results.every(r => r.success);
}

async function runAllAPITests() {
  log('🚀 Iniciando teste completo das APIs do Portal Services', 'bright');
  log('==================================================', 'bright');
  
  const results = {
    health: false,
    categories: false,
    services: false,
    clients: false,
    legacy: false
  };
  
  // Test Health Checks
  results.health = await testHealthChecks();
  
  // Test Categories API
  results.categories = await testCategoriesAPI();
  
  // Test Services API
  results.services = await testServicesAPI();
  
  // Test Clients API
  results.clients = await testClientsAPI();
  
  // Test Legacy APIs
  results.legacy = await testLegacyAPIs();
  
  // Resumo dos resultados
  log('\n📊 Resumo dos Testes de API:', 'bright');
  log('============================', 'bright');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSOU`);
    } else {
      logError(`${test}: FALHOU`);
    }
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 Todos os testes de API passaram!', 'green');
    log('📋 APIs disponíveis:', 'bright');
    log('   Health: GET /health, GET /api/health', 'cyan');
    log('   Categories: GET/POST/PUT/DELETE /api/categories/*', 'cyan');
    log('   Services: GET/POST/PUT/DELETE /api/services/*', 'cyan');
    log('   Clients: GET/POST/PUT/DELETE /api/clients/*', 'cyan');
    log('   Legacy: GET /api/legacy/*', 'cyan');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
    process.exit(1);
  }
}

// Executar teste
runAllAPITests().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  process.exit(1);
});
