import request from 'supertest';
import express from 'express';
import { Database } from '../../database/Database.js';
import { createLogger } from '../../shared/logger.js';

// Import all route modules
import adminRoutes from '../../routes/adminRoutes.js';
import { createCategoryRoutesReal } from '../../routes/categoryRoutes.real.js';
import { createServicesRoutesReal } from '../../routes/servicesRoutes.real.js';
import { createClientsRoutesReal } from '../../routes/clientsRoutes.real.js';
// import { createTemplatesRoutesReal } from '../../routes/templatesRoutes.real.js';
import { createQuotationsRoutesReal } from '../../routes/quotationsRoutes.real.js';
import { createAppointmentsRoutesReal } from '../../routes/appointmentsRoutes.real.js';

// Mock database
const mockDatabase = {
  query: jest.fn(),
  getConfig: jest.fn(() => ({
    database: 'test_db',
    user: 'test_user',
    password: 'test_pass',
    host: 'localhost',
    port: 5432,
    ssl: false
  }))
} as unknown as Database;

// Mock logger
jest.mock('../../shared/logger.js', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

describe('API Routes Unit Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock environment variables
    process.env.ADMIN_SECRET_KEY = 'test-admin-secret';
    process.env.NODE_ENV = 'test';
    
    // Setup routes
    app.use('/api/admin', adminRoutes);
    app.use('/api', createCategoryRoutesReal(mockDatabase));
    app.use('/api', createServicesRoutesReal(mockDatabase));
    app.use('/api', createClientsRoutesReal(mockDatabase));
    // app.use('/api', createTemplatesRoutesReal(mockDatabase));
    app.use('/api', createQuotationsRoutesReal(mockDatabase));
    app.use('/api', createAppointmentsRoutesReal(mockDatabase));
    
    // Clear all mocks
    jest.clearAllMocks();
  });


  describe('Admin Routes', () => {
    describe('POST /api/admin/setup-database', () => {
      it('should return 403 without admin secret', async () => {
        const response = await request(app)
          .post('/api/admin/setup-database')
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Acesso negado. Chave de administração inválida.');
      });

      it('should return 500 when admin secret is not configured', async () => {
        delete process.env.ADMIN_SECRET_KEY;
        
        const response = await request(app)
          .post('/api/admin/setup-database')
          .set('x-admin-secret', 'any-secret')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Administração não configurada no servidor.');
      });
    });
  });

  describe('Category Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Test Category',
            description: 'Test Description',
            keywords: ['test'],
            patterns: ['test pattern'],
            domains: ['test.com'],
            color: '#3B82F6',
            active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/categories', () => {
      it('should list all categories', async () => {
        const response = await request(app)
          .get('/api/categories')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT id, name, description')
        );
      });
    });

    describe('POST /api/categories', () => {
      it('should create a new category', async () => {
        const categoryData = {
          name: 'New Category',
          description: 'New Description',
          keywords: ['new'],
          patterns: ['new pattern'],
          domains: ['new.com'],
          color: '#FF0000'
        };

        const response = await request(app)
          .post('/api/categories')
          .send(categoryData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO categories'),
          expect.arrayContaining([
            categoryData.name,
            categoryData.description,
            JSON.stringify(categoryData.keywords),
            JSON.stringify(categoryData.patterns),
            JSON.stringify(categoryData.domains),
            categoryData.color
          ])
        );
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/categories')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Name and description are required');
      });
    });

    describe('PUT /api/categories/:id', () => {
      it('should update a category', async () => {
        const updateData = {
          name: 'Updated Category',
          description: 'Updated Description'
        };

        const response = await request(app)
          .put('/api/categories/1')
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE categories SET'),
          expect.arrayContaining([updateData.name, updateData.description, 1])
        );
      });

      it('should return error for invalid category ID', async () => {
        const response = await request(app)
          .put('/api/categories/invalid')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid category ID');
      });
    });

    describe('DELETE /api/categories/:id', () => {
      it('should delete a category', async () => {
        const response = await request(app)
          .delete('/api/categories/1')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Category deleted');
        expect(mockDatabase.query).toHaveBeenCalledWith(
          'DELETE FROM categories WHERE id = $1',
          [1]
        );
      });

      it('should return error for invalid category ID', async () => {
        const response = await request(app)
          .delete('/api/categories/invalid')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid category ID');
      });
    });
  });

  describe('Services Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'serv_123',
            name: 'Test Service',
            description: 'Test Description',
            category: 'Test Category',
            price: 100,
            unit: 'hour',
            estimated_time: 120,
            materials: ['material1'],
            active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/services', () => {
      it('should list all services', async () => {
        const response = await request(app)
          .get('/api/services')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter services by category', async () => {
        await request(app)
          .get('/api/services?category=Test Category')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND category = $1'),
          ['Test Category']
        );
      });

      it('should filter services by active status', async () => {
        await request(app)
          .get('/api/services?active=true')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND active = $1'),
          [true]
        );
      });
    });

    describe('POST /api/services', () => {
      it('should create a new service', async () => {
        const serviceData = {
          name: 'New Service',
          description: 'New Description',
          category: 'New Category',
          price: 150,
          unit: 'hour',
          estimatedTime: 90,
          materials: ['material1', 'material2'],
          active: true
        };

        const response = await request(app)
          .post('/api/services')
          .send(serviceData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.message).toBe('Service created successfully');
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/services')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Name, description, and category are required');
      });
    });
  });

  describe('Clients Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'client_123',
            name: 'Test Client',
            email: 'test@example.com',
            phone: '123456789',
            address: 'Test Address',
            notes: 'Test Notes',
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/clients', () => {
      it('should list all clients', async () => {
        const response = await request(app)
          .get('/api/clients')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should search clients by name or email', async () => {
        await request(app)
          .get('/api/clients?search=test')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('WHERE name ILIKE $1 OR email ILIKE $1'),
          ['%test%']
        );
      });
    });

    describe('POST /api/clients', () => {
      it('should create a new client', async () => {
        const clientData = {
          name: 'New Client',
          email: 'new@example.com',
          phone: '987654321',
          address: 'New Address',
          notes: 'New Notes'
        };

        const response = await request(app)
          .post('/api/clients')
          .send(clientData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.message).toBe('Client created successfully');
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/clients')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Name and email are required');
      });

      it('should return error for duplicate email', async () => {
        (mockDatabase.query as jest.Mock).mockRejectedValueOnce({
          code: '23505' // unique violation
        });

        const response = await request(app)
          .post('/api/clients')
          .send({
            name: 'Test Client',
            email: 'duplicate@example.com'
          })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('A client with this email already exists');
      });
    });
  });

  describe('Templates Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Test Template',
            subject: 'Test Subject',
            body: 'Test Body',
            category: 'Test Category',
            variables: ['var1', 'var2'],
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/templates', () => {
      it('should list all templates', async () => {
        const response = await request(app)
          .get('/api/templates')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter templates by category', async () => {
        await request(app)
          .get('/api/templates?category=Test Category')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND category = $1'),
          ['Test Category']
        );
      });
    });

    describe('POST /api/templates', () => {
      it('should create a new template', async () => {
        const templateData = {
          name: 'New Template',
          subject: 'New Subject',
          body: 'New Body',
          category: 'New Category',
          variables: ['var1']
        };

        const response = await request(app)
          .post('/api/templates')
          .send(templateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.message).toBe('Template created successfully');
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/templates')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Name, subject, and body are required');
      });
    });
  });

  describe('Quotations Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'quote_123',
            client_email: 'client@example.com',
            client_name: 'Test Client',
            client_phone: '123456789',
            client_address: 'Test Address',
            services: [{ name: 'Service 1', price: 100 }],
            subtotal: 100,
            discount: 0,
            total: 100,
            status: 'draft',
            valid_until: new Date(),
            notes: 'Test Notes',
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/quotations', () => {
      it('should list all quotations', async () => {
        const response = await request(app)
          .get('/api/quotations')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter quotations by status', async () => {
        await request(app)
          .get('/api/quotations?status=draft')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND status = $1'),
          ['draft']
        );
      });

      it('should filter quotations by client email', async () => {
        await request(app)
          .get('/api/quotations?client_email=test@example.com')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND client_email ILIKE $1'),
          ['%test@example.com%']
        );
      });
    });

    describe('POST /api/quotations', () => {
      it('should create a new quotation', async () => {
        const quotationData = {
          clientEmail: 'new@example.com',
          clientName: 'New Client',
          clientPhone: '987654321',
          clientAddress: 'New Address',
          services: [{ name: 'New Service', price: 200 }],
          subtotal: 200,
          discount: 10,
          total: 190,
          status: 'draft',
          validUntil: new Date(),
          notes: 'New Notes'
        };

        const response = await request(app)
          .post('/api/quotations')
          .send(quotationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.message).toBe('Quotation created successfully');
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/quotations')
          .send({ clientEmail: 'test@example.com' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Client email, name, and services are required');
      });
    });

    describe('POST /api/quotations/:id/send', () => {
      it('should send quotation by email', async () => {
        const response = await request(app)
          .post('/api/quotations/quote_123/send')
          .send({ recipientEmail: 'recipient@example.com' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('enviado para');
        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE quotations SET status = $1'),
          ['sent', 'quote_123']
        );
      });

      it('should return error for missing recipient email', async () => {
        const response = await request(app)
          .post('/api/quotations/quote_123/send')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Recipient email is required');
      });
    });
  });

  describe('Appointments Routes', () => {
    beforeEach(() => {
      (mockDatabase.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'appt_123',
            client_id: 'client_123',
            client_name: 'Test Client',
            service_ids: ['serv_1', 'serv_2'],
            service_names: ['Service 1', 'Service 2'],
            date: '2024-01-15',
            time: '10:00',
            duration: 120,
            address: 'Test Address',
            notes: 'Test Notes',
            status: 'scheduled',
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        rowCount: 1
      });
    });

    describe('GET /api/appointments', () => {
      it('should list all appointments', async () => {
        const response = await request(app)
          .get('/api/appointments')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter appointments by status', async () => {
        await request(app)
          .get('/api/appointments?status=scheduled')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND status = $1'),
          ['scheduled']
        );
      });

      it('should filter appointments by client ID', async () => {
        await request(app)
          .get('/api/appointments?client_id=client_123')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND client_id = $1'),
          ['client_123']
        );
      });

      it('should filter appointments by date', async () => {
        await request(app)
          .get('/api/appointments?date=2024-01-15')
          .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('AND date = $1'),
          ['2024-01-15']
        );
      });
    });

    describe('POST /api/appointments', () => {
      it('should create a new appointment', async () => {
        const appointmentData = {
          clientId: 'client_123',
          clientName: 'Test Client',
          serviceIds: ['serv_1'],
          serviceNames: ['Service 1'],
          date: '2024-01-20',
          time: '14:00',
          duration: 90,
          address: 'Test Address',
          notes: 'Test Notes',
          status: 'scheduled'
        };

        const response = await request(app)
          .post('/api/appointments')
          .send(appointmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.message).toBe('Appointment created successfully');
      });

      it('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({ clientId: 'client_123' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Client ID, name, date, and time are required');
      });
    });
  });


  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockDatabase.query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/categories')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to retrieve categories');
    });

    it('should handle 404 errors for non-existent resources', async () => {
      (mockDatabase.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .get('/api/categories/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Category not found');
    });
  });
});
