import { Database } from '../database/Database.js';
import { Service, CreateServiceDTO, UpdateServiceDTO, QueryParams, ApiResponse } from '../types/entities.js';
export declare class ServiceService {
    private repository;
    private logger;
    constructor(db: Database);
    getAllServices(params?: QueryParams): Promise<ApiResponse<Service[]>>;
    getServiceById(id: string): Promise<ApiResponse<Service | null>>;
    getActiveServices(): Promise<ApiResponse<Service[]>>;
    getServicesByCategory(categoryId: string): Promise<ApiResponse<Service[]>>;
    getServicesRequiringQuote(): Promise<ApiResponse<Service[]>>;
    searchServices(searchTerm: string, limit?: number): Promise<ApiResponse<Service[]>>;
    createService(dto: CreateServiceDTO): Promise<ApiResponse<Service>>;
    updateService(id: string, dto: UpdateServiceDTO): Promise<ApiResponse<Service | null>>;
    deleteService(id: string): Promise<ApiResponse<boolean>>;
    softDeleteService(id: string): Promise<ApiResponse<Service | null>>;
    getServiceStats(): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        by_category: any[];
    }>>;
    private checkServiceHasAppointments;
}
//# sourceMappingURL=ServiceService.d.ts.map