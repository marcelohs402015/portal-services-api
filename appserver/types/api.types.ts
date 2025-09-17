/**
 * API Types
 * Tipos para sistema de API Keys simples
 */

import { Request } from 'express';

/**
 * API Key
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  description?: string;
}

/**
 * Request com API Key
 */
export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKey;
}

/**
 * Permissões da API
 */
export enum ApiPermission {
  // Read permissions
  READ_CATEGORIES = 'read:categories',
  READ_CLIENTS = 'read:clients',
  READ_SERVICES = 'read:services',
  READ_QUOTATIONS = 'read:quotations',
  READ_APPOINTMENTS = 'read:appointments',
  READ_EMAILS = 'read:emails',
  READ_STATS = 'read:stats',
  
  // Write permissions
  CREATE_CATEGORIES = 'create:categories',
  CREATE_CLIENTS = 'create:clients',
  CREATE_SERVICES = 'create:services',
  CREATE_QUOTATIONS = 'create:quotations',
  CREATE_APPOINTMENTS = 'create:appointments',
  CREATE_EMAILS = 'create:emails',
  
  // Update permissions
  UPDATE_CATEGORIES = 'update:categories',
  UPDATE_CLIENTS = 'update:clients',
  UPDATE_SERVICES = 'update:services',
  UPDATE_QUOTATIONS = 'update:quotations',
  UPDATE_APPOINTMENTS = 'update:appointments',
  UPDATE_EMAILS = 'update:emails',
  
  // Delete permissions
  DELETE_CATEGORIES = 'delete:categories',
  DELETE_CLIENTS = 'delete:clients',
  DELETE_SERVICES = 'delete:services',
  DELETE_QUOTATIONS = 'delete:quotations',
  DELETE_APPOINTMENTS = 'delete:appointments',
  DELETE_EMAILS = 'delete:emails',
  
  // Admin permissions
  ADMIN_ALL = 'admin:all'
}

/**
 * Tipos de API Keys pré-definidas
 */
export enum ApiKeyType {
  N8N_READONLY = 'n8n_readonly',
  N8N_FULL_ACCESS = 'n8n_full_access',
  WEBHOOK = 'webhook',
  INTEGRATION = 'integration',
  ADMIN = 'admin'
}

/**
 * Configurações de API Keys por tipo
 */
export const ApiKeyConfigs: Record<ApiKeyType, {
  name: string;
  permissions: ApiPermission[];
  description: string;
}> = {
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
