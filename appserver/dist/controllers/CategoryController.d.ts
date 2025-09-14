import { Request, Response } from 'express';
import { Database } from '../database/Database.js';
export declare class CategoryController {
    private service;
    private logger;
    constructor(db: Database);
    getAllCategories: (req: Request, res: Response) => Promise<void>;
    getActiveCategories: (req: Request, res: Response) => Promise<void>;
    getCategoryById: (req: Request, res: Response) => Promise<void>;
    createCategory: (req: Request, res: Response) => Promise<void>;
    updateCategory: (req: Request, res: Response) => Promise<void>;
    deleteCategory: (req: Request, res: Response) => Promise<void>;
    softDeleteCategory: (req: Request, res: Response) => Promise<void>;
    updateCategoryOrder: (req: Request, res: Response) => Promise<void>;
    getCategoryStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CategoryController.d.ts.map