// =====================================================
// Portal Services - Service Service
// =====================================================

import { ServiceRepository } from '../repositories/ServiceRepository.js';
import { Database } from '../database/Database.js';
import { 
  Service, 
  CreateServiceDTO, 
  UpdateServiceDTO, 
  QueryParams, 
  ApiResponse 
} from '../types/entities.js';
import { CreateServiceSchema, UpdateServiceSchema } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';
import { ZodError } from 'zod';

export class ServiceService {
  private repository: ServiceRepository;
  private logger: Logger;

  constructor(db: Database) {
    this.repository = new ServiceRepository(db);
    this.logger = createLogger('ServiceService');
  }

  async getAllServices(params: QueryParams = {}): Promise<ApiResponse<Service[]>> {
    try {
      this.logger.info('Getting all services', { params });
      return await this.repository.findAll(params);
    } catch (error) {
      this.logger.error('Error getting all services:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getServiceById(id: string): Promise<ApiResponse<Service | null>> {
    try {
      this.logger.info('Getting service by id', { id });
      
      if (!id) {
        return {
          success: false,
          error: 'Service ID is required'
        };
      }

      return await this.repository.findById(id);
    } catch (error) {
      this.logger.error('Error getting service by id:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getActiveServices(): Promise<ApiResponse<Service[]>> {
    try {
      this.logger.info('Getting active services');
      return await this.repository.findActive();
    } catch (error) {
      this.logger.error('Error getting active services:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getServicesByCategory(categoryId: string): Promise<ApiResponse<Service[]>> {
    try {
      this.logger.info('Getting services by category', { categoryId });
      
      if (!categoryId) {
        return {
          success: false,
          error: 'Category ID is required'
        };
      }

      return await this.repository.findByCategory(categoryId);
    } catch (error) {
      this.logger.error('Error getting services by category:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getServicesRequiringQuote(): Promise<ApiResponse<Service[]>> {
    try {
      this.logger.info('Getting services requiring quote');
      return await this.repository.findRequiringQuote();
    } catch (error) {
      this.logger.error('Error getting services requiring quote:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async searchServices(searchTerm: string, limit: number = 10): Promise<ApiResponse<Service[]>> {
    try {
      this.logger.info('Searching services', { searchTerm, limit });
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        return {
          success: false,
          error: 'Search term must be at least 2 characters'
        };
      }

      return await this.repository.searchServices(searchTerm.trim(), limit);
    } catch (error) {
      this.logger.error('Error searching services:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async createService(dto: CreateServiceDTO): Promise<ApiResponse<Service>> {
    try {
      this.logger.info('Creating service', { name: dto.name });

      // Validar dados de entrada
      const validatedData = CreateServiceSchema.parse(dto);

      // Verificar se já existe um serviço com o mesmo nome
      const existingService = await this.repository.findByName(validatedData.name);
      
      if (existingService.success && existingService.data) {
        return {
          success: false,
          error: 'Já existe um serviço com este nome'
        };
      }

      return await this.repository.create(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        this.logger.error('Validation error creating service:', errorMessage);
        return {
          success: false,
          error: `Dados inválidos: ${errorMessage}`
        };
      }

      this.logger.error('Error creating service:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async updateService(id: string, dto: UpdateServiceDTO): Promise<ApiResponse<Service | null>> {
    try {
      this.logger.info('Updating service', { id });

      if (!id) {
        return {
          success: false,
          error: 'Service ID is required'
        };
      }

      // Validar dados de entrada
      const validatedData = UpdateServiceSchema.parse(dto);

      // Se está alterando o nome, verificar se já existe
      if (validatedData.name) {
        const existingService = await this.repository.findByName(validatedData.name);
        
        if (existingService.success && existingService.data && existingService.data.id !== id) {
          return {
            success: false,
            error: 'Já existe um serviço com este nome'
          };
        }
      }

      return await this.repository.update(id, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        this.logger.error('Validation error updating service:', errorMessage);
        return {
          success: false,
          error: `Dados inválidos: ${errorMessage}`
        };
      }

      this.logger.error('Error updating service:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async deleteService(id: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.info('Deleting service', { id });

      if (!id) {
        return {
          success: false,
          error: 'Service ID is required'
        };
      }

      // Verificar se o serviço tem agendamentos associados
      const hasAppointments = await this.checkServiceHasAppointments(id);
      if (hasAppointments) {
        return {
          success: false,
          error: 'Não é possível excluir um serviço que possui agendamentos associados'
        };
      }

      return await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting service:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async softDeleteService(id: string): Promise<ApiResponse<Service | null>> {
    try {
      this.logger.info('Soft deleting service', { id });

      if (!id) {
        return {
          success: false,
          error: 'Service ID is required'
        };
      }

      return await this.repository.softDelete(id);
    } catch (error) {
      this.logger.error('Error soft deleting service:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getServiceStats(): Promise<ApiResponse<{ total: number; active: number; inactive: number; by_category: any[] }>> {
    try {
      this.logger.info('Getting service stats');
      return await this.repository.getServiceStats();
    } catch (error) {
      this.logger.error('Error getting service stats:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async checkServiceHasAppointments(serviceId: string): Promise<boolean> {
    try {
      // Verificar se o serviço tem agendamentos
      // Por enquanto, retornamos false para permitir exclusão
      // Em uma implementação completa, você faria queries específicas aqui
      return false;
    } catch (error) {
      this.logger.error('Error checking if service has appointments:', error);
      return false;
    }
  }
}
