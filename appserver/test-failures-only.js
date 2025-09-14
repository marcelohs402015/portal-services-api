#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Executando testes de integração...\n');

// Função para executar Jest e capturar output
function runJest() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--testPathPattern=integration',
      '--verbose',
      '--no-coverage'
    ], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, output });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Função para extrair apenas as falhas
function extractFailures(output) {
  const lines = output.split('\n');
  const failures = [];
  let currentFailure = null;
  let inFailureBlock = false;

  for (const line of lines) {
    // Detecta início de uma falha
    if (line.includes('✕') && line.includes('should')) {
      currentFailure = {
        test: line.trim(),
        error: ''
      };
      inFailureBlock = true;
      continue;
    }

    // Detecta fim de uma falha (próximo teste ou seção)
    if (inFailureBlock && (line.includes('✓') || line.includes('describe(') || line.includes('Test Suites:'))) {
      if (currentFailure) {
        failures.push(currentFailure);
      }
      currentFailure = null;
      inFailureBlock = false;
      continue;
    }

    // Coleta linhas de erro
    if (inFailureBlock && currentFailure) {
      if (line.includes('Error:') || line.includes('at ') || line.includes('expect(') || line.includes('●')) {
        currentFailure.error += line + '\n';
      }
    }
  }

  // Adiciona a última falha se ainda estiver processando
  if (inFailureBlock && currentFailure) {
    failures.push(currentFailure);
  }

  return failures;
}

// Função principal
async function showFailuresOnly() {
  try {
    const result = await runJest();

    if (result.code === 0) {
      console.log('✅ Todos os testes passaram!');
      return;
    }

    const failures = extractFailures(result.output);

    if (failures.length === 0) {
      console.log('⚠️  Testes falharam mas não foi possível extrair detalhes específicos');
      return;
    }

    console.log(`\n❌ ${failures.length} teste(s) falharam:\n`);
    console.log('='.repeat(60));

    failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.test}`);
      
      if (failure.error) {
        const errorLines = failure.error.split('\n').filter(line => line.trim());
        if (errorLines.length > 0) {
          console.log(`   Erro: ${errorLines[0].trim()}`);
        }
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`📊 Total de falhas: ${failures.length}`);

  } catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
  }
}

// Executa o script
showFailuresOnly();
