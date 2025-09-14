#!/usr/bin/env node

/**
 * Teste Simples de Endpoints - Portal Services API
 * Este script testa os endpoints básicos sem precisar do banco de dados
 */

import http from 'http';
import { URL } from 'url';

const BASE_URL = 'http://localhost:10000';
const TIMEOUT = 5000;

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Endpoint-Tester/1.0'
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', expectedStatus = 200, data = null) {
  try {
    log(`\n🔍 Testando: ${name}`, 'blue');
    log(`   ${method} ${path}`, 'yellow');
    
    const response = await makeRequest(path, method, data);
    
    if (response.statusCode === expectedStatus) {
      log(`   ✅ Status: ${response.statusCode} (esperado: ${expectedStatus})`, 'green');
      
      if (response.body) {
        log(`   📄 Response:`, 'blue');
        console.log(JSON.stringify(response.body, null, 2));
      }
      
      return { success: true, response };
    } else {
      log(`   ❌ Status: ${response.statusCode} (esperado: ${expectedStatus})`, 'red');
      if (response.body) {
        log(`   📄 Response:`, 'red');
        console.log(JSON.stringify(response.body, null, 2));
      }
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Iniciando Testes de Endpoints - Portal Services API', 'bold');
  log(`📍 Base URL: ${BASE_URL}`, 'blue');
  log(`⏱️  Timeout: ${TIMEOUT}ms`, 'blue');
  
  const results = [];
  
  // Teste 1: Health Check
  results.push(await testEndpoint(
    'Health Check',
    '/health',
    'GET',
    200
  ));
  
  // Teste 2: Mode Check
  results.push(await testEndpoint(
    'Mode Check',
    '/mode',
    'GET',
    200
  ));
  
  // Teste 3: Categories List
  results.push(await testEndpoint(
    'Categories List',
    '/api/categories',
    'GET',
    200
  ));
  
  // Teste 4: Services List
  results.push(await testEndpoint(
    'Services List',
    '/api/services',
    'GET',
    200
  ));
  
  // Teste 5: Clients List
  results.push(await testEndpoint(
    'Clients List',
    '/api/clients',
    'GET',
    200
  ));
  
  // Teste 6: Quotations List
  results.push(await testEndpoint(
    'Quotations List',
    '/api/quotations',
    'GET',
    200
  ));
  
  // Teste 7: Appointments List
  results.push(await testEndpoint(
    'Appointments List',
    '/api/appointments',
    'GET',
    200
  ));
  
  // Teste 8: Admin Status
  results.push(await testEndpoint(
    'Admin Status',
    '/api/admin/status',
    'GET',
    200
  ));
  
  // Teste 9: Chat Message
  results.push(await testEndpoint(
    'Chat Message',
    '/api/chat/message',
    'POST',
    200,
    {
      message: 'Hello, I need help with a service',
      context: {
        service_type: 'general'
      }
    }
  ));
  
  // Teste 10: 404 Error
  results.push(await testEndpoint(
    '404 Error (Non-existent endpoint)',
    '/api/nonexistent',
    'GET',
    404
  ));
  
  // Resumo dos resultados
  log('\n📊 Resumo dos Testes:', 'bold');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  log(`\n✅ Sucessos: ${successful}/${total}`, 'green');
  log(`❌ Falhas: ${total - successful}/${total}`, 'red');
  
  if (successful === total) {
    log('\n🎉 Todos os testes passaram!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
  }
  
  // Detalhes dos testes que falharam
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    log('\n🔍 Detalhes das Falhas:', 'red');
    failures.forEach((failure, index) => {
      log(`   ${index + 1}. ${failure.error || 'Status code inesperado'}`, 'red');
    });
  }
  
  log('\n🏁 Testes concluídos!', 'bold');
}

// Executa os testes
runTests().catch(error => {
  log(`\n💥 Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});
