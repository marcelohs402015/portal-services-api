// =====================================================
// Portal Services - Category Controller
// =====================================================

import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { Database } from '../database/Database.js';
import { QueryParams } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class CategoryController {
  private service: CategoryService;
  private logger: Logger;

  constructor(db: Database) {
    this.service = new CategoryService(db);
    this.logger = createLogger('CategoryController');
  }

  // GET /api/categories
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
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

      const result = await this.service.getAllCategories(params);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getAllCategories controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/categories/active
  getActiveCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getActiveCategories();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getActiveCategories controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/categories/:id
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCategoryById(id);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getCategoryById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // POST /api/categories
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.createCategory(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in createCategory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PUT /api/categories/:id
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateCategory(id, req.body);
      
      if (result.success) {
        if (result.data) {
          res.json(result);
        } else {
          res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in updateCategory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // DELETE /api/categories/:id
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCategory(id);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Categoria excluída com sucesso'
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in deleteCategory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PATCH /api/categories/:id/soft-delete
  softDeleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.softDeleteCategory(id);
      
      if (result.success) {
        if (result.data) {
          res.json({
            success: true,
            message: 'Categoria desativada com sucesso',
            data: result.data
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Categoria não encontrada'
          });
        }
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in softDeleteCategory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // PUT /api/categories/reorder
  updateCategoryOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryIds } = req.body;
      const result = await this.service.updateCategoryOrder(categoryIds);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Ordem das categorias atualizada com sucesso'
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in updateCategoryOrder controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  // GET /api/categories/stats
  getCategoryStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getCategoryStats();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('Error in getCategoryStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}
