// =====================================================
// Portal Services - Client Service
// =====================================================

import { ClientRepository } from '../repositories/ClientRepository.js';
import { Database } from '../database/Database.js';
import { 
  Client, 
  CreateClientDTO, 
  UpdateClientDTO, 
  QueryParams, 
  ApiResponse 
} from '../types/entities.js';
import { CreateClientSchema, UpdateClientSchema } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';
import { ZodError } from 'zod';

export class ClientService {
  private repository: ClientRepository;
  private logger: Logger;

  constructor(db: Database) {
    this.repository = new ClientRepository(db);
    this.logger = createLogger('ClientService');
  }

  async getAllClients(params: QueryParams = {}): Promise<ApiResponse<Client[]>> {
    try {
      this.logger.info('Getting all clients', { params });
      return await this.repository.findAll(params);
    } catch (error) {
      this.logger.error('Error getting all clients:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientById(id: string): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Getting client by id', { id });
      
      if (!id) {
        return {
          success: false,
          error: 'Client ID is required'
        };
      }

      return await this.repository.findById(id);
    } catch (error) {
      this.logger.error('Error getting client by id:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getActiveClients(): Promise<ApiResponse<Client[]>> {
    try {
      this.logger.info('Getting active clients');
      return await this.repository.findActive();
    } catch (error) {
      this.logger.error('Error getting active clients:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientByEmail(email: string): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Getting client by email', { email });
      
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        };
      }

      return await this.repository.findByEmail(email);
    } catch (error) {
      this.logger.error('Error getting client by email:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientByPhone(phone: string): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Getting client by phone', { phone });
      
      if (!phone) {
        return {
          success: false,
          error: 'Phone is required'
        };
      }

      return await this.repository.findByPhone(phone);
    } catch (error) {
      this.logger.error('Error getting client by phone:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientByDocument(document: string): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Getting client by document', { document });
      
      if (!document) {
        return {
          success: false,
          error: 'Document is required'
        };
      }

      return await this.repository.findByDocument(document);
    } catch (error) {
      this.logger.error('Error getting client by document:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async searchClients(searchTerm: string, limit: number = 10): Promise<ApiResponse<Client[]>> {
    try {
      this.logger.info('Searching clients', { searchTerm, limit });
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        return {
          success: false,
          error: 'Search term must be at least 2 characters'
        };
      }

      return await this.repository.searchClients(searchTerm.trim(), limit);
    } catch (error) {
      this.logger.error('Error searching clients:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async createClient(dto: CreateClientDTO): Promise<ApiResponse<Client>> {
    try {
      this.logger.info('Creating client', { name: dto.name, email: dto.email });

      // Validar dados de entrada
      const validatedData = CreateClientSchema.parse(dto);

      // Verificar se já existe um cliente com o mesmo email
      if (validatedData.email) {
        const existingClient = await this.repository.findByEmail(validatedData.email);
        if (existingClient.success && existingClient.data) {
          return {
            success: false,
            error: 'Já existe um cliente com este email'
          };
        }
      }

      // Verificar se já existe um cliente com o mesmo documento
      if (validatedData.document) {
        const existingClient = await this.repository.findByDocument(validatedData.document);
        if (existingClient.success && existingClient.data) {
          return {
            success: false,
            error: 'Já existe um cliente com este documento'
          };
        }
      }

      return await this.repository.create(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        this.logger.error('Validation error creating client:', errorMessage);
        return {
          success: false,
          error: `Dados inválidos: ${errorMessage}`
        };
      }

      this.logger.error('Error creating client:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async updateClient(id: string, dto: UpdateClientDTO): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Updating client', { id });

      if (!id) {
        return {
          success: false,
          error: 'Client ID is required'
        };
      }

      // Validar dados de entrada
      const validatedData = UpdateClientSchema.parse(dto);

      // Se está alterando o email, verificar se já existe
      if (validatedData.email) {
        const existingClient = await this.repository.findByEmail(validatedData.email);
        if (existingClient.success && existingClient.data && existingClient.data.id !== id) {
          return {
            success: false,
            error: 'Já existe um cliente com este email'
          };
        }
      }

      // Se está alterando o documento, verificar se já existe
      if (validatedData.document) {
        const existingClient = await this.repository.findByDocument(validatedData.document);
        if (existingClient.success && existingClient.data && existingClient.data.id !== id) {
          return {
            success: false,
            error: 'Já existe um cliente com este documento'
          };
        }
      }

      return await this.repository.update(id, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        this.logger.error('Validation error updating client:', errorMessage);
        return {
          success: false,
          error: `Dados inválidos: ${errorMessage}`
        };
      }

      this.logger.error('Error updating client:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async deleteClient(id: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.info('Deleting client', { id });

      if (!id) {
        return {
          success: false,
          error: 'Client ID is required'
        };
      }

      // Verificar se o cliente tem agendamentos ou orçamentos associados
      const hasRelatedData = await this.checkClientHasRelatedData(id);
      if (hasRelatedData) {
        return {
          success: false,
          error: 'Não é possível excluir um cliente que possui agendamentos ou orçamentos associados'
        };
      }

      return await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting client:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async softDeleteClient(id: string): Promise<ApiResponse<Client | null>> {
    try {
      this.logger.info('Soft deleting client', { id });

      if (!id) {
        return {
          success: false,
          error: 'Client ID is required'
        };
      }

      return await this.repository.softDelete(id);
    } catch (error) {
      this.logger.error('Error soft deleting client:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getClientStats(): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> {
    try {
      this.logger.info('Getting client stats');
      return await this.repository.getClientStats();
    } catch (error) {
      this.logger.error('Error getting client stats:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async checkClientHasRelatedData(clientId: string): Promise<boolean> {
    try {
      // Verificar se o cliente tem dados relacionados
      // Por enquanto, retornamos false para permitir exclusão
      // Em uma implementação completa, você faria queries específicas aqui
      return false;
    } catch (error) {
      this.logger.error('Error checking if client has related data:', error);
      return false;
    }
  }
}
