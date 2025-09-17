"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServicesRoutesReal = createServicesRoutesReal;
const express_1 = require("express");
const logger_js_1 = require("../shared/logger.js");
const logger = (0, logger_js_1.createLogger)('ServicesRoutesReal');
function createServicesRoutesReal(db) {
    const router = (0, express_1.Router)();
    // Get services with filters
    router.get('/services', async (req, res) => {
        try {
            let query = 'SELECT * FROM services WHERE 1=1';
            const params = [];
            let paramIndex = 1;
            if (req.query.category) {
                query += ` AND category = $${paramIndex++}`;
                params.push(req.query.category);
            }
            if (req.query.active !== undefined) {
                query += ` AND active = $${paramIndex++}`;
                params.push(req.query.active === 'true');
            }
            query += ' ORDER BY name ASC';
            const result = await db.query(query, params);
            return res.json({ success: true, data: result.rows });
        }
        catch (error) {
            logger.error('Failed to get services', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve services' });
        }
    });
    // Get service by ID
    router.get('/services/:id', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Service not found' });
            }
            return res.json({ success: true, data: result.rows[0] });
        }
        catch (error) {
            logger.error('Failed to get service', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve service' });
        }
    });
    // Create service
    router.post('/services', async (req, res) => {
        try {
            const { name, description, category, price = 0, estimated_time, active = true, unit = 'hour', materials = [] } = req.body;
            if (!name || !description || !category) {
                return res.status(400).json({ success: false, error: 'Name, description, and category are required' });
            }
            const result = await db.query('INSERT INTO services (id, name, description, category, price, estimated_time, active, unit, materials) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [name, description, category, parseFloat(price), estimated_time, active, unit, JSON.stringify(materials)]);
            return res.status(201).json({ success: true, data: result.rows[0], message: 'Service created successfully' });
        }
        catch (error) {
            logger.error('Failed to create service', error.message);
            return res.status(500).json({ success: false, error: 'Failed to create service' });
        }
    });
    // Update service
    router.put('/services/:id', async (req, res) => {
        try {
            const { name, description, category, price, estimated_time, active, unit, materials } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (name !== undefined) {
                fields.push(`name = $${idx++}`);
                values.push(name);
            }
            if (description !== undefined) {
                fields.push(`description = $${idx++}`);
                values.push(description);
            }
            if (category !== undefined) {
                fields.push(`category = $${idx++}`);
                values.push(category);
            }
            if (price !== undefined) {
                fields.push(`price = $${idx++}`);
                values.push(parseFloat(price));
            }
            if (estimated_time !== undefined) {
                fields.push(`estimated_time = $${idx++}`);
                values.push(estimated_time);
            }
            if (active !== undefined) {
                fields.push(`active = $${idx++}`);
                values.push(active);
            }
            if (unit !== undefined) {
                fields.push(`unit = $${idx++}`);
                values.push(unit);
            }
            if (materials !== undefined) {
                fields.push(`materials = $${idx++}`);
                values.push(JSON.stringify(materials));
            }
            if (fields.length === 0) {
                return res.json({ success: true, message: 'No changes to update' });
            }
            values.push(req.params.id);
            const result = await db.query(`UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Service not found' });
            }
            return res.json({ success: true, data: result.rows[0], message: 'Service updated successfully' });
        }
        catch (error) {
            logger.error('Failed to update service', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update service' });
        }
    });
    // Delete service
    router.delete('/services/:id', async (req, res) => {
        try {
            const result = await db.query('DELETE FROM services WHERE id = $1', [req.params.id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Service not found' });
            }
            return res.json({ success: true, message: 'Service deleted successfully' });
        }
        catch (error) {
            logger.error('Failed to delete service', error.message);
            return res.status(500).json({ success: false, error: 'Failed to delete service' });
        }
    });
    return router;
}
