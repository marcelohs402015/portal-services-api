// =====================================================
// Portal Services - Category Repository
// =====================================================

import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, QueryParams, ApiResponse } from '../types/entities.js';

export class CategoryRepository extends BaseRepository<Category, CreateCategoryDTO, UpdateCategoryDTO> {
  constructor(db: Database) {
    super(db, 'categories', 'id');
  }

  protected mapRowToEntity(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      active: row.active || true,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  protected getInsertFields(): string[] {
    return ['name', 'description', 'keywords', 'patterns', 'domains', 'color'];
  }

  protected getInsertValues(dto: CreateCategoryDTO): any[] {
    return [
      dto.name,
      dto.description || null,
      JSON.stringify(dto.keywords || []),
      JSON.stringify(dto.patterns || []),
      JSON.stringify(dto.domains || []),
      dto.color || '#FF6B6B'
    ];
  }

  protected getUpdateFields(dto: UpdateCategoryDTO): string[] {
    const fields: string[] = [];
    if (dto.name !== undefined) fields.push('name');
    if (dto.description !== undefined) fields.push('description');
    if (dto.keywords !== undefined) fields.push('keywords');
    if (dto.patterns !== undefined) fields.push('patterns');
    if (dto.domains !== undefined) fields.push('domains');
    if (dto.color !== undefined) fields.push('color');
    if (dto.active !== undefined) fields.push('active');
    return fields;
  }

  protected getUpdateValues(dto: UpdateCategoryDTO): any[] {
    const values: any[] = [];
    if (dto.name !== undefined) values.push(dto.name);
    if (dto.description !== undefined) values.push(dto.description);
    if (dto.keywords !== undefined) values.push(JSON.stringify(dto.keywords));
    if (dto.patterns !== undefined) values.push(JSON.stringify(dto.patterns));
    if (dto.domains !== undefined) values.push(JSON.stringify(dto.domains));
    if (dto.color !== undefined) values.push(dto.color);
    if (dto.active !== undefined) values.push(dto.active);
    return values;
  }

  // Métodos específicos para categorias
  async findActive(): Promise<ApiResponse<Category[]>> {
    try {
      const query = `
        SELECT * FROM categories 
        WHERE active = true 
        ORDER BY name ASC
      `;
      const result = await this.db.query(query);
      const categories = result.rows.map(row => this.mapRowToEntity(row));

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      this.logger.error('Error finding active categories:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findByName(name: string): Promise<ApiResponse<Category | null>> {
    try {
      const query = `SELECT * FROM categories WHERE name ILIKE $1 LIMIT 1`;
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
      this.logger.error('Error finding category by name:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

}
