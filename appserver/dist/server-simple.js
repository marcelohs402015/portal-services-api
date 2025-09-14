import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postalservices-db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    ssl: false
};
console.log('🔧 Configuração do banco:', dbConfig);
const pool = new Pool(dbConfig);
// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ===========================================
// CATEGORIES API
// ===========================================
app.get('/api/categories', async (req, res) => {
    try {
        console.log('🔍 Buscando categorias...');
        const result = await pool.query('SELECT * FROM categories WHERE active = true ORDER BY name');
        console.log(`✅ Encontradas ${result.rows.length} categorias`);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar categorias', details: error.message });
    }
});
app.post('/api/categories', async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const result = await pool.query('INSERT INTO categories (name, description, color) VALUES ($1, $2, $3) RETURNING *', [name, description, color || '#FF6B6B']);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar categoria' });
    }
});
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, active } = req.body;
        const result = await pool.query('UPDATE categories SET name = $1, description = $2, color = $3, active = $4 WHERE id = $5 RETURNING *', [name, description, color, active, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar categoria' });
    }
});
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE categories SET active = false WHERE id = $1', [id]);
        res.json({ success: true, message: 'Categoria desativada' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao deletar categoria' });
    }
});
// ===========================================
// SERVICES API
// ===========================================
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT s.*, c.name as category_name, c.color as category_color 
      FROM services s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.active = true 
      ORDER BY s.name
    `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar serviços' });
    }
});
app.post('/api/services', async (req, res) => {
    try {
        const { name, description, price, duration, category_id } = req.body;
        const result = await pool.query('INSERT INTO services (name, description, price, duration, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, price, duration, category_id]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar serviço' });
    }
});
app.put('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, category_id, active } = req.body;
        const result = await pool.query('UPDATE services SET name = $1, description = $2, price = $3, duration = $4, category_id = $5, active = $6 WHERE id = $7 RETURNING *', [name, description, price, duration, category_id, active, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar serviço' });
    }
});
// ===========================================
// CLIENTS API
// ===========================================
app.get('/api/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY name');
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar clientes' });
    }
});
app.post('/api/clients', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const result = await pool.query('INSERT INTO clients (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, phone, address]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar cliente' });
    }
});
app.put('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;
        const result = await pool.query('UPDATE clients SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *', [name, email, phone, address, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar cliente' });
    }
});
// ===========================================
// APPOINTMENTS/CALENDAR API
// ===========================================
app.get('/api/appointments', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT a.*, c.name as client_name, s.name as service_name 
      FROM appointments a 
      LEFT JOIN clients c ON a.client_id = c.id 
      LEFT JOIN services s ON a.service_id = s.id 
      ORDER BY a.start_date
    `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar agendamentos' });
    }
});
app.post('/api/appointments', async (req, res) => {
    try {
        const { title, description, start_date, end_date, client_id, service_id, status } = req.body;
        const result = await pool.query('INSERT INTO appointments (title, description, start_date, end_date, client_id, service_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, start_date, end_date, client_id, service_id, status || 'scheduled']);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar agendamento' });
    }
});
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_date, end_date, client_id, service_id, status } = req.body;
        const result = await pool.query('UPDATE appointments SET title = $1, description = $2, start_date = $3, end_date = $4, client_id = $5, service_id = $6, status = $7 WHERE id = $8 RETURNING *', [title, description, start_date, end_date, client_id, service_id, status, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar agendamento' });
    }
});
// ===========================================
// QUOTATIONS API
// ===========================================
app.get('/api/quotations', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT q.*, c.name as client_name 
      FROM quotations q 
      LEFT JOIN clients c ON q.client_id = c.id 
      ORDER BY q.created_at DESC
    `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar orçamentos' });
    }
});
app.post('/api/quotations', async (req, res) => {
    try {
        const { title, description, total_amount, client_id, status } = req.body;
        const result = await pool.query('INSERT INTO quotations (title, description, total_amount, client_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, description, total_amount, client_id, status || 'draft']);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar orçamento' });
    }
});
app.put('/api/quotations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, total_amount, client_id, status } = req.body;
        const result = await pool.query('UPDATE quotations SET title = $1, description = $2, total_amount = $3, client_id = $4, status = $5 WHERE id = $6 RETURNING *', [title, description, total_amount, client_id, status, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar orçamento' });
    }
});
// ===========================================
// EMAILS API
// ===========================================
app.get('/api/emails', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM emails ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar emails' });
    }
});
app.get('/api/emails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM emails WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Email não encontrado' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar email' });
    }
});
app.post('/api/emails', async (req, res) => {
    try {
        const { subject, sender, recipient, body, status } = req.body;
        const result = await pool.query('INSERT INTO emails (subject, sender, recipient, body, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [subject, sender, recipient, body, status || 'pending']);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar email' });
    }
});
app.put('/api/emails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, sender, recipient, body, status } = req.body;
        const result = await pool.query('UPDATE emails SET subject = $1, sender = $2, recipient = $3, body = $4, status = $5 WHERE id = $6 RETURNING *', [subject, sender, recipient, body, status, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao atualizar email' });
    }
});
// ===========================================
// STATS/DASHBOARD API
// ===========================================
app.get('/api/stats', async (req, res) => {
    try {
        const [clients, services, appointments, quotations, emails] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM clients'),
            pool.query('SELECT COUNT(*) as count FROM services WHERE active = true'),
            pool.query('SELECT COUNT(*) as count FROM appointments'),
            pool.query('SELECT COUNT(*) as count FROM quotations'),
            pool.query('SELECT COUNT(*) as count FROM emails')
        ]);
        res.json({
            success: true,
            data: {
                clients: parseInt(clients.rows[0].count),
                services: parseInt(services.rows[0].count),
                appointments: parseInt(appointments.rows[0].count),
                quotations: parseInt(quotations.rows[0].count),
                emails: parseInt(emails.rows[0].count)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas' });
    }
});
// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
});
// Test database connection
async function testDatabaseConnection() {
    try {
        console.log('🔌 Testando conexão com o banco...');
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conexão com banco OK:', result.rows[0].now);
        // Test current database and schema
        const dbInfo = await pool.query('SELECT current_database(), current_schema()');
        console.log('📊 Database info:', dbInfo.rows[0]);
        // Test categories table
        const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
        console.log(`📊 Categorias no banco: ${categoriesResult.rows[0].count}`);
    }
    catch (error) {
        console.error('❌ Erro na conexão com banco:', error);
    }
}
// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Postal Services API rodando na porta ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📋 APIs disponíveis: categories, services, clients, appointments, quotations, emails, stats`);
    // Test database connection
    await testDatabaseConnection();
});
//# sourceMappingURL=server-simple.js.map