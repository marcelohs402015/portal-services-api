import { Request, Response } from 'express';
import { Database } from '../database/Database.js';
export declare class ServiceController {
    private service;
    private logger;
    constructor(db: Database);
    getAllServices: (req: Request, res: Response) => Promise<void>;
    getActiveServices: (req: Request, res: Response) => Promise<void>;
    getServicesByCategory: (req: Request, res: Response) => Promise<void>;
    getServicesRequiringQuote: (req: Request, res: Response) => Promise<void>;
    searchServices: (req: Request, res: Response) => Promise<void>;
    getServiceById: (req: Request, res: Response) => Promise<void>;
    createService: (req: Request, res: Response) => Promise<void>;
    updateService: (req: Request, res: Response) => Promise<void>;
    deleteService: (req: Request, res: Response) => Promise<void>;
    softDeleteService: (req: Request, res: Response) => Promise<void>;
    getServiceStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ServiceController.d.ts.map