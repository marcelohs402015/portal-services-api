// =====================================================
// Portal Services - Service Repository
// =====================================================

import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Service, CreateServiceDTO, UpdateServiceDTO, QueryParams, ApiResponse } from '../types/entities.js';

export class ServiceRepository extends BaseRepository<Service, CreateServiceDTO, UpdateServiceDTO> {
  constructor(db: Database) {
    super(db, 'services', 'id');
  }

  protected mapRowToEntity(row: any): Service {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      duration: row.duration,
      category_id: row.category_id,
      active: row.active,
      requires_quote: row.requires_quote,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  protected getInsertFields(): string[] {
    return ['name', 'description', 'price', 'duration', 'category_id', 'requires_quote'];
  }

  protected getInsertValues(dto: CreateServiceDTO): any[] {
    return [
      dto.name,
      dto.description || null,
      dto.price || null,
      dto.duration || null,
      dto.category_id || null,
      dto.requires_quote || false
    ];
  }

  protected getUpdateFields(dto: UpdateServiceDTO): string[] {
    const fields: string[] = [];
    if (dto.name !== undefined) fields.push('name');
    if (dto.description !== undefined) fields.push('description');
    if (dto.price !== undefined) fields.push('price');
    if (dto.duration !== undefined) fields.push('duration');
    if (dto.category_id !== undefined) fields.push('category_id');
    if (dto.active !== undefined) fields.push('active');
    if (dto.requires_quote !== undefined) fields.push('requires_quote');
    return fields;
  }

  protected getUpdateValues(dto: UpdateServiceDTO): any[] {
    const values: any[] = [];
    if (dto.name !== undefined) values.push(dto.name);
    if (dto.description !== undefined) values.push(dto.description);
    if (dto.price !== undefined) values.push(dto.price);
    if (dto.duration !== undefined) values.push(dto.duration);
    if (dto.category_id !== undefined) values.push(dto.category_id);
    if (dto.active !== undefined) values.push(dto.active);
    if (dto.requires_quote !== undefined) values.push(dto.requires_quote);
    return values;
  }

  // Métodos específicos para serviços
  async findByCategory(categoryId: string): Promise<ApiResponse<Service[]>> {
    try {
      const query = `
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.category_id = $1 AND s.active = true
        ORDER BY s.name ASC
      `;
      const result = await this.db.query(query, [categoryId]);
      const services = result.rows.map(row => this.mapRowToEntity(row));

      return {
        success: true,
        data: services
      };
    } catch (error) {
      this.logger.error('Error finding services by category:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findByName(name: string): Promise<ApiResponse<Service | null>> {
    try {
      const query = `
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.name = $1
      `;
      const result = await this.db.query(query, [name]);
      
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
      this.logger.error('Error finding service by name:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findActive(): Promise<ApiResponse<Service[]>> {
    try {
      const query = `
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.active = true
        ORDER BY c.sort_order ASC, s.name ASC
      `;
      const result = await this.db.query(query);
      const services = result.rows.map(row => this.mapRowToEntity(row));

      return {
        success: true,
        data: services
      };
    } catch (error) {
      this.logger.error('Error finding active services:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async searchServices(searchTerm: string, limit: number = 10): Promise<ApiResponse<Service[]>> {
    try {
      const query = `
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.active = true 
        AND (
          s.name ILIKE $1 
          OR s.description ILIKE $1
          OR c.name ILIKE $1
        )
        ORDER BY s.name ASC
        LIMIT $2
      `;
      const result = await this.db.query(query, [`%${searchTerm}%`, limit]);
      const services = result.rows.map(row => this.mapRowToEntity(row));

      return {
        success: true,
        data: services
      };
    } catch (error) {
      this.logger.error('Error searching services:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getServiceStats(): Promise<ApiResponse<{ total: number; active: number; inactive: number; by_category: any[] }>> {
    try {
      const [totalResult, activeResult, categoryResult] = await Promise.all([
        this.count(),
        this.count({ active: true }),
        this.db.query(`
          SELECT 
            c.name as category_name,
            c.color as category_color,
            COUNT(s.id) as service_count
          FROM categories c
          LEFT JOIN services s ON c.id = s.category_id
          WHERE c.active = true
          GROUP BY c.id, c.name, c.color
          ORDER BY service_count DESC
        `)
      ]);

      if (!totalResult.success || !activeResult.success) {
        return {
          success: false,
          error: 'Erro ao obter estatísticas dos serviços'
        };
      }

      return {
        success: true,
        data: {
          total: totalResult.data,
          active: activeResult.data,
          inactive: totalResult.data - activeResult.data,
          by_category: categoryResult.rows
        }
      };
    } catch (error) {
      this.logger.error('Error getting service stats:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findRequiringQuote(): Promise<ApiResponse<Service[]>> {
    try {
      const query = `
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.requires_quote = true AND s.active = true
        ORDER BY s.name ASC
      `;
      const result = await this.db.query(query);
      const services = result.rows.map(row => this.mapRowToEntity(row));

      return {
        success: true,
        data: services
      };
    } catch (error) {
      this.logger.error('Error finding services requiring quote:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
