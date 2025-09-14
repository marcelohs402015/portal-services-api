import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, ApiResponse } from '../types/entities.js';
export declare class CategoryRepository extends BaseRepository<Category, CreateCategoryDTO, UpdateCategoryDTO> {
    constructor(db: Database);
    protected mapRowToEntity(row: any): Category;
    protected getInsertFields(): string[];
    protected getInsertValues(dto: CreateCategoryDTO): any[];
    protected getUpdateFields(dto: UpdateCategoryDTO): string[];
    protected getUpdateValues(dto: UpdateCategoryDTO): any[];
    findActive(): Promise<ApiResponse<Category[]>>;
    findByName(name: string): Promise<ApiResponse<Category | null>>;
}
//# sourceMappingURL=CategoryRepository.d.ts.map