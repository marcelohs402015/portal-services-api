// =====================================================
// Portal Services - Client Repository
// =====================================================

import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Client, CreateClientDTO, UpdateClientDTO, QueryParams, ApiResponse } from '../types/entities.js';

export class ClientRepository extends BaseRepository<Client, CreateClientDTO, UpdateClientDTO> {
  constructor(db: Database) {
    super(db, 'clients', 'id');
  }

  protected mapRowToEntity(row: any): Client {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      notes: row.notes,
      active: row.active || true,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  protected getInsertFields(): string[] {
    return [
      'name', 'email', 'phone', 'address', 'notes'
    ];
  }

  protected getInsertValues(dto: CreateClientDTO): any[] {
    return [
      dto.name,
      dto.email || null,
      dto.phone || null,
      dto.address || null,
      dto.notes || null
    ];
  }

  protected getUpdateFields(dto: UpdateClientDTO): string[] {
    const fields: string[] = [];
    if (dto.name !== undefined) fields.push('name');
    if (dto.email !== undefined) fields.push('email');
    if (dto.phone !== undefined) fields.push('phone');
    if (dto.address !== undefined) fields.push('address');
    if (dto.notes !== undefined) fields.push('notes');
    if (dto.active !== undefined) fields.push('active');
    return fields;
  }

  protected getUpdateValues(dto: UpdateClientDTO): any[] {
    const values: any[] = [];
    if (dto.name !== undefined) values.push(dto.name);
    if (dto.email !== undefined) values.push(dto.email);
    if (dto.phone !== undefined) values.push(dto.phone);
    if (dto.address !== undefined) values.push(dto.address);
    if (dto.notes !== undefined) values.push(dto.notes);
    if (dto.active !== undefined) values.push(dto.active);
    return values;
  }

  // Métodos específicos para clientes
  async findByEmail(email: string): Promise<ApiResponse<Client | null>> {
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
    } catch (error) {
      this.logger.error('Error finding client by email:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findByPhone(phone: string): Promise<ApiResponse<Client | null>> {
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
    } catch (error) {
      this.logger.error('Error finding client by phone:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }


  async searchClients(searchTerm: string, limit: number = 10): Promise<ApiResponse<Client[]>> {
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
    } catch (error) {
      this.logger.error('Error searching clients:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientStats(): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> {
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
    } catch (error) {
      this.logger.error('Error getting client stats:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findActive(): Promise<ApiResponse<Client[]>> {
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
    } catch (error) {
      this.logger.error('Error finding active clients:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
