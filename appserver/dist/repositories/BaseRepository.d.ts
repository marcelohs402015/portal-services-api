import { Database } from '../database/Database.js';
import { QueryParams, ApiResponse } from '../types/entities.js';
import { Logger } from 'winston';
export declare abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
    protected db: Database;
    protected logger: Logger;
    protected tableName: string;
    protected primaryKey: string;
    constructor(db: Database, tableName: string, primaryKey?: string);
    protected abstract mapRowToEntity(row: any): T;
    protected abstract getInsertFields(): string[];
    protected abstract getInsertValues(dto: CreateDTO): any[];
    protected abstract getUpdateFields(dto: UpdateDTO): string[];
    protected abstract getUpdateValues(dto: UpdateDTO): any[];
    findAll(params?: QueryParams): Promise<ApiResponse<T[]>>;
    findById(id: string): Promise<ApiResponse<T | null>>;
    create(dto: CreateDTO): Promise<ApiResponse<T>>;
    update(id: string, dto: UpdateDTO): Promise<ApiResponse<T | null>>;
    delete(id: string): Promise<ApiResponse<boolean>>;
    softDelete(id: string): Promise<ApiResponse<T | null>>;
    count(params?: QueryParams): Promise<ApiResponse<number>>;
    exists(id: string): Promise<ApiResponse<boolean>>;
    protected executeQuery(query: string, values?: any[]): Promise<any[]>;
    protected executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=BaseRepository.d.ts.map