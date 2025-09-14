import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Service, CreateServiceDTO, UpdateServiceDTO, ApiResponse } from '../types/entities.js';
export declare class ServiceRepository extends BaseRepository<Service, CreateServiceDTO, UpdateServiceDTO> {
    constructor(db: Database);
    protected mapRowToEntity(row: any): Service;
    protected getInsertFields(): string[];
    protected getInsertValues(dto: CreateServiceDTO): any[];
    protected getUpdateFields(dto: UpdateServiceDTO): string[];
    protected getUpdateValues(dto: UpdateServiceDTO): any[];
    findByCategory(categoryId: string): Promise<ApiResponse<Service[]>>;
    findActive(): Promise<ApiResponse<Service[]>>;
    searchServices(searchTerm: string, limit?: number): Promise<ApiResponse<Service[]>>;
    getServiceStats(): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        by_category: any[];
    }>>;
    findRequiringQuote(): Promise<ApiResponse<Service[]>>;
}
//# sourceMappingURL=ServiceRepository.d.ts.map