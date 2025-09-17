"use strict";
/**
 * API Key Controller
 * Controller para gerenciamento de API Keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyController = exports.ApiKeyController = void 0;
const api_types_1 = require("../types/api.types");
const ApiKeyService_1 = require("../services/ApiKeyService");
const logger_1 = require("../shared/logger");
const logger = (0, logger_1.createLogger)('api-key-controller');
class ApiKeyController {
    constructor() {
        /**
         * Lista todas as API Keys (admin only)
         */
        this.listApiKeys = async (req, res) => {
            try {
                const apiKeys = ApiKeyService_1.apiKeyService.listApiKeys();
                res.json({
                    success: true,
                    data: apiKeys,
                    count: apiKeys.length
                });
            }
            catch (error) {
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
        this.createApiKey = async (req, res) => {
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
                const validPermissions = Object.values(api_types_1.ApiPermission);
                const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
                if (invalidPermissions.length > 0) {
                    res.status(400).json({
                        success: false,
                        error: 'Permissões inválidas',
                        invalidPermissions
                    });
                    return;
                }
                const apiKey = ApiKeyService_1.apiKeyService.createCustomApiKey(name, permissions, description);
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
            }
            catch (error) {
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
        this.deactivateApiKey = async (req, res) => {
            try {
                const { key } = req.params;
                const success = ApiKeyService_1.apiKeyService.deactivateApiKey(key);
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
            }
            catch (error) {
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
        this.activateApiKey = async (req, res) => {
            try {
                const { key } = req.params;
                const success = ApiKeyService_1.apiKeyService.activateApiKey(key);
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
            }
            catch (error) {
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
        this.getStats = async (req, res) => {
            try {
                const stats = ApiKeyService_1.apiKeyService.getStats();
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
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
        this.getCurrentApiKey = async (req, res) => {
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
            }
            catch (error) {
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
        this.listPermissions = async (req, res) => {
            try {
                const permissions = Object.values(api_types_1.ApiPermission);
                const keyTypes = Object.values(api_types_1.ApiKeyType);
                res.json({
                    success: true,
                    data: {
                        permissions,
                        keyTypes,
                        totalPermissions: permissions.length,
                        totalKeyTypes: keyTypes.length
                    }
                });
            }
            catch (error) {
                logger.error('Erro ao listar permissões', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
    }
}
exports.ApiKeyController = ApiKeyController;
exports.apiKeyController = new ApiKeyController();
