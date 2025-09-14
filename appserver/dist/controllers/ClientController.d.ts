import { Request, Response } from 'express';
import { Database } from '../database/Database.js';
export declare class ClientController {
    private service;
    private logger;
    constructor(db: Database);
    getAllClients: (req: Request, res: Response) => Promise<void>;
    getActiveClients: (req: Request, res: Response) => Promise<void>;
    searchClients: (req: Request, res: Response) => Promise<void>;
    getClientByEmail: (req: Request, res: Response) => Promise<void>;
    getClientByPhone: (req: Request, res: Response) => Promise<void>;
    getClientByDocument: (req: Request, res: Response) => Promise<void>;
    getClientById: (req: Request, res: Response) => Promise<void>;
    createClient: (req: Request, res: Response) => Promise<void>;
    updateClient: (req: Request, res: Response) => Promise<void>;
    deleteClient: (req: Request, res: Response) => Promise<void>;
    softDeleteClient: (req: Request, res: Response) => Promise<void>;
    getClientStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ClientController.d.ts.map