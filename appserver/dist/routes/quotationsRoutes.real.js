import { Router } from 'express';
import { createLogger } from '../shared/logger.js';
const logger = createLogger('QuotationsRoutesReal');
export function createQuotationsRoutesReal(db) {
    const router = Router();
    // Get quotations with filters
    router.get('/quotations', async (req, res) => {
        try {
            let query = 'SELECT * FROM quotations WHERE 1=1';
            const params = [];
            let paramIndex = 1;
            if (req.query.status) {
                query += ` AND status = $${paramIndex++}`;
                params.push(req.query.status);
            }
            if (req.query.client_email) {
                query += ` AND client_email ILIKE $${paramIndex++}`;
                params.push(`%${req.query.client_email}%`);
            }
            query += ' ORDER BY created_at DESC';
            const result = await db.query(query, params);
            return res.json({ success: true, data: result.rows });
        }
        catch (error) {
            logger.error('Failed to get quotations', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve quotations' });
        }
    });
    // Get quotation by ID
    router.get('/quotations/:id', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Quotation not found' });
            }
            return res.json({ success: true, data: result.rows[0] });
        }
        catch (error) {
            logger.error('Failed to get quotation', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve quotation' });
        }
    });
    // Create quotation
    router.post('/quotations', async (req, res) => {
        try {
            const { client_name, client_email, client_phone, client_address, services = [], subtotal = 0, discount = 0, total = 0, status = 'draft', valid_until, notes = '' } = req.body;
            if (!client_email || !services.length) {
                return res.status(400).json({ success: false, error: 'Client email and services are required' });
            }
            // Insert quotation with all required fields including id
            const result = await db.query('INSERT INTO quotations (id, client_name, client_email, client_phone, client_address, services, subtotal, discount, total, status, valid_until, notes) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [client_name, client_email, client_phone, client_address, JSON.stringify(services), parseFloat(subtotal), parseFloat(discount), parseFloat(total), status, valid_until, notes]);
            return res.status(201).json({ success: true, data: result.rows[0], message: 'Quotation created successfully' });
        }
        catch (error) {
            logger.error('Failed to create quotation', error.message);
            return res.status(500).json({ success: false, error: 'Failed to create quotation' });
        }
    });
    // Update quotation
    router.put('/quotations/:id', async (req, res) => {
        try {
            const { clientEmail, clientName, clientPhone, clientAddress, services, subtotal, discount, total, status, validUntil, notes } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (clientEmail !== undefined) {
                fields.push(`client_email = $${idx++}`);
                values.push(clientEmail);
            }
            if (clientName !== undefined) {
                fields.push(`client_name = $${idx++}`);
                values.push(clientName);
            }
            if (clientPhone !== undefined) {
                fields.push(`client_phone = $${idx++}`);
                values.push(clientPhone);
            }
            if (clientAddress !== undefined) {
                fields.push(`client_address = $${idx++}`);
                values.push(clientAddress);
            }
            if (services !== undefined) {
                fields.push(`services = $${idx++}`);
                values.push(JSON.stringify(services));
            }
            if (subtotal !== undefined) {
                fields.push(`subtotal = $${idx++}`);
                values.push(parseFloat(subtotal));
            }
            if (discount !== undefined) {
                fields.push(`discount = $${idx++}`);
                values.push(parseFloat(discount));
            }
            if (total !== undefined) {
                fields.push(`total = $${idx++}`);
                values.push(parseFloat(total));
            }
            if (status !== undefined) {
                fields.push(`status = $${idx++}`);
                values.push(status);
            }
            if (validUntil !== undefined) {
                fields.push(`valid_until = $${idx++}`);
                values.push(validUntil);
            }
            if (notes !== undefined) {
                fields.push(`notes = $${idx++}`);
                values.push(notes);
            }
            if (fields.length === 0) {
                return res.json({ success: true, message: 'No changes to update' });
            }
            values.push(req.params.id);
            const result = await db.query(`UPDATE quotations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Quotation not found' });
            }
            return res.json({ success: true, data: result.rows[0], message: 'Quotation updated successfully' });
        }
        catch (error) {
            logger.error('Failed to update quotation', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update quotation' });
        }
    });
    // Delete quotation
    router.delete('/quotations/:id', async (req, res) => {
        try {
            const result = await db.query('DELETE FROM quotations WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Quotation not found' });
            }
            return res.json({ success: true, message: 'Quotation deleted successfully' });
        }
        catch (error) {
            logger.error('Failed to delete quotation', error.message);
            return res.status(500).json({ success: false, error: 'Failed to delete quotation' });
        }
    });
    // Send quotation by email (simulate)
    router.post('/quotations/:id/send', async (req, res) => {
        try {
            const { recipientEmail } = req.body;
            if (!recipientEmail) {
                return res.status(400).json({ success: false, error: 'Recipient email is required' });
            }
            // Update quotation status to sent
            const result = await db.query('UPDATE quotations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', ['sent', req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Quotation not found' });
            }
            logger.info(`Quotation ${req.params.id} sent to ${recipientEmail}`);
            return res.json({ success: true, message: `Orçamento enviado para ${recipientEmail} com sucesso` });
        }
        catch (error) {
            logger.error('Failed to send quotation', error.message);
            return res.status(500).json({ success: false, error: 'Failed to send quotation' });
        }
    });
    return router;
}
//# sourceMappingURL=quotationsRoutes.real.js.map