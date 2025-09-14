// =====================================================
// Portal Services - Quotation Repository
// =====================================================
import { BaseRepository } from './BaseRepository.js';
export class QuotationRepository extends BaseRepository {
    constructor(db) {
        super(db, 'quotations', 'id');
    }
    mapRowToEntity(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            total_amount: parseFloat(row.total_amount),
            discount_amount: parseFloat(row.discount_amount),
            final_amount: parseFloat(row.final_amount),
            client_id: row.client_id,
            status: row.status,
            valid_until: row.valid_until ? new Date(row.valid_until) : undefined,
            notes: row.notes,
            created_by: row.created_by,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }
    getInsertFields() {
        return ['title', 'description', 'client_id', 'valid_until', 'notes', 'created_by'];
    }
    getInsertValues(dto) {
        return [
            dto.title,
            dto.description || null,
            dto.client_id,
            dto.valid_until || null,
            dto.notes || null,
            dto.created_by || null
        ];
    }
    getUpdateFields(dto) {
        const fields = [];
        if (dto.title !== undefined)
            fields.push('title');
        if (dto.description !== undefined)
            fields.push('description');
        if (dto.client_id !== undefined)
            fields.push('client_id');
        if (dto.status !== undefined)
            fields.push('status');
        if (dto.valid_until !== undefined)
            fields.push('valid_until');
        if (dto.notes !== undefined)
            fields.push('notes');
        if (dto.discount_amount !== undefined)
            fields.push('discount_amount');
        return fields;
    }
    getUpdateValues(dto) {
        const values = [];
        if (dto.title !== undefined)
            values.push(dto.title);
        if (dto.description !== undefined)
            values.push(dto.description);
        if (dto.client_id !== undefined)
            values.push(dto.client_id);
        if (dto.status !== undefined)
            values.push(dto.status);
        if (dto.valid_until !== undefined)
            values.push(dto.valid_until);
        if (dto.notes !== undefined)
            values.push(dto.notes);
        if (dto.discount_amount !== undefined)
            values.push(dto.discount_amount);
        return values;
    }
    // Métodos específicos para orçamentos
    async findByClient(clientId) {
        try {
            const query = `
        SELECT q.*, c.name as client_name, c.email as client_email
        FROM quotations q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE q.client_id = $1
        ORDER BY q.created_at DESC
      `;
            const result = await this.db.query(query, [clientId]);
            const quotations = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: quotations
            };
        }
        catch (error) {
            this.logger.error('Error finding quotations by client:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async findByStatus(status) {
        try {
            const query = `
        SELECT q.*, c.name as client_name, c.email as client_email
        FROM quotations q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE q.status = $1
        ORDER BY q.created_at DESC
      `;
            const result = await this.db.query(query, [status]);
            const quotations = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: quotations
            };
        }
        catch (error) {
            this.logger.error('Error finding quotations by status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async findExpired() {
        try {
            const query = `
        SELECT q.*, c.name as client_name, c.email as client_email
        FROM quotations q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE q.valid_until < CURRENT_DATE 
        AND q.status IN ('draft', 'sent')
        ORDER BY q.valid_until ASC
      `;
            const result = await this.db.query(query);
            const quotations = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: quotations
            };
        }
        catch (error) {
            this.logger.error('Error finding expired quotations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async findExpiringSoon(days = 7) {
        try {
            const query = `
        SELECT q.*, c.name as client_name, c.email as client_email
        FROM quotations q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE q.valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
        AND q.status IN ('draft', 'sent')
        ORDER BY q.valid_until ASC
      `;
            const result = await this.db.query(query);
            const quotations = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: quotations
            };
        }
        catch (error) {
            this.logger.error('Error finding expiring quotations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getQuotationStats() {
        try {
            const [totalResult, statusResult, valueResult, expiringResult, expiredResult] = await Promise.all([
                this.count(),
                this.executeQuery(`
          SELECT 
            status,
            COUNT(*) as count,
            COALESCE(SUM(final_amount), 0) as total_value
          FROM quotations
          GROUP BY status
          ORDER BY count DESC
        `),
                this.executeQuery(`
          SELECT 
            COALESCE(SUM(final_amount), 0) as total_value,
            COALESCE(AVG(final_amount), 0) as average_value
          FROM quotations
          WHERE status = 'approved'
        `),
                this.executeQuery(`
          SELECT COUNT(*) as count
          FROM quotations
          WHERE valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
          AND status IN ('draft', 'sent')
        `),
                this.executeQuery(`
          SELECT COUNT(*) as count
          FROM quotations
          WHERE valid_until < CURRENT_DATE
          AND status IN ('draft', 'sent')
        `)
            ]);
            if (!totalResult.success) {
                return {
                    success: false,
                    error: 'Erro ao obter estatísticas dos orçamentos'
                };
            }
            return {
                success: true,
                data: {
                    total: totalResult.data,
                    by_status: statusResult,
                    total_value: parseFloat(valueResult[0]?.total_value || '0'),
                    average_value: parseFloat(valueResult[0]?.average_value || '0'),
                    expiring_soon: parseInt(expiringResult[0]?.count || '0'),
                    expired: parseInt(expiredResult[0]?.count || '0')
                }
            };
        }
        catch (error) {
            this.logger.error('Error getting quotation stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async updateStatus(id, status) {
        try {
            const query = `
        UPDATE quotations 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
            const result = await this.db.query(query, [status, id]);
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Orçamento não encontrado'
                };
            }
            const quotation = this.mapRowToEntity(result.rows[0]);
            this.logger.info(`Updated quotation status:`, { id, status });
            return {
                success: true,
                data: quotation
            };
        }
        catch (error) {
            this.logger.error('Error updating quotation status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async markAsExpired() {
        try {
            const query = `
        UPDATE quotations 
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE valid_until < CURRENT_DATE 
        AND status IN ('draft', 'sent')
        RETURNING id
      `;
            const result = await this.db.query(query);
            this.logger.info(`Marked ${result.rows.length} quotations as expired`);
            return {
                success: true,
                data: result.rows.length
            };
        }
        catch (error) {
            this.logger.error('Error marking quotations as expired:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
//# sourceMappingURL=QuotationRepository.js.map