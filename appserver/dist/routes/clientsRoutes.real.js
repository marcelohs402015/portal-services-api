import { Router } from 'express';
import { createLogger } from '../shared/logger.js';
const logger = createLogger('ClientsRoutesReal');
export function createClientsRoutesReal(db) {
    const router = Router();
    // Get clients
    router.get('/clients', async (req, res) => {
        try {
            let query = 'SELECT * FROM clients ORDER BY name ASC';
            const params = [];
            if (req.query.search) {
                query = 'SELECT * FROM clients WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY name ASC';
                params.push(`%${req.query.search}%`);
            }
            const result = await db.query(query, params);
            return res.json({ success: true, data: result.rows });
        }
        catch (error) {
            logger.error('Failed to get clients', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve clients' });
        }
    });
    // Get client by ID
    router.get('/clients/:id', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Client not found' });
            }
            return res.json({ success: true, data: result.rows[0] });
        }
        catch (error) {
            logger.error('Failed to get client', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve client' });
        }
    });
    // Create client
    router.post('/clients', async (req, res) => {
        try {
            const { name, email, phone = '', address = '' } = req.body;
            if (!name || !email) {
                return res.status(400).json({ success: false, error: 'Name and email are required' });
            }
            const result = await db.query('INSERT INTO clients (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, phone, address]);
            return res.status(201).json({ success: true, data: result.rows[0], message: 'Client created successfully' });
        }
        catch (error) {
            if (error.code === '23505') { // unique violation
                return res.status(409).json({ success: false, error: 'A client with this email already exists' });
            }
            logger.error('Failed to create client', error.message);
            return res.status(500).json({ success: false, error: 'Failed to create client' });
        }
    });
    // Update client
    router.put('/clients/:id', async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (name !== undefined) {
                fields.push(`name = $${idx++}`);
                values.push(name);
            }
            if (email !== undefined) {
                fields.push(`email = $${idx++}`);
                values.push(email);
            }
            if (phone !== undefined) {
                fields.push(`phone = $${idx++}`);
                values.push(phone);
            }
            if (address !== undefined) {
                fields.push(`address = $${idx++}`);
                values.push(address);
            }
            if (fields.length === 0) {
                return res.json({ success: true, message: 'No changes to update' });
            }
            values.push(req.params.id);
            const result = await db.query(`UPDATE clients SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Client not found' });
            }
            return res.json({ success: true, data: result.rows[0], message: 'Client updated successfully' });
        }
        catch (error) {
            logger.error('Failed to update client', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update client' });
        }
    });
    // Delete client
    router.delete('/clients/:id', async (req, res) => {
        try {
            const result = await db.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Client not found' });
            }
            return res.json({ success: true, message: 'Client deleted successfully' });
        }
        catch (error) {
            logger.error('Failed to delete client', error.message);
            return res.status(500).json({ success: false, error: 'Failed to delete client' });
        }
    });
    return router;
}
//# sourceMappingURL=clientsRoutes.real.js.map