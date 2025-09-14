import request from 'supertest';
import { startServer } from '../../server.js';
import { Database } from '../../database/Database.js';

describe('API Integration Tests', () => {
  let app: any;
  let server: any;
  let db: Database;

  // Dados de teste
  const testCategory = {
    name: 'Test Category',
    description: 'Test category description',
    color: '#FF5722'
  };

  const testService = {
    name: 'Test Service',
    description: 'Test service description',
    price: 100.00,
    duration: 120,
    category_id: ''
  };

  const testClient = {
    name: 'Test Client',
    email: 'test@example.com',
    phone: '+5511999999999',
    address: 'Test Address'
  };

  const testQuotation = {
    client_id: '',
    items: [
      {
        service_id: '',
        quantity: 1,
        unit_price: 100.00
      }
    ],
    notes: 'Test quotation'
  };

  let categoryId: string;
  let serviceId: string;
  let clientId: string;
  let quotationId: string;

  beforeAll(async () => {
    // Inicia o servidor
    server = await startServer();
    app = server;
    
    // Configura banco de teste
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'portalservicesdb_test',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin',
      ssl: false
    };
    
    db = new Database(dbConfig);
  });

  afterAll(async () => {
    // Limpa dados de teste
    if (quotationId) {
      await db.query('DELETE FROM quotations WHERE id = $1', [quotationId]);
    }
    if (serviceId) {
      await db.query('DELETE FROM services WHERE id = $1', [serviceId]);
    }
    if (clientId) {
      await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    }
    if (categoryId) {
      await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    }
    
    await db.close();
    server.close();
  });

  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('environment');
    });

    test('GET /mode should return data mode', async () => {
      const response = await request(app)
        .get('/mode')
        .expect(200);

      expect(response.body).toHaveProperty('dataMode');
      expect(response.body.dataMode).toBe('real');
    });
  });

  describe('Categories API', () => {
    test('GET /api/categories should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/categories should create a new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send(testCategory)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testCategory.name);
      
      categoryId = response.body.data.id;
    });

    test('GET /api/categories/:id should return the created category', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(categoryId);
      expect(response.body.data.name).toBe(testCategory.name);
    });

    test('PUT /api/categories/:id should update the category', async () => {
      const updatedCategory = {
        ...testCategory,
        name: 'Updated Test Category'
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send(updatedCategory)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe(updatedCategory.name);
    });
  });

  describe('Services API', () => {
    test('GET /api/services should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/services should create a new service', async () => {
      const serviceData = {
        ...testService,
        category_id: categoryId
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testService.name);
      
      serviceId = response.body.data.id;
    });

    test('GET /api/services/:id should return the created service', async () => {
      const response = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(serviceId);
      expect(response.body.data.name).toBe(testService.name);
    });

    test('PUT /api/services/:id should update the service', async () => {
      const updatedService = {
        ...testService,
        category_id: categoryId,
        name: 'Updated Test Service',
        price: 150.00
      };

      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .send(updatedService)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe(updatedService.name);
      expect(response.body.data.price).toBe(updatedService.price);
    });


  });

  describe('Clients API', () => {
    test('GET /api/clients should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/clients should create a new client', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send(testClient)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testClient.name);
      expect(response.body.data.email).toBe(testClient.email);
      
      clientId = response.body.data.id;
    });

    test('GET /api/clients/:id should return the created client', async () => {
      const response = await request(app)
        .get(`/api/clients/${clientId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(clientId);
      expect(response.body.data.name).toBe(testClient.name);
    });

    test('PUT /api/clients/:id should update the client', async () => {
      const updatedClient = {
        ...testClient,
        name: 'Updated Test Client',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/clients/${clientId}`)
        .send(updatedClient)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe(updatedClient.name);
      expect(response.body.data.email).toBe(updatedClient.email);
    });
  });

  describe('Quotations API', () => {
    test('GET /api/quotations should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/quotations')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/quotations should create a new quotation', async () => {
      const quotationData = {
        ...testQuotation,
        client_id: clientId,
        items: [
          {
            service_id: serviceId,
            quantity: 1,
            unit_price: 100.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/quotations')
        .send(quotationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.client_id).toBe(clientId);
      
      quotationId = response.body.data.id;
    });

    test('GET /api/quotations/:id should return the created quotation', async () => {
      const response = await request(app)
        .get(`/api/quotations/${quotationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(quotationId);
      expect(response.body.data.client_id).toBe(clientId);
    });

    test('PUT /api/quotations/:id/status should update quotation status', async () => {
      const response = await request(app)
        .put(`/api/quotations/${quotationId}/status`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe('approved');
    });

    test('DELETE /api/quotations/:id should delete the quotation', async () => {
      const response = await request(app)
        .delete(`/api/quotations/${quotationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Quotation deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/quotations/${quotationId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });
  });

  describe('Appointments API', () => {
    let appointmentId: string;

    test('GET /api/appointments should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/appointments should create a new appointment', async () => {
      const appointmentData = {
        client_id: clientId,
        service_id: serviceId,
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: 'Test appointment'
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.client_id).toBe(clientId);
      expect(response.body.data.service_id).toBe(serviceId);
      
      appointmentId = response.body.data.id;
    });

    test('GET /api/appointments/:id should return the created appointment', async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(appointmentId);
      expect(response.body.data.client_id).toBe(clientId);
    });

    test('PUT /api/appointments/:id should update the appointment', async () => {
      const updatedAppointment = {
        client_id: clientId,
        service_id: serviceId,
        scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        notes: 'Updated test appointment'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .send(updatedAppointment)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.notes).toBe(updatedAppointment.notes);
    });

    test('DELETE /api/appointments/:id should delete the appointment', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Appointment deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });
  });


  describe('Templates API', () => {
    let templateId: string;

    test('GET /api/templates should return templates list', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/templates should create a new template', async () => {
      const templateData = {
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test content for email template',
        type: 'quotation'
      };

      const response = await request(app)
        .post('/api/templates')
        .send(templateData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(templateData.name);
      
      templateId = response.body.data.id;
    });

    test('DELETE /api/templates/:id should delete the template', async () => {
      const response = await request(app)
        .delete(`/api/templates/${templateId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Template deleted successfully');
    });
  });

  describe('Admin API', () => {
    test('GET /api/admin/status should return system status', async () => {
      const response = await request(app)
        .get('/api/admin/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('database_connected');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/clients/invalid-id should return 404', async () => {
      const response = await request(app)
        .get('/api/clients/invalid-uuid')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    test('POST /api/clients with invalid data should return 400', async () => {
      const invalidClient = {
        name: '', // Invalid: empty name
        email: 'invalid-email' // Invalid: wrong format
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidClient)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Pagination and Filtering', () => {
    test('GET /api/clients with pagination should work', async () => {
      const response = await request(app)
        .get('/api/clients?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    test('GET /api/services with category filter should work', async () => {
      const response = await request(app)
        .get(`/api/services?category_id=${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('DELETE Operations', () => {
    test('DELETE /api/categories/:id should delete the category', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Category deleted');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });

    test('DELETE /api/services/:id should delete the service', async () => {
      const response = await request(app)
        .delete(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Service deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });

    test('DELETE /api/clients/:id should delete the client', async () => {
      const response = await request(app)
        .delete(`/api/clients/${clientId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Client deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/clients/${clientId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });

    test('DELETE /api/quotations/:id should delete the quotation', async () => {
      const response = await request(app)
        .delete(`/api/quotations/${quotationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Quotation deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/quotations/${quotationId}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });
  });
});
