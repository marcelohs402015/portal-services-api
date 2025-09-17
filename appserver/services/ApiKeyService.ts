/**
 * API Key Service
 * Serviço para gerenciamento de API Keys simples
 */

import crypto from 'crypto';
import { ApiKey, ApiKeyType, ApiKeyConfigs, ApiPermission } from '../types/api.types';
import { createLogger } from '../shared/logger';

export class ApiKeyService {
  private apiKeys: Map<string, ApiKey> = new Map();
  private logger = createLogger('api-key-service');

  constructor() {
    this.initializeDefaultKeys();
  }

  /**
   * Inicializa API Keys padrão
   */
  private initializeDefaultKeys(): void {
    // API Key fixa para testes
    const testApiKey: ApiKey = {
      id: 'test-key-001',
      name: 'Test API Key - Bruno',
      key: 'psk_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      permissions: Object.values(ApiPermission),
      isActive: true,
      createdAt: new Date(),
      description: 'API Key fixa para testes no Bruno'
    };
    this.apiKeys.set(testApiKey.key, testApiKey);

    // N8N Read Only Key
    const n8nReadOnlyKey = this.createApiKey(
      ApiKeyType.N8N_READONLY,
      'N8N Read Only - Automações',
      'Chave para automações N8N com acesso somente leitura'
    );

    // N8N Full Access Key
    const n8nFullKey = this.createApiKey(
      ApiKeyType.N8N_FULL_ACCESS,
      'N8N Full Access - Automações',
      'Chave para automações N8N com acesso completo'
    );

    // Admin Key
    const adminKey = this.createApiKey(
      ApiKeyType.ADMIN,
      'Admin - Acesso Total',
      'Chave administrativa com acesso total'
    );

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
  private createApiKey(
    type: ApiKeyType,
    name: string,
    description: string
  ): ApiKey {
    const config = ApiKeyConfigs[type];
    const key = this.generateApiKey();
    
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
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
  private generateApiKey(): string {
    // Formato: psk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const randomBytes = crypto.randomBytes(32);
    return 'psk_' + randomBytes.toString('hex');
  }

  /**
   * Valida uma API Key
   */
  validateApiKey(key: string): { valid: boolean; apiKey?: ApiKey; error?: string } {
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
  hasPermission(apiKey: ApiKey, permission: ApiPermission): boolean {
    return apiKey.permissions.includes(permission) || 
           apiKey.permissions.includes(ApiPermission.ADMIN_ALL);
  }

  /**
   * Lista todas as API Keys (para admin)
   */
  listApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values()).map(key => ({
      ...key,
      key: key.key.substring(0, 8) + '...' // Mascara a chave
    }));
  }

  /**
   * Cria uma nova API Key personalizada
   */
  createCustomApiKey(
    name: string,
    permissions: ApiPermission[],
    description?: string
  ): ApiKey {
    const key = this.generateApiKey();
    
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
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
  deactivateApiKey(key: string): boolean {
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
  activateApiKey(key: string): boolean {
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
  getStats(): {
    total: number;
    active: number;
    inactive: number;
    lastUsed: Date | null;
  } {
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

// Instância singleton
export const apiKeyService = new ApiKeyService();
