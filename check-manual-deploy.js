#!/usr/bin/env node

/**
 * Script de Verificação para Deploy Manual no Render
 * Verifica se a aplicação está pronta para deploy manual
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando pré-requisitos para Deploy Manual no Render...\n');

let hasErrors = false;
let hasWarnings = false;

function logCheck(name, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
  
  if (status === 'fail') hasErrors = true;
  if (status === 'warn') hasWarnings = true;
}

// 1. Verificar estrutura do projeto
console.log('📁 Verificando estrutura do projeto...');

const requiredFiles = [
  'appserver/package.json',
  'appserver/server.ts',
  'appclient/package.json',
  'appclient/src/App.tsx'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  logCheck(`Arquivo ${file}`, exists ? 'pass' : 'fail');
});

// 2. Verificar package.json do backend
console.log('\n🔧 Verificando configuração do backend...');

try {
  const backendPkg = JSON.parse(fs.readFileSync('appserver/package.json', 'utf8'));
  
  // Scripts essenciais
  const requiredScripts = ['build', 'start'];
  requiredScripts.forEach(script => {
    const hasScript = backendPkg.scripts && backendPkg.scripts[script];
    logCheck(`Script ${script}`, hasScript ? 'pass' : 'fail');
  });
  
  // Dependências essenciais
  const requiredDeps = ['express', 'pg', 'cors'];
  requiredDeps.forEach(dep => {
    const hasDep = backendPkg.dependencies && backendPkg.dependencies[dep];
    logCheck(`Dependência ${dep}`, hasDep ? 'pass' : 'fail');
  });
  
} catch (error) {
  logCheck('Leitura do package.json do backend', 'fail', error.message);
}

// 3. Verificar package.json do frontend
console.log('\n🎨 Verificando configuração do frontend...');

try {
  const frontendPkg = JSON.parse(fs.readFileSync('appclient/package.json', 'utf8'));
  
  // Script de build
  const hasBuildScript = frontendPkg.scripts && frontendPkg.scripts.build;
  logCheck('Script build', hasBuildScript ? 'pass' : 'fail');
  
  // Dependências essenciais
  const requiredDeps = ['react', 'react-dom', 'react-scripts'];
  requiredDeps.forEach(dep => {
    const hasDep = frontendPkg.dependencies && frontendPkg.dependencies[dep];
    logCheck(`Dependência ${dep}`, hasDep ? 'pass' : 'fail');
  });
  
} catch (error) {
  logCheck('Leitura do package.json do frontend', 'fail', error.message);
}

// 4. Verificar se health check existe
console.log('\n🏥 Verificando health check...');

try {
  const serverContent = fs.readFileSync('appserver/server.ts', 'utf8');
  const hasHealthCheck = serverContent.includes('/health') || serverContent.includes('health');
  logCheck('Endpoint /health', hasHealthCheck ? 'pass' : 'warn', 
    hasHealthCheck ? '' : 'Recomendado adicionar endpoint /health');
} catch (error) {
  logCheck('Verificação do health check', 'warn', 'Não foi possível verificar');
}

// 5. Verificar CORS
console.log('\n🌐 Verificando CORS...');

try {
  const serverContent = fs.readFileSync('appserver/server.ts', 'utf8');
  const hasCors = serverContent.includes('cors') || serverContent.includes('CORS');
  logCheck('Configuração CORS', hasCors ? 'pass' : 'warn',
    hasCors ? '' : 'Recomendado configurar CORS para produção');
} catch (error) {
  logCheck('Verificação do CORS', 'warn', 'Não foi possível verificar');
}

// 6. Verificar arquivos de configuração
console.log('\n⚙️ Verificando arquivos de configuração...');

const configFiles = ['.gitignore', 'appserver/tsconfig.json'];
configFiles.forEach(file => {
  const exists = fs.existsSync(file);
  logCheck(`Arquivo ${file}`, exists ? 'pass' : 'warn',
    exists ? '' : 'Recomendado ter este arquivo');
});

// 7. Verificar se não há arquivos sensíveis
console.log('\n🔐 Verificando segurança...');

const sensitiveFiles = ['.env', '.env.local', '.env.production', 'appserver/.env'];
const foundSensitive = sensitiveFiles.filter(file => fs.existsSync(file));

if (foundSensitive.length > 0) {
  logCheck('Arquivos sensíveis', 'warn', 
    `Encontrados: ${foundSensitive.join(', ')} - Certifique-se que estão no .gitignore`);
} else {
  logCheck('Arquivos sensíveis', 'pass', 'Nenhum arquivo sensível encontrado no repositório');
}

// 8. Verificar build local
console.log('\n🔨 Verificando possibilidade de build...');

// Verificar se node_modules existem
const backendNodeModules = fs.existsSync('appserver/node_modules');
const frontendNodeModules = fs.existsSync('appclient/node_modules');

logCheck('node_modules do backend', backendNodeModules ? 'pass' : 'warn',
  backendNodeModules ? '' : 'Execute: cd appserver && npm install');
logCheck('node_modules do frontend', frontendNodeModules ? 'pass' : 'warn',
  frontendNodeModules ? '' : 'Execute: cd appclient && npm install');

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO PARA DEPLOY MANUAL');
console.log('='.repeat(60));

if (hasErrors) {
  console.log('🚨 ATENÇÃO: Corrija os erros antes do deploy!');
  console.log('\n📖 Consulte DEPLOY-MANUAL-RENDER.md para instruções.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Projeto pronto com alguns avisos.');
  console.log('\n🚀 Próximos passos:');
  console.log('1. Revise os avisos acima');
  console.log('2. Siga o guia DEPLOY-MANUAL-RENDER.md');
  console.log('3. Crie os serviços manualmente no Render');
  process.exit(0);
} else {
  console.log('🎉 Projeto 100% pronto para deploy manual!');
  console.log('\n🚀 Próximos passos:');
  console.log('1. Commit e push das alterações');
  console.log('2. Siga o guia DEPLOY-MANUAL-RENDER.md');
  console.log('3. Crie PostgreSQL → Backend → Frontend');
  console.log('\n📖 Guia completo: DEPLOY-MANUAL-RENDER.md');
  process.exit(0);
}
