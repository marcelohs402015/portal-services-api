import request from 'supertest';
import { startServer } from '../../server.js';

describe('Health Check Tests', () => {
  let app: any;
  let server: any;

  beforeAll(async () => {
    // Inicia o servidor
    server = await startServer();
    app = server;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health Endpoints', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('port');
      expect(response.body).toHaveProperty('dataMode');

      console.log('Health check response:', response.body);
    });

    test('GET /mode should return data mode', async () => {
      const response = await request(app)
        .get('/mode')
        .expect(200);

      expect(response.body).toHaveProperty('dataMode');
      expect(response.body.dataMode).toBe('real');

      console.log('Mode response:', response.body);
    });
  });

  describe('API Base Endpoints', () => {
    test('GET /api/categories should return response', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('Categories response:', response.body);
    });

    test('GET /api/services should return response', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('Services response:', response.body);
    });

    test('GET /api/clients should return response', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('Clients response:', response.body);
    });

    test('GET /api/quotations should return response', async () => {
      const response = await request(app)
        .get('/api/quotations')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('Quotations response:', response.body);
    });

    test('GET /api/appointments should return response', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('Appointments response:', response.body);
    });
  });

  describe('Admin Endpoints', () => {
    test('GET /api/admin/status should return system status', async () => {
      const response = await request(app)
        .get('/api/admin/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('database_connected');
      expect(response.body.data).toHaveProperty('version');

      console.log('Admin status response:', response.body);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');

      console.log('404 error response:', response.body);
    });
  });
});
