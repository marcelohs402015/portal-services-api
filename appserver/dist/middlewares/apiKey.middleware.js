"use strict";
/**
 * API Key Middleware
 * Middleware para autenticação via API Keys simples
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalApiKey = exports.requirePermission = exports.authenticateApiKey = void 0;
const api_types_1 = require("../types/api.types");
const ApiKeyService_1 = require("../services/ApiKeyService");
const logger_1 = require("../shared/logger");
const logger = (0, logger_1.createLogger)('api-key-middleware');
/**
 * Middleware de autenticação via API Key
 */
const authenticateApiKey = async (req, res, next) => {
    try {
        // Extrai a API Key do header Authorization
        const authHeader = req.headers.authorization;
        const apiKey = extractApiKeyFromHeader(authHeader);
        if (!apiKey) {
            res.status(401).json({
                success: false,
                error: 'API Key não fornecida',
                code: 'NO_API_KEY',
                message: 'Forneça uma API Key no header Authorization: Bearer psk_xxxxx'
            });
            return;
        }
        // Valida a API Key
        const validation = ApiKeyService_1.apiKeyService.validateApiKey(apiKey);
        if (!validation.valid) {
            logger.warn('Tentativa de acesso com API Key inválida', {
                apiKey: apiKey.substring(0, 8) + '...',
                error: validation.error,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            res.status(401).json({
                success: false,
                error: validation.error || 'API Key inválida',
                code: 'INVALID_API_KEY'
            });
            return;
        }
        // Adiciona a API Key ao request
        req.apiKey = validation.apiKey;
        logger.info('Acesso autorizado via API Key', {
            apiKeyName: validation.apiKey?.name,
            permissions: validation.apiKey?.permissions.length,
            ip: req.ip,
            endpoint: req.path,
            method: req.method
        });
        next();
    }
    catch (error) {
        logger.error('Erro na autenticação da API Key', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};
exports.authenticateApiKey = authenticateApiKey;
/**
 * Middleware de autorização por permissão
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.apiKey) {
            res.status(401).json({
                success: false,
                error: 'API Key não autenticada',
                code: 'NOT_AUTHENTICATED'
            });
            return;
        }
        if (!ApiKeyService_1.apiKeyService.hasPermission(req.apiKey, permission)) {
            logger.warn('Tentativa de acesso sem permissão', {
                apiKeyName: req.apiKey.name,
                requiredPermission: permission,
                availablePermissions: req.apiKey.permissions,
                ip: req.ip,
                endpoint: req.path
            });
            res.status(403).json({
                success: false,
                error: 'Permissão insuficiente',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: permission,
                available: req.apiKey.permissions
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware de autenticação opcional
 */
const optionalApiKey = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const apiKey = extractApiKeyFromHeader(authHeader);
        if (apiKey) {
            const validation = ApiKeyService_1.apiKeyService.validateApiKey(apiKey);
            if (validation.valid) {
                req.apiKey = validation.apiKey;
            }
        }
        next();
    }
    catch (error) {
        // Em caso de erro, continua sem autenticação
        next();
    }
};
exports.optionalApiKey = optionalApiKey;
/**
 * Extrai API Key do header Authorization
 */
function extractApiKeyFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    // Formato: Bearer psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    const key = parts[1];
    // Verifica se é uma API Key válida (começa com psk_)
    if (!key.startsWith('psk_') || key.length < 67) { // psk_ + pelo menos 64 chars hex
        return null;
    }
    return key;
}
/**
 * Middleware para endpoints administrativos
 */
const requireAdmin = (req, res, next) => {
    if (!req.apiKey) {
        res.status(401).json({
            success: false,
            error: 'API Key não autenticada',
            code: 'NOT_AUTHENTICATED'
        });
        return;
    }
    if (!ApiKeyService_1.apiKeyService.hasPermission(req.apiKey, api_types_1.ApiPermission.ADMIN_ALL)) {
        res.status(403).json({
            success: false,
            error: 'Acesso administrativo necessário',
            code: 'ADMIN_REQUIRED'
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
