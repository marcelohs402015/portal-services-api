"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryRoutesReal = createCategoryRoutesReal;
const express_1 = require("express");
const logger_js_1 = require("../shared/logger.js");
const logger = (0, logger_js_1.createLogger)('CategoryRoutesReal');
function createCategoryRoutesReal(db) {
    const router = (0, express_1.Router)();
    router.get('/categories', async (_req, res) => {
        try {
            const result = await db.query('SELECT id, name, description, color, active, created_at, updated_at FROM categories ORDER BY name ASC');
            return res.json({ success: true, data: result.rows });
        }
        catch (error) {
            logger.error('Failed to list categories', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
        }
    });
    router.post('/categories', async (req, res) => {
        try {
            const { name, description, color = '#3B82F6', active = true } = req.body || {};
            if (!name || !description) {
                return res.status(400).json({ success: false, error: 'Name and description are required' });
            }
            const insert = await db.query('INSERT INTO categories (name, description, color, active) VALUES ($1,$2,$3,$4) RETURNING id,name,description,color,active,created_at,updated_at', [name, description, color, active]);
            return res.status(201).json({ success: true, data: insert.rows[0] });
        }
        catch (error) {
            logger.error('Failed to create category', error.message);
            return res.status(500).json({ success: false, error: 'Failed to create category' });
        }
    });
    router.put('/categories/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, error: 'Invalid category ID' });
            const { name, description, color, active } = req.body || {};
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
            if (color !== undefined) {
                fields.push(`color = $${idx++}`);
                values.push(color);
            }
            if (active !== undefined) {
                fields.push(`active = $${idx++}`);
                values.push(!!active);
            }
            if (fields.length === 0)
                return res.json({ success: true, message: 'No changes' });
            values.push(id);
            const update = await db.query(`UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id,name,description,color,active,created_at,updated_at`, values);
            if (update.rowCount === 0)
                return res.status(404).json({ success: false, error: 'Category not found' });
            return res.json({ success: true, data: update.rows[0] });
        }
        catch (error) {
            logger.error('Failed to update category', error.message);
            return res.status(500).json({ success: false, error: 'Failed to update category' });
        }
    });
    router.delete('/categories/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, error: 'Invalid category ID' });
            const del = await db.query('DELETE FROM categories WHERE id = $1', [id]);
            if (del.rowCount === 0)
                return res.status(404).json({ success: false, error: 'Category not found' });
            return res.json({ success: true, message: 'Category deleted' });
        }
        catch (error) {
            logger.error('Failed to delete category', error.message);
            return res.status(500).json({ success: false, error: 'Failed to delete category' });
        }
    });
    return router;
}
