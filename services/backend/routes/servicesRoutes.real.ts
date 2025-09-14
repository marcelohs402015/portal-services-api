import { Router, Request, Response } from 'express';
import { Database } from '../database/Database.js';
import { createLogger } from '../shared/logger.js';

const logger = createLogger('ServicesRoutesReal');

export function createServicesRoutesReal(db: Database): Router {
  const router = Router();

  // Get services with filters
  router.get('/services', async (req: Request, res: Response) => {
    try {
      let query = 'SELECT * FROM services WHERE 1=1';
      const params: any[] = [];
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
      return res.json({ success: true, data: (result as any).rows });
    } catch (error) {
      logger.error('Failed to get services', (error as Error).message);
      return res.status(500).json({ success: false, error: 'Failed to retrieve services' });
    }
  });

  // Get service by ID
  router.get('/services/:id', async (req: Request, res: Response) => {
    try {
      const result = await db.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
      if ((result as any).rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Service not found' });
      }
      return res.json({ success: true, data: (result as any).rows[0] });
    } catch (error) {
      logger.error('Failed to get service', (error as Error).message);
      return res.status(500).json({ success: false, error: 'Failed to retrieve service' });
    }
  });

  // Create service
  router.post('/services', async (req: Request, res: Response) => {
    try {
      const { name, description, category, price = 0, duration, active = true } = req.body;
      
      if (!name || !description || !category) {
        return res.status(400).json({ success: false, error: 'Name, description, and category are required' });
      }

      const result = await db.query(
        'INSERT INTO services (name, description, category, price, duration, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, category, parseFloat(price), duration, active]
      );

      return res.status(201).json({ success: true, data: (result as any).rows[0], message: 'Service created successfully' });
    } catch (error) {
      logger.error('Failed to create service', (error as Error).message);
      return res.status(500).json({ success: false, error: 'Failed to create service' });
    }
  });

  // Update service
  router.put('/services/:id', async (req: Request, res: Response) => {
    try {
      const { name, description, category, price, duration, active } = req.body;
      
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
      if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
      if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
      if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(parseFloat(price)); }
      if (duration !== undefined) { fields.push(`duration = $${idx++}`); values.push(duration); }
      if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }

      if (fields.length === 0) {
        return res.json({ success: true, message: 'No changes to update' });
      }

      values.push(req.params.id);
      const result = await db.query(
        `UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if ((result as any).rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Service not found' });
      }

      return res.json({ success: true, data: (result as any).rows[0], message: 'Service updated successfully' });
    } catch (error) {
      logger.error('Failed to update service', (error as Error).message);
      return res.status(500).json({ success: false, error: 'Failed to update service' });
    }
  });

  // Delete service
  router.delete('/services/:id', async (req: Request, res: Response) => {
    try {
      const result = await db.query('DELETE FROM services WHERE id = $1', [req.params.id]);
      if ((result as any).rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Service not found' });
      }
      return res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete service', (error as Error).message);
      return res.status(500).json({ success: false, error: 'Failed to delete service' });
    }
  });

  return router;
}
