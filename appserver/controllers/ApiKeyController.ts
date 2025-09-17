/**
 * API Key Controller
 * Controller para gerenciamento de API Keys
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest, ApiPermission, ApiKeyType } from '../types/api.types';
import { apiKeyService } from '../services/ApiKeyService';
import { createLogger } from '../shared/logger';

const logger = createLogger('api-key-controller');

export class ApiKeyController {
  /**
   * Lista todas as API Keys (admin only)
   */
  listApiKeys = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const apiKeys = apiKeyService.listApiKeys();
      
      res.json({
        success: true,
        data: apiKeys,
        count: apiKeys.length
      });
    } catch (error) {
      logger.error('Erro ao listar API Keys', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Cria uma nova API Key personalizada (admin only)
   */
  createApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, permissions, description } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: 'Nome e permissões são obrigatórios'
        });
        return;
      }

      // Valida se as permissões são válidas
      const validPermissions = Object.values(ApiPermission);
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      
      if (invalidPermissions.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Permissões inválidas',
          invalidPermissions
        });
        return;
      }

      const apiKey = apiKeyService.createCustomApiKey(name, permissions, description);

      logger.info('Nova API Key criada', {
        name: apiKey.name,
        permissions: apiKey.permissions.length,
        createdBy: req.ip
      });

      res.status(201).json({
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key, // Retorna a chave completa apenas na criação
          permissions: apiKey.permissions,
          description: apiKey.description,
          createdAt: apiKey.createdAt
        },
        message: 'API Key criada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar API Key', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Desativa uma API Key (admin only)
   */
  deactivateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      const success = apiKeyService.deactivateApiKey(key);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'API Key não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'API Key desativada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao desativar API Key', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Ativa uma API Key (admin only)
   */
  activateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      const success = apiKeyService.activateApiKey(key);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'API Key não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'API Key ativada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao ativar API Key', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Obtém estatísticas das API Keys (admin only)
   */
  getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = apiKeyService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Obtém informações da API Key atual
   */
  getCurrentApiKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.apiKey) {
        res.status(401).json({
          success: false,
          error: 'API Key não autenticada'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: req.apiKey.id,
          name: req.apiKey.name,
          permissions: req.apiKey.permissions,
          description: req.apiKey.description,
          isActive: req.apiKey.isActive,
          createdAt: req.apiKey.createdAt,
          lastUsedAt: req.apiKey.lastUsedAt
        }
      });
    } catch (error) {
      logger.error('Erro ao obter informações da API Key', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Lista as permissões disponíveis
   */
  listPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = Object.values(ApiPermission);
      const keyTypes = Object.values(ApiKeyType);

      res.json({
        success: true,
        data: {
          permissions,
          keyTypes,
          totalPermissions: permissions.length,
          totalKeyTypes: keyTypes.length
        }
      });
    } catch (error) {
      logger.error('Erro ao listar permissões', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}

export const apiKeyController = new ApiKeyController();
