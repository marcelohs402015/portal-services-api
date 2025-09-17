"use strict";
/**
 * API Types
 * Tipos para sistema de API Keys simples
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyConfigs = exports.ApiKeyType = exports.ApiPermission = void 0;
/**
 * Permissões da API
 */
var ApiPermission;
(function (ApiPermission) {
    // Read permissions
    ApiPermission["READ_CATEGORIES"] = "read:categories";
    ApiPermission["READ_CLIENTS"] = "read:clients";
    ApiPermission["READ_SERVICES"] = "read:services";
    ApiPermission["READ_QUOTATIONS"] = "read:quotations";
    ApiPermission["READ_APPOINTMENTS"] = "read:appointments";
    ApiPermission["READ_EMAILS"] = "read:emails";
    ApiPermission["READ_STATS"] = "read:stats";
    // Write permissions
    ApiPermission["CREATE_CATEGORIES"] = "create:categories";
    ApiPermission["CREATE_CLIENTS"] = "create:clients";
    ApiPermission["CREATE_SERVICES"] = "create:services";
    ApiPermission["CREATE_QUOTATIONS"] = "create:quotations";
    ApiPermission["CREATE_APPOINTMENTS"] = "create:appointments";
    ApiPermission["CREATE_EMAILS"] = "create:emails";
    // Update permissions
    ApiPermission["UPDATE_CATEGORIES"] = "update:categories";
    ApiPermission["UPDATE_CLIENTS"] = "update:clients";
    ApiPermission["UPDATE_SERVICES"] = "update:services";
    ApiPermission["UPDATE_QUOTATIONS"] = "update:quotations";
    ApiPermission["UPDATE_APPOINTMENTS"] = "update:appointments";
    ApiPermission["UPDATE_EMAILS"] = "update:emails";
    // Delete permissions
    ApiPermission["DELETE_CATEGORIES"] = "delete:categories";
    ApiPermission["DELETE_CLIENTS"] = "delete:clients";
    ApiPermission["DELETE_SERVICES"] = "delete:services";
    ApiPermission["DELETE_QUOTATIONS"] = "delete:quotations";
    ApiPermission["DELETE_APPOINTMENTS"] = "delete:appointments";
    ApiPermission["DELETE_EMAILS"] = "delete:emails";
    // Admin permissions
    ApiPermission["ADMIN_ALL"] = "admin:all";
})(ApiPermission || (exports.ApiPermission = ApiPermission = {}));
/**
 * Tipos de API Keys pré-definidas
 */
var ApiKeyType;
(function (ApiKeyType) {
    ApiKeyType["N8N_READONLY"] = "n8n_readonly";
    ApiKeyType["N8N_FULL_ACCESS"] = "n8n_full_access";
    ApiKeyType["WEBHOOK"] = "webhook";
    ApiKeyType["INTEGRATION"] = "integration";
    ApiKeyType["ADMIN"] = "admin";
})(ApiKeyType || (exports.ApiKeyType = ApiKeyType = {}));
/**
 * Configurações de API Keys por tipo
 */
exports.ApiKeyConfigs = {
    [ApiKeyType.N8N_READONLY]: {
        name: 'N8N Read Only',
        permissions: [
            ApiPermission.READ_CATEGORIES,
            ApiPermission.READ_CLIENTS,
            ApiPermission.READ_SERVICES,
            ApiPermission.READ_QUOTATIONS,
            ApiPermission.READ_APPOINTMENTS,
            ApiPermission.READ_EMAILS,
            ApiPermission.READ_STATS
        ],
        description: 'Acesso somente leitura para automações N8N'
    },
    [ApiKeyType.N8N_FULL_ACCESS]: {
        name: 'N8N Full Access',
        permissions: Object.values(ApiPermission),
        description: 'Acesso completo para automações N8N'
    },
    [ApiKeyType.WEBHOOK]: {
        name: 'Webhook',
        permissions: [
            ApiPermission.CREATE_EMAILS,
            ApiPermission.UPDATE_APPOINTMENTS,
            ApiPermission.READ_CLIENTS
        ],
        description: 'Para webhooks externos'
    },
    [ApiKeyType.INTEGRATION]: {
        name: 'Integration',
        permissions: [
            ApiPermission.READ_CATEGORIES,
            ApiPermission.READ_CLIENTS,
            ApiPermission.CREATE_SERVICES,
            ApiPermission.CREATE_QUOTATIONS
        ],
        description: 'Para integrações de terceiros'
    },
    [ApiKeyType.ADMIN]: {
        name: 'Admin',
        permissions: Object.values(ApiPermission),
        description: 'Acesso administrativo completo'
    }
};
