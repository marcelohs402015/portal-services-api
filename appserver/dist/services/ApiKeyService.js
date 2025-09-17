"use strict";
/**
 * API Key Service
 * Serviço para gerenciamento de API Keys simples
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyService = exports.ApiKeyService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const api_types_1 = require("../types/api.types");
const logger_1 = require("../shared/logger");
class ApiKeyService {
    constructor() {
        this.apiKeys = new Map();
        this.logger = (0, logger_1.createLogger)('api-key-service');
        this.initializeDefaultKeys();
    }
    /**
     * Inicializa API Keys padrão
     */
    initializeDefaultKeys() {
        // API Key fixa para testes
        const testApiKey = {
            id: 'test-key-001',
            name: 'Test API Key - Bruno',
            key: 'psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            permissions: Object.values(api_types_1.ApiPermission),
            isActive: true,
            createdAt: new Date(),
            description: 'API Key fixa para testes no Bruno'
        };
        this.apiKeys.set(testApiKey.key, testApiKey);
        // N8N Read Only Key
        const n8nReadOnlyKey = this.createApiKey(api_types_1.ApiKeyType.N8N_READONLY, 'N8N Read Only - Automações', 'Chave para automações N8N com acesso somente leitura');
        // N8N Full Access Key
        const n8nFullKey = this.createApiKey(api_types_1.ApiKeyType.N8N_FULL_ACCESS, 'N8N Full Access - Automações', 'Chave para automações N8N com acesso completo');
        // Admin Key
        const adminKey = this.createApiKey(api_types_1.ApiKeyType.ADMIN, 'Admin - Acesso Total', 'Chave administrativa com acesso total');
        this.logger.info('API Keys padrão inicializadas', {
            keys: [
                { name: testApiKey.name, key: testApiKey.key.substring(0, 8) + '...' },
                { name: n8nReadOnlyKey.name, key: n8nReadOnlyKey.key.substring(0, 8) + '...' },
                { name: n8nFullKey.name, key: n8nFullKey.key.substring(0, 8) + '...' },
                { name: adminKey.name, key: adminKey.key.substring(0, 8) + '...' }
            ]
        });
    }
    /**
     * Cria uma nova API Key
     */
    createApiKey(type, name, description) {
        const config = api_types_1.ApiKeyConfigs[type];
        const key = this.generateApiKey();
        const apiKey = {
            id: crypto_1.default.randomUUID(),
            name,
            key,
            permissions: config.permissions,
            isActive: true,
            createdAt: new Date(),
            description
        };
        this.apiKeys.set(key, apiKey);
        return apiKey;
    }
    /**
     * Gera uma API Key segura
     */
    generateApiKey() {
        // Formato: psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        const randomBytes = crypto_1.default.randomBytes(32);
        return 'psk_' + randomBytes.toString('hex');
    }
    /**
     * Valida uma API Key
     */
    validateApiKey(key) {
        if (!key) {
            return { valid: false, error: 'API Key não fornecida' };
        }
        const apiKey = this.apiKeys.get(key);
        if (!apiKey) {
            return { valid: false, error: 'API Key inválida' };
        }
        if (!apiKey.isActive) {
            return { valid: false, error: 'API Key desativada' };
        }
        // Atualiza último uso
        apiKey.lastUsedAt = new Date();
        return { valid: true, apiKey };
    }
    /**
     * Verifica se a API Key tem uma permissão específica
     */
    hasPermission(apiKey, permission) {
        return apiKey.permissions.includes(permission) ||
            apiKey.permissions.includes(api_types_1.ApiPermission.ADMIN_ALL);
    }
    /**
     * Lista todas as API Keys (para admin)
     */
    listApiKeys() {
        return Array.from(this.apiKeys.values()).map(key => ({
            ...key,
            key: key.key.substring(0, 8) + '...' // Mascara a chave
        }));
    }
    /**
     * Cria uma nova API Key personalizada
     */
    createCustomApiKey(name, permissions, description) {
        const key = this.generateApiKey();
        const apiKey = {
            id: crypto_1.default.randomUUID(),
            name,
            key,
            permissions,
            isActive: true,
            createdAt: new Date(),
            description
        };
        this.apiKeys.set(key, apiKey);
        this.logger.info('Nova API Key criada', {
            name: apiKey.name,
            permissions: apiKey.permissions.length,
            key: key.substring(0, 8) + '...'
        });
        return apiKey;
    }
    /**
     * Desativa uma API Key
     */
    deactivateApiKey(key) {
        const apiKey = this.apiKeys.get(key);
        if (apiKey) {
            apiKey.isActive = false;
            this.logger.info('API Key desativada', { name: apiKey.name });
            return true;
        }
        return false;
    }
    /**
     * Ativa uma API Key
     */
    activateApiKey(key) {
        const apiKey = this.apiKeys.get(key);
        if (apiKey) {
            apiKey.isActive = true;
            this.logger.info('API Key ativada', { name: apiKey.name });
            return true;
        }
        return false;
    }
    /**
     * Obtém estatísticas das API Keys
     */
    getStats() {
        const keys = Array.from(this.apiKeys.values());
        const active = keys.filter(k => k.isActive).length;
        const lastUsed = keys
            .filter(k => k.lastUsedAt)
            .sort((a, b) => (b.lastUsedAt?.getTime() || 0) - (a.lastUsedAt?.getTime() || 0))[0]?.lastUsedAt || null;
        return {
            total: keys.length,
            active,
            inactive: keys.length - active,
            lastUsed
        };
    }
}
exports.ApiKeyService = ApiKeyService;
// Instância singleton
exports.apiKeyService = new ApiKeyService();
