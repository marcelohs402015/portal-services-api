// =====================================================
// Portal Services - Service Controller
// =====================================================

import { Request, Response } from 'express';
import { ServiceService } from '../services/ServiceService.js';
import { Database } from '../database/Database.js';
import { QueryParams } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class ServiceController {
  private service: ServiceService;
  private logger: Logger;

  constructor(db: Database) {
    this.service = new ServiceService(db);
    this.logger = createLogger('ServiceController');
  }

  // GET /api/services
  getAllServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const params: QueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
        search: req.query.search as string,
        active: req.query.active ? req.query.active === 'true' : undefined,
        category_id: req.query.category_id as string
      };

      const result = await this.service.getAllServices(params);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getAllServices controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/active
  getActiveServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getActiveServices();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getActiveServices controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/category/:categoryId
  getServicesByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const result = await this.service.getServicesByCategory(categoryId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getServicesByCategory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/requiring-quote
  getServicesRequiringQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getServicesRequiringQuote();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getServicesRequiringQuote controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/search
  searchServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: searchTerm, limit } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Parâmetro de busca é obrigatório'
        });
        return;
      }

      const result = await this.service.searchServices(
        searchTerm, 
        limit ? parseInt(limit as string) : 10
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in searchServices controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/:id
  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getServiceById(id);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Serviço não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getServiceById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // POST /api/services
  createService = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.createService(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in createService controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PUT /api/services/:id
  updateService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateService(id, req.body);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Serviço não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in updateService controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // DELETE /api/services/:id
  deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteService(id);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Serviço excluído com sucesso'
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in deleteService controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PATCH /api/services/:id/soft-delete
  softDeleteService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.softDeleteService(id);
      
      if (result.success) {
        if (result.data) {
          res.json({
            success: true,
            message: 'Serviço desativado com sucesso',
            data: result.data
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Serviço não encontrado'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in softDeleteService controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/services/stats
  getServiceStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getServiceStats();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getServiceStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}
