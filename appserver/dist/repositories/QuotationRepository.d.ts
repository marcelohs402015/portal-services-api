import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Quotation, CreateQuotationDTO, UpdateQuotationDTO, ApiResponse } from '../types/entities.js';
export declare class QuotationRepository extends BaseRepository<Quotation, CreateQuotationDTO, UpdateQuotationDTO> {
    constructor(db: Database);
    protected mapRowToEntity(row: any): Quotation;
    protected getInsertFields(): string[];
    protected getInsertValues(dto: CreateQuotationDTO): any[];
    protected getUpdateFields(dto: UpdateQuotationDTO): string[];
    protected getUpdateValues(dto: UpdateQuotationDTO): any[];
    findByClient(clientId: string): Promise<ApiResponse<Quotation[]>>;
    findByStatus(status: string): Promise<ApiResponse<Quotation[]>>;
    findExpired(): Promise<ApiResponse<Quotation[]>>;
    findExpiringSoon(days?: number): Promise<ApiResponse<Quotation[]>>;
    getQuotationStats(): Promise<ApiResponse<{
        total: number;
        by_status: any[];
        total_value: number;
        average_value: number;
        expiring_soon: number;
        expired: number;
    }>>;
    updateStatus(id: string, status: string): Promise<ApiResponse<Quotation | null>>;
    markAsExpired(): Promise<ApiResponse<number>>;
}
//# sourceMappingURL=QuotationRepository.d.ts.map