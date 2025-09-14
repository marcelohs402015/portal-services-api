import { Database } from './Database.js';
import { CategorizedEmail, EmailTemplate } from '../types/email.js';
import { FilterOptions, PaginationOptions } from '../types/database.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class EmailRepository {
  private db: Database;
  private logger: Logger;

  constructor(database: Database) {
    this.db = database;
    this.logger = createLogger('EmailRepository');
  }

  async saveEmail(email: Omit<CategorizedEmail, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategorizedEmail> {
    const query = `
      INSERT INTO emails (gmail_id, subject, sender, date, body, snippet, category, confidence, processed, responded, response_template)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, gmail_id, subject, sender as from, date, body, snippet, category, confidence, processed, responded, response_template, created_at, updated_at
    `;

    try {
      const result = await this.db.query<CategorizedEmail>(query, [
        email.gmailId,
        email.subject,
        email.from,
        email.date,
        email.body,
        email.snippet,
        email.category,
        email.confidence,
        email.processed,
        email.responded,
        email.responseTemplate
      ]);

      this.logger.info(`Email saved with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Failed to save email:', (error as Error).message);
      throw error;
    }
  }

  async getEmails(filters: FilterOptions = {}, pagination: PaginationOptions = { page: 1, limit: 50 }): Promise<{ emails: CategorizedEmail[], total: number }> {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }

    if (filters.from) {
      conditions.push(`sender ILIKE $${paramIndex++}`);
      params.push(`%${filters.from}%`);
    }

    if (filters.dateFrom) {
      conditions.push(`date >= $${paramIndex++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push(`date <= $${paramIndex++}`);
      params.push(filters.dateTo);
    }

    if (filters.responded !== undefined) {
      conditions.push(`responded = $${paramIndex++}`);
      params.push(filters.responded);
    }

    if (filters.processed !== undefined) {
      conditions.push(`processed = $${paramIndex++}`);
      params.push(filters.processed);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = pagination.sortBy || 'date';
    const sortOrder = pagination.sortOrder || 'DESC';
    const offset = (pagination.page - 1) * pagination.limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM emails ${whereClause}`;
    const countResult = await this.db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const query = `
      SELECT id, gmail_id, subject, sender as from, date, body, snippet, 
             category, confidence, processed, responded, response_template,
             created_at, updated_at
      FROM emails 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(pagination.limit, offset);

    try {
      const result = await this.db.query<CategorizedEmail>(query, params);
      
      this.logger.info(`Retrieved ${result.rows.length} emails (page ${pagination.page})`);
      
      return {
        emails: result.rows,
        total
      };
    } catch (error) {
      this.logger.error('Failed to get emails:', (error as Error).message);
      throw error;
    }
  }

  async getEmailById(id: number): Promise<CategorizedEmail | null> {
    const query = `
      SELECT id, gmail_id, subject, sender as from, date, body, snippet,
             category, confidence, processed, responded, response_template,
             created_at, updated_at
      FROM emails 
      WHERE id = $1
    `;

    try {
      const result = await this.db.query<CategorizedEmail>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error('Failed to get email by ID:', (error as Error).message);
      throw error;
    }
  }

  async updateEmailStatus(id: number, updates: { processed?: boolean, responded?: boolean, responseTemplate?: string }): Promise<boolean> {
    const setParts = [];
    const params = [];
    let paramIndex = 1;

    if (updates.processed !== undefined) {
      setParts.push(`processed = $${paramIndex++}`);
      params.push(updates.processed);
    }

    if (updates.responded !== undefined) {
      setParts.push(`responded = $${paramIndex++}`);
      params.push(updates.responded);
    }

    if (updates.responseTemplate !== undefined) {
      setParts.push(`response_template = $${paramIndex++}`);
      params.push(updates.responseTemplate);
    }

    if (setParts.length === 0) {
      return false;
    }

    const query = `
      UPDATE emails 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex++}
    `;
    params.push(id);

    try {
      const result = await this.db.query(query, params);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      this.logger.error('Failed to update email status:', (error as Error).message);
      throw error;
    }
  }

  async getEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = `
      SELECT id, name, subject, body, category, variables, created_at, updated_at
      FROM email_templates
    `;
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY name';

    try {
      const result = await this.db.query<EmailTemplate>(query, params);
      return result.rows;
    } catch (error) {
      this.logger.error('Failed to get email templates:', (error as Error).message);
      throw error;
    }
  }

  async createEmailTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const query = `
      INSERT INTO email_templates (name, subject, body, category, variables)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, subject, body, category, variables, created_at, updated_at
    `;

    try {
      const result = await this.db.query<EmailTemplate>(query, [
        templateData.name,
        templateData.subject,
        templateData.body,
        templateData.category,
        templateData.variables || null
      ]);

      this.logger.info(`Email template created with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Failed to create email template:', (error as Error).message);
      throw error;
    }
  }

  async updateEmailTemplate(id: string, templateData: Partial<Omit<EmailTemplate, 'id' | 'createdAt'>>): Promise<EmailTemplate | null> {
    const setParts = [];
    const params = [];
    let paramIndex = 1;

    if (templateData.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      params.push(templateData.name);
    }

    if (templateData.subject !== undefined) {
      setParts.push(`subject = $${paramIndex++}`);
      params.push(templateData.subject);
    }

    if (templateData.body !== undefined) {
      setParts.push(`body = $${paramIndex++}`);
      params.push(templateData.body);
    }

    if (templateData.category !== undefined) {
      setParts.push(`category = $${paramIndex++}`);
      params.push(templateData.category);
    }

    if (templateData.variables !== undefined) {
      setParts.push(`variables = $${paramIndex++}`);
      params.push(templateData.variables);
    }

    if (setParts.length === 0) {
      return null;
    }

    const query = `
      UPDATE email_templates 
      SET ${setParts.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++}
      RETURNING id, name, subject, body, category, variables, created_at, updated_at
    `;
    params.push(id);

    try {
      const result = await this.db.query<EmailTemplate>(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }

      this.logger.info(`Email template updated with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Failed to update email template:', (error as Error).message);
      throw error;
    }
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const query = 'DELETE FROM email_templates WHERE id = $1';

    try {
      const result = await this.db.query(query, [id]);
      const deleted = (result.rowCount || 0) > 0;
      
      if (deleted) {
        this.logger.info(`Email template deleted with ID: ${id}`);
      }
      
      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete email template:', (error as Error).message);
      throw error;
    }
  }

  async getCategoryStats(): Promise<Array<{ category: string, count: number, responded_count: number }>> {
    const query = `
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN responded = true THEN 1 END) as responded_count
      FROM emails 
      GROUP BY category
      ORDER BY count DESC
    `;

    try {
      const result = await this.db.query<{ category: string, count: string, responded_count: string }>(query);
      return result.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count),
        responded_count: parseInt(row.responded_count)
      }));
    } catch (error) {
      this.logger.error('Failed to get category stats:', (error as Error).message);
      throw error;
    }
  }
}