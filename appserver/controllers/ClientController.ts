// =====================================================
// Portal Services - Client Controller
// =====================================================

import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService.js';
import { Database } from '../database/Database.js';
import { QueryParams } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class ClientController {
  private service: ClientService;
  private logger: Logger;

  constructor(db: Database) {
    this.service = new ClientService(db);
    this.logger = createLogger('ClientController');
  }

  // GET /api/clients
  getAllClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const params: QueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
        search: req.query.search as string,
        active: req.query.active ? req.query.active === 'true' : undefined
      };

      const result = await this.service.getAllClients(params);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getAllClients controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/active
  getActiveClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getActiveClients();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getActiveClients controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/search
  searchClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: searchTerm, limit } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Parâmetro de busca é obrigatório'
        });
        return;
      }

      const result = await this.service.searchClients(
        searchTerm, 
        limit ? parseInt(limit as string) : 10
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in searchClients controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/email/:email
  getClientByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const result = await this.service.getClientByEmail(email);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getClientByEmail controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/phone/:phone
  getClientByPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.params;
      const result = await this.service.getClientByPhone(phone);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getClientByPhone controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/document/:document
  getClientByDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { document } = req.params;
      const result = await this.service.getClientByDocument(document);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getClientByDocument controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/:id
  getClientById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getClientById(id);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Cliente não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getClientById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // POST /api/clients
  createClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.createClient(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in createClient controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PUT /api/clients/:id
  updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateClient(id, req.body);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Cliente não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in updateClient controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // DELETE /api/clients/:id
  deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteClient(id);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Cliente excluído com sucesso'
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in deleteClient controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PATCH /api/clients/:id/soft-delete
  softDeleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.softDeleteClient(id);
      
      if (result.success) {
        if (result.data) {
          res.json({
            success: true,
            message: 'Cliente desativado com sucesso',
            data: result.data
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Cliente não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in softDeleteClient controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/clients/stats
  getClientStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getClientStats();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getClientStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}
