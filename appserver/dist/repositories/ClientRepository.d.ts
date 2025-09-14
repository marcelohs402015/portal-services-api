import { BaseRepository } from './BaseRepository.js';
import { Database } from '../database/Database.js';
import { Client, CreateClientDTO, UpdateClientDTO, ApiResponse } from '../types/entities.js';
export declare class ClientRepository extends BaseRepository<Client, CreateClientDTO, UpdateClientDTO> {
    constructor(db: Database);
    protected mapRowToEntity(row: any): Client;
    protected getInsertFields(): string[];
    protected getInsertValues(dto: CreateClientDTO): any[];
    protected getUpdateFields(dto: UpdateClientDTO): string[];
    protected getUpdateValues(dto: UpdateClientDTO): any[];
    findByEmail(email: string): Promise<ApiResponse<Client | null>>;
    findByPhone(phone: string): Promise<ApiResponse<Client | null>>;
    searchClients(searchTerm: string, limit?: number): Promise<ApiResponse<Client[]>>;
    getClientStats(): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
    }>>;
    findActive(): Promise<ApiResponse<Client[]>>;
}
//# sourceMappingURL=ClientRepository.d.ts.map