#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST RUNNER - Portal Services Backend\n');
console.log('=' .repeat(50));

// Função para executar comando e capturar output
function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    
    const child = spawn(command, args, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Função para extrair estatísticas do Jest
function extractJestStats(output) {
  const lines = output.split('\n');
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: []
  };

  for (const line of lines) {
    // Extrai estatísticas totais
    if (line.includes('Test Suites:')) {
      const match = line.match(/Test Suites: (\d+) failed, (\d+) passed, (\d+) total/);
      if (match) {
        stats.failed = parseInt(match[1]);
        stats.passed = parseInt(match[2]);
        stats.total = parseInt(match[3]);
      }
    }

    // Extrai falhas individuais
    if (line.includes('✕') && line.includes('should')) {
      stats.failures.push(line.trim());
    }
  }

  return stats;
}

// Função para mostrar resumo de falhas
function showFailures(failures, testType) {
  if (failures.length === 0) return;

  console.log(`\n❌ ${failures.length} falha(s) em ${testType}:`);
  console.log('-'.repeat(40));
  
  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure}`);
  });
}

// Função principal
async function runAllTests() {
  const results = {
    integration: null,
    unit: null,
    coverage: null
  };

  try {
    // 1. Testes de Integração
    results.integration = await runCommand('node', [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--testPathPattern=integration',
      '--verbose',
      '--no-coverage'
    ], 'Executando testes de integração');

    // 2. Testes Unitários
    results.unit = await runCommand('node', [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--testPathPattern=unit',
      '--verbose',
      '--no-coverage'
    ], 'Executando testes unitários');

    // 3. Testes com Cobertura
    results.coverage = await runCommand('node', [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--coverage',
      '--verbose'
    ], 'Executando testes com cobertura');

    // Análise dos resultados
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO COMPLETO DOS TESTES');
    console.log('='.repeat(50));

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    let allFailures = [];

    // Processa resultados de integração
    if (results.integration) {
      const stats = extractJestStats(results.integration.stdout + results.integration.stderr);
      console.log(`\n🔗 Testes de Integração:`);
      console.log(`   ✅ Passaram: ${stats.passed}`);
      console.log(`   ❌ Falharam: ${stats.failed}`);
      console.log(`   📊 Total: ${stats.total}`);
      
      totalPassed += stats.passed;
      totalFailed += stats.failed;
      totalTests += stats.total;
      allFailures.push(...stats.failures.map(f => `[INTEGRATION] ${f}`));
    }

    // Processa resultados unitários
    if (results.unit) {
      const stats = extractJestStats(results.unit.stdout + results.unit.stderr);
      console.log(`\n🧩 Testes Unitários:`);
      console.log(`   ✅ Passaram: ${stats.passed}`);
      console.log(`   ❌ Falharam: ${stats.failed}`);
      console.log(`   📊 Total: ${stats.total}`);
      
      totalPassed += stats.passed;
      totalFailed += stats.failed;
      totalTests += stats.total;
      allFailures.push(...stats.failures.map(f => `[UNIT] ${f}`));
    }

    // Estatísticas gerais
    console.log('\n' + '='.repeat(50));
    console.log('📈 ESTATÍSTICAS GERAIS');
    console.log('='.repeat(50));
    console.log(`   ✅ Total Passaram: ${totalPassed}`);
    console.log(`   ❌ Total Falharam: ${totalFailed}`);
    console.log(`   📊 Total de Testes: ${totalTests}`);
    console.log(`   📊 Taxa de Sucesso: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);

    // Status geral
    if (totalFailed === 0) {
      console.log('\n🎉 STATUS: TODOS OS TESTES PASSARAM!');
    } else {
      console.log('\n⚠️  STATUS: ALGUNS TESTES FALHARAM');
    }

    // Mostra falhas se houver
    if (allFailures.length > 0) {
      console.log('\n' + '='.repeat(50));
      console.log('❌ LISTA DE FALHAS');
      console.log('='.repeat(50));
      
      allFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
      });
    }

    // Informações de cobertura se disponível
    if (results.coverage && results.coverage.code === 0) {
      console.log('\n' + '='.repeat(50));
      console.log('📊 INFORMAÇÕES DE COBERTURA');
      console.log('='.repeat(50));
      console.log('Verifique o arquivo coverage/lcov-report/index.html para detalhes completos');
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
  }
}

// Executa o script
runAllTests();
