"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailRoutesReal = createEmailRoutesReal;
const express_1 = require("express");
const logger_js_1 = require("../shared/logger.js");
const logger = (0, logger_js_1.createLogger)('EmailRoutesReal');
function createEmailRoutesReal(db) {
    const router = (0, express_1.Router)();
    // Get emails with filters and pagination
    router.get('/emails', async (req, res) => {
        try {
            let query = 'SELECT * FROM emails ORDER BY date DESC';
            const params = [];
            let paramIndex = 1;
            // Build WHERE clause based on query parameters
            const conditions = [];
            if (req.query.category) {
                conditions.push(`category = $${paramIndex++}`);
                params.push(req.query.category);
            }
            if (req.query.sender) {
                conditions.push(`sender ILIKE $${paramIndex++}`);
                params.push(`%${req.query.sender}%`);
            }
            if (req.query.processed !== undefined) {
                conditions.push(`processed = $${paramIndex++}`);
                params.push(req.query.processed === 'true');
            }
            if (req.query.responded !== undefined) {
                conditions.push(`responded = $${paramIndex++}`);
                params.push(req.query.responded === 'true');
            }
            if (req.query.subject) {
                conditions.push(`subject ILIKE $${paramIndex++}`);
                params.push(`%${req.query.subject}%`);
            }
            if (conditions.length > 0) {
                query = query.replace('ORDER BY', `WHERE ${conditions.join(' AND ')} ORDER BY`);
            }
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
            params.push(limit, offset);
            const result = await db.query(query, params);
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM emails';
            const countParams = [];
            let countParamIndex = 1;
            if (conditions.length > 0) {
                countQuery += ` WHERE ${conditions.join(' AND ')}`;
                // Re-add the same parameters for count query (excluding limit/offset)
                if (req.query.category) {
                    countParams.push(req.query.category);
                }
                if (req.query.sender) {
                    countParams.push(`%${req.query.sender}%`);
                }
                if (req.query.processed !== undefined) {
                    countParams.push(req.query.processed === 'true');
                }
                if (req.query.responded !== undefined) {
                    countParams.push(req.query.responded === 'true');
                }
                if (req.query.subject) {
                    countParams.push(`%${req.query.subject}%`);
                }
            }
            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            // Check if there are any emails
            if (result.rows.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    },
                    message: 'No emails found. Emails will appear here once they are processed by the system.'
                });
            }
            return res.json({
                success: true,
                data: result.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        }
        catch (error) {
            logger.error('Failed to get emails', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve emails' });
        }
    });
    // Get email by ID
    router.get('/emails/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid email ID' });
            }
            const result = await db.query('SELECT * FROM emails WHERE id = $1', [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Email not found' });
            }
            return res.json({ success: true, data: result.rows[0] });
        }
        catch (error) {
            logger.error('Failed to get email', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve email' });
        }
    });
    // Create email
    router.post('/emails', async (req, res) => {
        try {
            const { gmail_id, subject, sender_email, sender_name, date, body = '', category = null, processed = false } = req.body;
            if (!gmail_id || !subject || !sender_email || !date) {
                return res.status(400).json({
                    success: false,
                    error: 'Required fields: gmail_id, subject, sender_email, date'
                });
            }
            // Combine sender_email and sender_name into sender field
            const sender = sender_name ? `${sender_name} <${sender_email}>` : sender_email;
            const result = await db.query(`INSERT INTO emails (gmail_id, subject, sender, date, body, category, processed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [gmail_id, subject, sender, date, body, category, processed]);
            return res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Email created successfully'
            });
        }
        catch (error) {
            if (error.code === '23505') { // unique violation
                return res.status(409).json({ success: false, error: 'Email with this gmail_id already exists' });
            }
            logger.error('Failed to create email', error.message);
            return res.status(500).json({ success: false, error: 'Failed to create email' });
        }
    });
    // Update email
    router.put('/emails/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid email ID' });
            }
            const { subject, sender, date, body, snippet, category, confidence, processed, responded, response_template } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (subject !== undefined) {
                fields.push(`subject = $${idx++}`);
                values.push(subject);
            }
            if (sender !== undefined) {
                fields.push(`sender = $${idx++}`);
                values.push(sender);
            }
            if (date !== undefined) {
                fields.push(`date = $${idx++}`);
                values.push(date);
            }
            if (body !== undefined) {
                fields.push(`body = $${idx++}`);
                values.push(body);
            }
            if (snippet !== undefined) {
                fields.push(`snippet = $${idx++}`);
                values.push(snippet);
            }
            if (category !== undefined) {
                fields.push(`category = $${idx++}`);
                values.push(category);
            }
            if (confidence !== undefined) {
                fields.push(`confidence = $${idx++}`);
                values.push(confidence);
            }
            if (processed !== undefined) {
                fields.push(`processed = $${idx++}`);
                values.push(processed);
            }
            if (responded !== undefined) {
                fields.push(`responded = $${idx++}`);
                values.push(responded);
            }
            if (response_template !== undefined) {
                fields.push(`response_template = $${idx++}`);
                values.push(response_template);
            }
            if (fields.length === 0) {
                return res.json({ success: true, message: 'No changes to update' });
            }
            values.push(id);
            const result = await db.query(`UPDATE emails SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Email not found' });
            }
            return res.json({
                success: true,
                data: result.rows[0],
                message: 'Email updated successfully'
            });
        }
        catch (error) {
            logger.error('Failed to update email', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update email' });
        }
    });
    // Delete email
    router.delete('/emails/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid email ID' });
            }
            const result = await db.query('DELETE FROM emails WHERE id = $1', [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Email not found' });
            }
            return res.json({ success: true, message: 'Email deleted successfully' });
        }
        catch (error) {
            logger.error('Failed to delete email', error.message);
            return res.status(500).json({ success: false, error: 'Failed to delete email' });
        }
    });
    // Update email status (processed/responded)
    router.patch('/emails/:id/status', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid email ID' });
            }
            const { processed, responded, response_template } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (processed !== undefined) {
                fields.push(`processed = $${idx++}`);
                values.push(processed);
            }
            if (responded !== undefined) {
                fields.push(`responded = $${idx++}`);
                values.push(responded);
            }
            if (response_template !== undefined) {
                fields.push(`response_template = $${idx++}`);
                values.push(response_template);
            }
            if (fields.length === 0) {
                return res.status(400).json({ success: false, error: 'No status fields provided' });
            }
            values.push(id);
            const result = await db.query(`UPDATE emails SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Email not found' });
            }
            return res.json({
                success: true,
                data: result.rows[0],
                message: 'Email status updated successfully'
            });
        }
        catch (error) {
            logger.error('Failed to update email status', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update email status' });
        }
    });
    // Get category statistics
    router.get('/stats', async (req, res) => {
        try {
            const result = await db.query(`
        SELECT 
          COALESCE(category, 'sem_categoria') as category,
          COUNT(*) as count,
          COUNT(CASE WHEN responded = true THEN 1 END) as responded_count
        FROM emails 
        GROUP BY category
        ORDER BY count DESC
      `);
            const stats = result.rows.map((row) => ({
                category: row.category,
                count: parseInt(row.count),
                responded_count: parseInt(row.responded_count)
            }));
            // Check if there are any stats
            if (stats.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    message: 'No email statistics available yet. Data will appear once emails are processed.'
                });
            }
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger.error('Failed to get category stats', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve category statistics' });
        }
    });
    return router;
}
