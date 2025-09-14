#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Executando todos os testes de integração...\n');

// Função para executar comando e capturar output
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
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

// Função para analisar output do Jest e extrair falhas
function parseJestOutput(output) {
  const lines = output.split('\n');
  const failures = [];
  let currentTest = null;
  let currentError = '';

  for (const line of lines) {
    // Detecta início de teste falhando
    if (line.includes('✕') && line.includes('should')) {
      currentTest = line.trim();
      currentError = '';
      continue;
    }

    // Detecta erros de teste
    if (line.includes('●') && currentTest) {
      failures.push({
        test: currentTest,
        error: currentError.trim()
      });
      currentTest = null;
      currentError = '';
      continue;
    }

    // Coleta linhas de erro
    if (currentTest && (line.includes('Error:') || line.includes('at ') || line.includes('expect('))) {
      currentError += line + '\n';
    }
  }

  return failures;
}

// Função principal
async function runAllTests() {
  try {
    console.log('📋 Executando testes de integração...');
    const result = await runCommand('node', [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--testPathPattern=integration',
      '--verbose',
      '--no-coverage'
    ]);

    if (result.code === 0) {
      console.log('✅ Todos os testes passaram com sucesso!\n');
      console.log('📊 Resumo:');
      console.log('   - Status: PASSED');
      console.log('   - Falhas: 0');
      return;
    }

    // Analisa falhas
    const failures = parseJestOutput(result.stdout + result.stderr);
    
    if (failures.length === 0) {
      console.log('⚠️  Testes falharam mas não foi possível extrair detalhes específicos');
      console.log('Output completo:');
      console.log(result.stdout);
      console.log(result.stderr);
      return;
    }

    console.log(`❌ ${failures.length} teste(s) falharam:\n`);
    
    failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.test}`);
      if (failure.error) {
        console.log(`   Erro: ${failure.error.split('\n')[0]}`);
      }
      console.log('');
    });

    console.log('📊 Resumo:');
    console.log(`   - Status: FAILED`);
    console.log(`   - Falhas: ${failures.length}`);
    console.log(`   - Total de testes: ${failures.length} falharam`);

  } catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
  }
}

// Executa o script
runAllTests();
