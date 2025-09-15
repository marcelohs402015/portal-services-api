#!/usr/bin/env node

/**
 * Portal Services API - Blueprint Validation Script
 * Valida a configuração do Blueprint antes do deploy
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Cores para output
const colors = {
  reset: '\x1b[0m',
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

function validateBlueprint() {
  log('🚀 Validando configuração do Blueprint...', 'blue');
  console.log('='.repeat(50));

  const errors = [];
  const warnings = [];

  // Verificar se o arquivo render.yaml existe
  const blueprintFile = path.join(__dirname, 'render.yaml');
  if (!fs.existsSync(blueprintFile)) {
    errors.push('❌ Arquivo render.yaml não encontrado');
    return { errors, warnings };
  }

  try {
    // Carregar e validar YAML
    const blueprintContent = fs.readFileSync(blueprintFile, 'utf8');
    const blueprint = yaml.load(blueprintContent);

    log('✅ Arquivo YAML válido', 'green');

    // Validar estrutura básica
    if (!blueprint.services) {
      errors.push('❌ Seção "services" não encontrada');
    } else {
      log('✅ Seção "services" encontrada', 'green');
    }

    // Validar serviços
    if (blueprint.services && Array.isArray(blueprint.services)) {
      log(`📋 Encontrados ${blueprint.services.length} serviços`, 'cyan');

      // Verificar se há banco de dados
      const dbService = blueprint.services.find(s => s.type === 'pserv');
      if (!dbService) {
        errors.push('❌ Serviço de banco de dados (pserv) não encontrado');
      } else {
        log('✅ Serviço de banco de dados encontrado', 'green');
        
        // Validar configurações do banco
        if (!dbService.envVars) {
          warnings.push('⚠️  Variáveis de ambiente do banco não configuradas');
        } else {
          const requiredDbVars = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
          requiredDbVars.forEach(varName => {
            if (!dbService.envVars.find(v => v.key === varName)) {
              errors.push(`❌ Variável de ambiente obrigatória do banco: ${varName}`);
            }
          });
        }
      }

      // Verificar se há API web
      const webService = blueprint.services.find(s => s.type === 'web');
      if (!webService) {
        errors.push('❌ Serviço web não encontrado');
      } else {
        log('✅ Serviço web encontrado', 'green');
        
        // Validar configurações da API
        if (!webService.buildCommand) {
          errors.push('❌ Comando de build não configurado');
        } else {
          log('✅ Comando de build configurado', 'green');
        }

        if (!webService.startCommand) {
          errors.push('❌ Comando de start não configurado');
        } else {
          log('✅ Comando de start configurado', 'green');
        }

        // Validar variáveis de ambiente da API
        if (webService.envVars) {
          const requiredApiVars = ['NODE_ENV', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
          requiredApiVars.forEach(varName => {
            if (!webService.envVars.find(v => v.key === varName)) {
              errors.push(`❌ Variável de ambiente obrigatória da API: ${varName}`);
            }
          });
        }
      }
    }

    // Validar arquivos necessários
    const requiredFiles = [
      'appserver/package.json',
      'appserver/server.ts',
      'appserver/scripts/init-database.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`❌ Arquivo necessário não encontrado: ${file}`);
      } else {
        log(`✅ Arquivo encontrado: ${file}`, 'green');
      }
    });

    // Validar package.json
    const packageJsonPath = path.join(__dirname, 'appserver/package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Verificar scripts necessários
        const requiredScripts = ['build', 'start', 'init-db'];
        requiredScripts.forEach(script => {
          if (!packageJson.scripts || !packageJson.scripts[script]) {
            errors.push(`❌ Script necessário não encontrado no package.json: ${script}`);
          } else {
            log(`✅ Script encontrado: ${script}`, 'green');
          }
        });

        // Verificar dependências
        const requiredDeps = ['express', 'pg', 'cors', 'dotenv'];
        requiredDeps.forEach(dep => {
          if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
            warnings.push(`⚠️  Dependência recomendada não encontrada: ${dep}`);
          }
        });

      } catch (error) {
        errors.push('❌ Erro ao ler package.json: ' + error.message);
      }
    }

    // Validar configurações de segurança
    const webService = blueprint.services ? blueprint.services.find(s => s.type === 'web') : null;
    if (webService && webService.envVars) {
      const hasJwtSecret = webService.envVars.find(v => v.key === 'JWT_SECRET');
      const hasSessionSecret = webService.envVars.find(v => v.key === 'SESSION_SECRET');
      
      if (!hasJwtSecret || !hasJwtSecret.generateValue) {
        warnings.push('⚠️  JWT_SECRET não configurado com generateValue');
      }
      
      if (!hasSessionSecret || !hasSessionSecret.generateValue) {
        warnings.push('⚠️  SESSION_SECRET não configurado com generateValue');
      }
    }

    // Validar URLs da API
    if (webService && webService.envVars) {
      const apiUrl = webService.envVars.find(v => v.key === 'API_URL');
      if (apiUrl && apiUrl.value === 'https://portal-services-api.onrender.com') {
        log('✅ URL da API padronizada corretamente', 'green');
      } else {
        warnings.push('⚠️  URL da API não está padronizada');
      }
    }

  } catch (error) {
    errors.push('❌ Erro ao processar arquivo YAML: ' + error.message);
  }

  return { errors, warnings };
}

function main() {
  const { errors, warnings } = validateBlueprint();

  console.log('\n' + '='.repeat(50));
  log('📊 RESULTADO DA VALIDAÇÃO', 'blue');
  console.log('='.repeat(50));

  if (errors.length === 0) {
    log('🎉 Validação concluída com sucesso!', 'green');
    log('✅ O Blueprint está pronto para deploy', 'green');
  } else {
    log('❌ Validação falhou!', 'red');
    log('🔧 Corrija os seguintes erros:', 'red');
    errors.forEach(error => log(`   ${error}`, 'red'));
  }

  if (warnings.length > 0) {
    log('\n⚠️  Avisos (não impedem o deploy):', 'yellow');
    warnings.forEach(warning => log(`   ${warning}`, 'yellow'));
  }

  if (errors.length === 0) {
    log('\n🚀 Próximos passos:', 'cyan');
    log('1. Commit e push do código para o repositório', 'cyan');
    log('2. Acesse render.com', 'cyan');
    log('3. Clique em "New +" -> "Blueprint"', 'cyan');
    log('4. Conecte seu repositório Git', 'cyan');
    log('5. Clique em "Apply" para criar os serviços', 'cyan');
    log('\n🌐 URL da API: https://portal-services-api.onrender.com', 'magenta');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { validateBlueprint };
