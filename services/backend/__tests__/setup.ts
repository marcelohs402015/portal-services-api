import dotenv from 'dotenv';

// Carrega variáveis de ambiente para testes
dotenv.config({ path: '.env.test' });

// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Porta diferente para testes
process.env.DB_NAME = 'portalservicesdb_test'; // Banco de teste

// Suprime logs durante testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Mock console methods sem usar jest.fn() diretamente
  console.log = () => {};
  console.error = () => {};
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Limpa mocks após cada teste
afterEach(() => {
  // Reset console mocks
  console.log = () => {};
  console.error = () => {};
});
