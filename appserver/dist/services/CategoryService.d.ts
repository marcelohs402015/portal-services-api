import { Database } from '../database/Database.js';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, QueryParams, ApiResponse } from '../types/entities.js';
export declare class CategoryService {
    private repository;
    private logger;
    constructor(db: Database);
    getAllCategories(params?: QueryParams): Promise<ApiResponse<Category[]>>;
    getCategoryById(id: string): Promise<ApiResponse<Category | null>>;
    getActiveCategories(): Promise<ApiResponse<Category[]>>;
    createCategory(dto: CreateCategoryDTO): Promise<ApiResponse<Category>>;
    updateCategory(id: string, dto: UpdateCategoryDTO): Promise<ApiResponse<Category | null>>;
    deleteCategory(id: string): Promise<ApiResponse<boolean>>;
    softDeleteCategory(id: string): Promise<ApiResponse<Category | null>>;
    updateCategoryOrder(categoryIds: string[]): Promise<ApiResponse<boolean>>;
    getCategoryStats(): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
    }>>;
    private checkCategoryHasServices;
}
//# sourceMappingURL=CategoryService.d.ts.map