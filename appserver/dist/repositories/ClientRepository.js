"use strict";
// =====================================================
// Portal Services - Client Repository
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRepository = void 0;
const BaseRepository_js_1 = require("./BaseRepository.js");
class ClientRepository extends BaseRepository_js_1.BaseRepository {
    constructor(db) {
        super(db, 'clients', 'id');
    }
    mapRowToEntity(row) {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            phone_secondary: row.phone_secondary,
            address: row.address,
            city: row.city,
            state: row.state,
            zip_code: row.zip_code,
            document: row.document,
            document_type: row.document_type || 'cpf',
            notes: row.notes,
            active: row.active || true,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }
    getInsertFields() {
        return [
            'name', 'email', 'phone', 'address', 'notes'
        ];
    }
    getInsertValues(dto) {
        return [
            dto.name,
            dto.email || null,
            dto.phone || null,
            dto.address || null,
            dto.notes || null
        ];
    }
    getUpdateFields(dto) {
        const fields = [];
        if (dto.name !== undefined)
            fields.push('name');
        if (dto.email !== undefined)
            fields.push('email');
        if (dto.phone !== undefined)
            fields.push('phone');
        if (dto.phone_secondary !== undefined)
            fields.push('phone_secondary');
        if (dto.address !== undefined)
            fields.push('address');
        if (dto.city !== undefined)
            fields.push('city');
        if (dto.state !== undefined)
            fields.push('state');
        if (dto.zip_code !== undefined)
            fields.push('zip_code');
        if (dto.document !== undefined)
            fields.push('document');
        if (dto.document_type !== undefined)
            fields.push('document_type');
        if (dto.notes !== undefined)
            fields.push('notes');
        if (dto.active !== undefined)
            fields.push('active');
        return fields;
    }
    getUpdateValues(dto) {
        const values = [];
        if (dto.name !== undefined)
            values.push(dto.name);
        if (dto.email !== undefined)
            values.push(dto.email);
        if (dto.phone !== undefined)
            values.push(dto.phone);
        if (dto.phone_secondary !== undefined)
            values.push(dto.phone_secondary);
        if (dto.address !== undefined)
            values.push(dto.address);
        if (dto.city !== undefined)
            values.push(dto.city);
        if (dto.state !== undefined)
            values.push(dto.state);
        if (dto.zip_code !== undefined)
            values.push(dto.zip_code);
        if (dto.document !== undefined)
            values.push(dto.document);
        if (dto.document_type !== undefined)
            values.push(dto.document_type);
        if (dto.notes !== undefined)
            values.push(dto.notes);
        if (dto.active !== undefined)
            values.push(dto.active);
        return values;
    }
    async findByDocument(document) {
        try {
            const query = `SELECT * FROM clients WHERE document = $1 LIMIT 1`;
            const result = await this.db.query(query, [document]);
            if (result.rows.length === 0) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: true,
                data: this.mapRowToEntity(result.rows[0])
            };
        }
        catch (error) {
            this.logger.error('Error finding client by document:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Métodos específicos para clientes
    async findByEmail(email) {
        try {
            const query = `SELECT * FROM clients WHERE email = $1 LIMIT 1`;
            const result = await this.db.query(query, [email]);
            if (result.rows.length === 0) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: true,
                data: this.mapRowToEntity(result.rows[0])
            };
        }
        catch (error) {
            this.logger.error('Error finding client by email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async findByPhone(phone) {
        try {
            const query = `SELECT * FROM clients WHERE phone = $1 LIMIT 1`;
            const result = await this.db.query(query, [phone]);
            if (result.rows.length === 0) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: true,
                data: this.mapRowToEntity(result.rows[0])
            };
        }
        catch (error) {
            this.logger.error('Error finding client by phone:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async searchClients(searchTerm, limit = 10) {
        try {
            const query = `
        SELECT * FROM clients 
        WHERE active = true 
        AND (
          name ILIKE $1 
          OR email ILIKE $1 
          OR phone ILIKE $1
        )
        ORDER BY name ASC
        LIMIT $2
      `;
            const result = await this.db.query(query, [`%${searchTerm}%`, limit]);
            const clients = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: clients
            };
        }
        catch (error) {
            this.logger.error('Error searching clients:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getClientStats() {
        try {
            const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = true THEN 1 END) as active,
          COUNT(CASE WHEN active = false THEN 1 END) as inactive
        FROM clients
      `;
            const result = await this.db.query(query);
            const stats = result.rows[0];
            return {
                success: true,
                data: {
                    total: parseInt(stats.total),
                    active: parseInt(stats.active),
                    inactive: parseInt(stats.inactive)
                }
            };
        }
        catch (error) {
            this.logger.error('Error getting client stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async findActive() {
        try {
            const query = `
        SELECT * FROM clients 
        WHERE active = true 
        ORDER BY name ASC
      `;
            const result = await this.db.query(query);
            const clients = result.rows.map(row => this.mapRowToEntity(row));
            return {
                success: true,
                data: clients
            };
        }
        catch (error) {
            this.logger.error('Error finding active clients:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
exports.ClientRepository = ClientRepository;
