#!/usr/bin/env node
/**
 * Script de debug para verificar variáveis de ambiente
 */

console.log('🔍 DEBUG - Variáveis de Ambiente:');
console.log('================================');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

console.log('\n📊 Database Variables:');
console.log('DATABASE_URL presente:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL (primeiros 30 chars):', process.env.DATABASE_URL.substring(0, 30) + '...');
} else {
  console.log('DATABASE_URL: NÃO DEFINIDA');
}

console.log('\n🔧 Individual DB Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[DEFINIDA]' : 'NÃO DEFINIDA');
console.log('DB_SSL:', process.env.DB_SSL);

console.log('\n🔐 JWT Variables:');
console.log('JWT_SECRET presente:', !!process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET presente:', !!process.env.JWT_REFRESH_SECRET);

console.log('\n🌐 CORS:');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

console.log('\n================================');
console.log('✅ Debug completo!');
