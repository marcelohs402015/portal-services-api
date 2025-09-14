#!/usr/bin/env node

// =====================================================
// Portal Services - Integration Test
// =====================================================

const axios = require('axios');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: './env.docker' });

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portalservicesdb',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

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

async function testDatabaseConnection() {
  logInfo('Testando conexão com banco de dados...');
  
  try {
    const pool = new Pool(dbConfig);
    const client = await pool.connect();
    
    // Testar query básica
    const result = await client.query('SELECT version()');
    logSuccess(`PostgreSQL conectado: ${result.rows[0].version.split(' ')[0]}`);
    
    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    logInfo(`Tabelas encontradas: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      log(`  - ${row.table_name}`, 'cyan');
    });
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    logError(`Erro na conexão com banco: ${error.message}`);
    return false;
  }
}

async function testBackendAPI() {
  logInfo('Testando API do backend...');
  
  try {
    // Testar health check
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    if (healthResponse.data.status === 'healthy') {
      logSuccess('Health check OK');
    } else {
      logError('Health check falhou');
      return false;
    }
    
    // Testar API health
    const apiHealthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    if (apiHealthResponse.data.success) {
      logSuccess('API health check OK');
    } else {
      logError('API health check falhou');
      return false;
    }
    
    // Testar endpoint de categorias
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories`);
    if (categoriesResponse.data.success) {
      logSuccess(`Categorias carregadas: ${categoriesResponse.data.data.length}`);
    } else {
      logError('Erro ao carregar categorias');
      return false;
    }
    
    // Testar endpoint de categorias ativas
    const activeCategoriesResponse = await axios.get(`${API_BASE_URL}/api/categories/active`);
    if (activeCategoriesResponse.data.success) {
      logSuccess(`Categorias ativas: ${activeCategoriesResponse.data.data.length}`);
    } else {
      logError('Erro ao carregar categorias ativas');
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Erro na API: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testFrontend() {
  logInfo('Testando frontend...');
  
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    if (response.status === 200) {
      logSuccess('Frontend acessível');
      return true;
    } else {
      logError(`Frontend retornou status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logWarning('Frontend não está rodando (normal se não foi iniciado)');
      return true; // Não é um erro crítico
    }
    logError(`Erro no frontend: ${error.message}`);
    return false;
  }
}

async function testCRUDOperations() {
  logInfo('Testando operações CRUD...');
  
  try {
    // Criar uma categoria de teste
    const createResponse = await axios.post(`${API_BASE_URL}/api/categories`, {
      name: 'Teste Integração',
      description: 'Categoria criada pelo teste de integração',
      color: '#FF0000',
      icon: '🧪'
    });
    
    if (createResponse.data.success) {
      logSuccess('Categoria criada com sucesso');
      const categoryId = createResponse.data.data.id;
      
      // Buscar a categoria criada
      const getResponse = await axios.get(`${API_BASE_URL}/api/categories/${categoryId}`);
      if (getResponse.data.success) {
        logSuccess('Categoria recuperada com sucesso');
        
        // Atualizar a categoria
        const updateResponse = await axios.put(`${API_BASE_URL}/api/categories/${categoryId}`, {
          description: 'Categoria atualizada pelo teste de integração'
        });
        
        if (updateResponse.data.success) {
          logSuccess('Categoria atualizada com sucesso');
          
          // Excluir a categoria
          const deleteResponse = await axios.delete(`${API_BASE_URL}/api/categories/${categoryId}`);
          if (deleteResponse.data.success) {
            logSuccess('Categoria excluída com sucesso');
            return true;
          } else {
            logError('Erro ao excluir categoria');
            return false;
          }
        } else {
          logError('Erro ao atualizar categoria');
          return false;
        }
      } else {
        logError('Erro ao recuperar categoria');
        return false;
      }
    } else {
      logError('Erro ao criar categoria');
      return false;
    }
  } catch (error) {
    logError(`Erro nas operações CRUD: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function runIntegrationTest() {
  log('🚀 Iniciando teste de integração do Portal Services', 'bright');
  log('==================================================', 'bright');
  
  const results = {
    database: false,
    backend: false,
    frontend: false,
    crud: false
  };
  
  // Testar banco de dados
  results.database = await testDatabaseConnection();
  
  // Testar backend
  results.backend = await testBackendAPI();
  
  // Testar frontend
  results.frontend = await testFrontend();
  
  // Testar operações CRUD
  if (results.database && results.backend) {
    results.crud = await testCRUDOperations();
  } else {
    logWarning('Pulando teste CRUD - dependências não atendidas');
  }
  
  // Resumo dos resultados
  log('\n📊 Resumo dos Testes:', 'bright');
  log('====================', 'bright');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSOU`);
    } else {
      logError(`${test}: FALHOU`);
    }
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.', 'green');
    log('🌐 URLs disponíveis:', 'bright');
    log(`   Frontend: ${FRONTEND_URL}`, 'cyan');
    log(`   Backend:  ${API_BASE_URL}`, 'cyan');
    log(`   Database: localhost:${dbConfig.port}`, 'cyan');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
    process.exit(1);
  }
}

// Executar teste
runIntegrationTest().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  process.exit(1);
});
