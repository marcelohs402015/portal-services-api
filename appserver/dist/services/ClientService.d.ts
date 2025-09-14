import { Database } from '../database/Database.js';
import { Client, CreateClientDTO, UpdateClientDTO, QueryParams, ApiResponse } from '../types/entities.js';
export declare class ClientService {
    private repository;
    private logger;
    constructor(db: Database);
    getAllClients(params?: QueryParams): Promise<ApiResponse<Client[]>>;
    getClientById(id: string): Promise<ApiResponse<Client | null>>;
    getActiveClients(): Promise<ApiResponse<Client[]>>;
    getClientByEmail(email: string): Promise<ApiResponse<Client | null>>;
    getClientByPhone(phone: string): Promise<ApiResponse<Client | null>>;
    getClientByDocument(document: string): Promise<ApiResponse<Client | null>>;
    searchClients(searchTerm: string, limit?: number): Promise<ApiResponse<Client[]>>;
    createClient(dto: CreateClientDTO): Promise<ApiResponse<Client>>;
    updateClient(id: string, dto: UpdateClientDTO): Promise<ApiResponse<Client | null>>;
    deleteClient(id: string): Promise<ApiResponse<boolean>>;
    softDeleteClient(id: string): Promise<ApiResponse<Client | null>>;
    getClientStats(): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
    }>>;
    private checkClientHasRelatedData;
}
//# sourceMappingURL=ClientService.d.ts.map