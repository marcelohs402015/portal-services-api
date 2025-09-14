// =====================================================
// Portal Services - Base Repository
// =====================================================

import { Database } from '../database/Database.js';
import { QueryParams, ApiResponse } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected db: Database;
  protected logger: Logger;
  protected tableName: string;
  protected primaryKey: string;

  constructor(db: Database, tableName: string, primaryKey: string = 'id') {
    this.db = db;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.logger = createLogger(`${this.constructor.name}`);
  }

  // Métodos abstratos que devem ser implementados pelas classes filhas
  protected abstract mapRowToEntity(row: any): T;
  protected abstract getInsertFields(): string[];
  protected abstract getInsertValues(dto: CreateDTO): any[];
  protected abstract getUpdateFields(dto: UpdateDTO): string[];
  protected abstract getUpdateValues(dto: UpdateDTO): any[];

  // Métodos comuns para todas as entidades
  async findAll(params: QueryParams = {}): Promise<ApiResponse<T[]>> {
    try {
      const { page = 1, limit = 10, offset, sort_by, sort_order = 'asc', search, active } = params;
      
      let query = `SELECT * FROM ${this.tableName}`;
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Filtros
      if (search) {
        conditions.push(`name ILIKE $${paramIndex}`);
        values.push(`%${search}%`);
        paramIndex++;
      }

      if (active !== undefined) {
        conditions.push(`active = $${paramIndex}`);
        values.push(active);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Ordenação
      if (sort_by) {
        query += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
      } else {
        query += ` ORDER BY created_at DESC`;
      }

      // Paginação
      const actualOffset = offset !== undefined ? offset : (page - 1) * limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, actualOffset);

      const result = await this.db.query(query, values);
      const entities = result.rows.map(row => this.mapRowToEntity(row));

      // Contar total de registros
      let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await this.db.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      return {
        success: true,
        data: entities,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error finding all ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findById(id: string): Promise<ApiResponse<T | null>> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
      const result = await this.db.query(query, [id]);
      
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
      this.logger.error(`Error finding ${this.tableName} by id:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async create(dto: CreateDTO): Promise<ApiResponse<T>> {
    try {
      const fields = this.getInsertFields();
      const values = this.getInsertValues(dto);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      const entity = this.mapRowToEntity(result.rows[0]);

      this.logger.info(`Created ${this.tableName}:`, { id: entity[this.primaryKey as keyof T] });
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      this.logger.error(`Error creating ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async update(id: string, dto: UpdateDTO): Promise<ApiResponse<T | null>> {
    try {
      const fields = this.getUpdateFields(dto);
      if (fields.length === 0) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      const values = this.getUpdateValues(dto);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE ${this.primaryKey} = $${fields.length + 1}
        RETURNING *
      `;

      const result = await this.db.query(query, [...values, id]);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      const entity = this.mapRowToEntity(result.rows[0]);
      this.logger.info(`Updated ${this.tableName}:`, { id });

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      this.logger.error(`Error updating ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
      const result = await this.db.query(query, [id]);
      
      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      this.logger.info(`Deleted ${this.tableName}:`, { id });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logger.error(`Error deleting ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async softDelete(id: string): Promise<ApiResponse<T | null>> {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET active = false, updated_at = CURRENT_TIMESTAMP
        WHERE ${this.primaryKey} = $1
        RETURNING *
      `;
      
      const result = await this.db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      const entity = this.mapRowToEntity(result.rows[0]);
      this.logger.info(`Soft deleted ${this.tableName}:`, { id });

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      this.logger.error(`Error soft deleting ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async count(params: QueryParams = {}): Promise<ApiResponse<number>> {
    try {
      const { search, active } = params;
      
      let query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (search) {
        conditions.push(`name ILIKE $${paramIndex}`);
        values.push(`%${search}%`);
        paramIndex++;
      }

      if (active !== undefined) {
        conditions.push(`active = $${paramIndex}`);
        values.push(active);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.db.query(query, values);
      const total = parseInt(result.rows[0].total);

      return {
        success: true,
        data: total
      };
    } catch (error) {
      this.logger.error(`Error counting ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async exists(id: string): Promise<ApiResponse<boolean>> {
    try {
      const query = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = $1 LIMIT 1`;
      const result = await this.db.query(query, [id]);
      
      return {
        success: true,
        data: result.rows.length > 0
      };
    } catch (error) {
      this.logger.error(`Error checking existence of ${this.tableName}:`, error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Método para executar queries customizadas
  protected async executeQuery(query: string, values: any[] = []): Promise<any[]> {
    try {
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      this.logger.error(`Error executing custom query:`, error);
      throw error;
    }
  }

  // Método para executar transações
  protected async executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
