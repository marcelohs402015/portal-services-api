#!/usr/bin/env node

/**
 * Health Check Script para Render.com
 * Verifica se o servidor está respondendo corretamente
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const HEALTH_PATH = '/health';
const TIMEOUT = 5000;

console.log(`🏥 Executando health check em http://${HOST}:${PORT}${HEALTH_PATH}`);

const options = {
  hostname: HOST,
  port: PORT,
  path: HEALTH_PATH,
  method: 'GET',
  timeout: TIMEOUT,
  headers: {
    'User-Agent': 'Render-HealthCheck/1.0'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health check passou:', response);
        process.exit(0);
      } catch (error) {
        console.log('✅ Health check passou (resposta não-JSON)');
        process.exit(0);
      }
    } else {
      console.log(`❌ Health check falhou - Status: ${res.statusCode}`);
      console.log(`Resposta: ${data}`);
      process.exit(1);
    }
  });
});

req.on('timeout', () => {
  console.log(`❌ Health check timeout após ${TIMEOUT}ms`);
  req.destroy();
  process.exit(1);
});

req.on('error', (error) => {
  console.log('❌ Erro no health check:', error.message);
  process.exit(1);
});

req.end();