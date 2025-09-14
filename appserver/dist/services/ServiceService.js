// =====================================================
// Portal Services - Service Service
// =====================================================
import { ServiceRepository } from '../repositories/ServiceRepository.js';
import { CreateServiceSchema, UpdateServiceSchema } from '../types/entities.js';
import { createLogger } from '../shared/logger.js';
import { ZodError } from 'zod';
export class ServiceService {
    constructor(db) {
        this.repository = new ServiceRepository(db);
        this.logger = createLogger('ServiceService');
    }
    async getAllServices(params = {}) {
        try {
            this.logger.info('Getting all services', { params });
            return await this.repository.findAll(params);
        }
        catch (error) {
            this.logger.error('Error getting all services:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getServiceById(id) {
        try {
            this.logger.info('Getting service by id', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Service ID is required'
                };
            }
            return await this.repository.findById(id);
        }
        catch (error) {
            this.logger.error('Error getting service by id:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getActiveServices() {
        try {
            this.logger.info('Getting active services');
            return await this.repository.findActive();
        }
        catch (error) {
            this.logger.error('Error getting active services:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getServicesByCategory(categoryId) {
        try {
            this.logger.info('Getting services by category', { categoryId });
            if (!categoryId) {
                return {
                    success: false,
                    error: 'Category ID is required'
                };
            }
            return await this.repository.findByCategory(categoryId);
        }
        catch (error) {
            this.logger.error('Error getting services by category:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getServicesRequiringQuote() {
        try {
            this.logger.info('Getting services requiring quote');
            return await this.repository.findRequiringQuote();
        }
        catch (error) {
            this.logger.error('Error getting services requiring quote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async searchServices(searchTerm, limit = 10) {
        try {
            this.logger.info('Searching services', { searchTerm, limit });
            if (!searchTerm || searchTerm.trim().length < 2) {
                return {
                    success: false,
                    error: 'Search term must be at least 2 characters'
                };
            }
            return await this.repository.searchServices(searchTerm.trim(), limit);
        }
        catch (error) {
            this.logger.error('Error searching services:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async createService(dto) {
        try {
            this.logger.info('Creating service', { name: dto.name });
            // Validar dados de entrada
            const validatedData = CreateServiceSchema.parse(dto);
            // Verificar se já existe um serviço com o mesmo nome
            const existingService = await this.repository.executeQuery('SELECT id FROM services WHERE name ILIKE $1 AND active = true LIMIT 1', [validatedData.name]);
            if (existingService.length > 0) {
                return {
                    success: false,
                    error: 'Já existe um serviço com este nome'
                };
            }
            return await this.repository.create(validatedData);
        }
        catch (error) {
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
                error: error.message
            };
        }
    }
    async updateService(id, dto) {
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
                const existingService = await this.repository.executeQuery('SELECT id FROM services WHERE name ILIKE $1 AND active = true AND id != $2 LIMIT 1', [validatedData.name, id]);
                if (existingService.length > 0) {
                    return {
                        success: false,
                        error: 'Já existe um serviço com este nome'
                    };
                }
            }
            return await this.repository.update(id, validatedData);
        }
        catch (error) {
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
                error: error.message
            };
        }
    }
    async deleteService(id) {
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
        }
        catch (error) {
            this.logger.error('Error deleting service:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async softDeleteService(id) {
        try {
            this.logger.info('Soft deleting service', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'Service ID is required'
                };
            }
            return await this.repository.softDelete(id);
        }
        catch (error) {
            this.logger.error('Error soft deleting service:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getServiceStats() {
        try {
            this.logger.info('Getting service stats');
            return await this.repository.getServiceStats();
        }
        catch (error) {
            this.logger.error('Error getting service stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async checkServiceHasAppointments(serviceId) {
        try {
            const query = 'SELECT 1 FROM appointments WHERE service_id = $1 AND status IN ($2, $3, $4) LIMIT 1';
            const result = await this.repository.executeQuery(query, [serviceId, 'scheduled', 'confirmed', 'in_progress']);
            return result.length > 0;
        }
        catch (error) {
            this.logger.error('Error checking if service has appointments:', error);
            return false;
        }
    }
}
//# sourceMappingURL=ServiceService.js.map