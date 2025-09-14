import { EmailData, EmailTemplate, CategoryStats, ApiResponse, PaginatedResponse, FilterOptions, PaginationOptions, Service, ServiceCategory, Quotation, Client, Appointment, Category } from '../types/api';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Real API service that connects to backend
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const emailAPI = {
  // Get emails with filters and pagination
  getEmails: async (filters?: FilterOptions, pagination?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<EmailData>>> => {
    try {
      const params = new URLSearchParams();
      
      // Add pagination
      if (pagination?.page) params.append('page', pagination.page.toString());
      if (pagination?.limit) params.append('limit', pagination.limit.toString());
      
      // Add filters
      if (filters?.category) params.append('category', filters.category);
      if (filters?.processed !== undefined) params.append('processed', filters.processed.toString());
      if (filters?.from) params.append('sender', filters.from);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.responded !== undefined) params.append('responded', filters.responded.toString());
      
      const queryString = params.toString();
      const url = `/api/emails${queryString ? '?' + queryString : ''}`;
      
      const response = await axiosInstance.get(url);
      
      // Map API response fields to frontend expected fields
      const mappedItems = (response.data.data || []).map((email: any) => ({
        ...email,
        gmailId: email.gmail_id,
        from: email.sender,
        responseTemplate: email.response_template
      }));
      
      return {
        success: response.data.success,
        data: {
          items: mappedItems,
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 50,
          totalPages: response.data.pagination?.totalPages || 0
        }
      };
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      return {
        success: false,
        error: 'Failed to fetch emails',
        data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 }
      };
    }
  },

  // Get email by ID
  getEmail: async (id: number): Promise<ApiResponse<EmailData>> => {
    try {
      const response = await axiosInstance.get(`/api/emails/${id}`);
      
      // Map API response fields to frontend expected fields
      const mappedEmail = response.data.data ? {
        ...response.data.data,
        gmailId: response.data.data.gmail_id,
        from: response.data.data.sender,
        responseTemplate: response.data.data.response_template
      } : null;
      
      return {
        success: response.data.success,
        data: mappedEmail,
        error: response.data.error
      };
    } catch (error) {
      console.error('Failed to fetch email:', error);
      return { success: false, error: 'Failed to fetch email' };
    }
  },

  // Get email by ID (alias for compatibility)
  getEmailById: async (id: number): Promise<ApiResponse<EmailData>> => {
    return emailAPI.getEmail(id);
  },

  // Sync emails from Gmail - Not available in real mode
  syncEmails: async (): Promise<ApiResponse<{ synced: number }>> => {
    return { success: false, error: 'Email sync not available in real mode' };
  },

  // Reply to email - Not available in real mode
  replyToEmail: async (id: number, templateId: string, customMessage?: string): Promise<ApiResponse<{ sent: boolean }>> => {
    return { success: false, error: 'Email reply not available in real mode' };
  },

  // Update email status
  updateEmailStatus: async (id: number, status: { processed?: boolean; responded?: boolean }): Promise<ApiResponse<EmailData>> => {
    try {
      const response = await axiosInstance.patch(`/emails/${id}/status`, status);
      return response.data;
    } catch (error) {
      console.error('Failed to update email status:', error);
      return { success: false, error: 'Failed to update email status' };
    }
  },

  // Get templates (alias for compatibility)
  getTemplates: async (): Promise<ApiResponse<EmailTemplate[]>> => {
    return templateAPI.getTemplates();
  },

  // Create template (alias for compatibility)
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmailTemplate>> => {
    return templateAPI.createTemplate(template);
  },

  // Update template (alias for compatibility)
  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<ApiResponse<EmailTemplate>> => {
    return templateAPI.updateTemplate(id, template);
  },

  // Delete template (alias for compatibility)
  deleteTemplate: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return templateAPI.deleteTemplate(id);
  },

  // Get category stats (alias for compatibility)
  getCategoryStats: async (): Promise<ApiResponse<CategoryStats[]>> => {
    return categoryAPI.getCategoryStats();
  },

  // Get quotations (alias for compatibility)
  getQuotations: async (): Promise<ApiResponse<Quotation[]>> => {
    return quotationAPI.getQuotations();
  },

  // Create quotation (alias for compatibility)
  createQuotation: async (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Quotation>> => {
    return quotationAPI.createQuotation(quotation);
  },

  // Update quotation (alias for compatibility)
  updateQuotation: async (id: string, quotation: Partial<Quotation>): Promise<ApiResponse<Quotation>> => {
    return quotationAPI.updateQuotation(id, quotation);
  },

  // Delete quotation (alias for compatibility)
  deleteQuotation: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return quotationAPI.deleteQuotation(id);
  },

  // Send quotation (alias for compatibility)
  sendQuotation: async (quotationId: string, email: string): Promise<ApiResponse<{ sent: boolean }>> => {
    try {
      const response = await axiosInstance.post(`/api/quotations/${quotationId}/send`, { email });
      return response.data;
    } catch (error) {
      console.error('Failed to send quotation:', error);
      return { success: false, error: 'Failed to send quotation' };
    }
  },

  // Get clients (alias for compatibility)
  getClients: async (): Promise<ApiResponse<Client[]>> => {
    return clientAPI.getClients();
  },

  // Create client (alias for compatibility)
  createClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Client>> => {
    return clientAPI.createClient(client);
  },

  // Update client (alias for compatibility)
  updateClient: async (id: string, client: Partial<Client>): Promise<ApiResponse<Client>> => {
    return clientAPI.updateClient(id, client);
  },

  // Delete client (alias for compatibility)
  deleteClient: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return clientAPI.deleteClient(id);
  },

  // Get appointments (alias for compatibility)
  getAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    return appointmentAPI.getAppointments();
  },

  // Create appointment (alias for compatibility)
  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Appointment>> => {
    return appointmentAPI.createAppointment(appointment);
  },

  // Update appointment (alias for compatibility)
  updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    return appointmentAPI.updateAppointment(id, appointment);
  },

  // Delete appointment (alias for compatibility)
  deleteAppointment: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return appointmentAPI.deleteAppointment(id);
  },

  // Get services (alias for compatibility)
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    return serviceAPI.getServices();
  },

  // Create service (alias for compatibility)
  createService: async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Service>> => {
    return serviceAPI.createService(service);
  },

  // Update service (alias for compatibility)
  updateService: async (id: string, service: Partial<Service>): Promise<ApiResponse<Service>> => {
    return serviceAPI.updateService(id, service);
  },

  // Delete service (alias for compatibility)
  deleteService: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return serviceAPI.deleteService(id);
  },

  // Get service categories (alias for compatibility)
  getServiceCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    return { success: true, data: [] };
  },


  // Get business stats
  getBusinessStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get('/api/stats/business');
      return response.data;
    } catch (error) {
      console.error('Failed to get business stats:', error);
      return { success: false, error: 'Failed to get business stats' };
    }
  },

  // Get revenue stats
  getRevenueStats: async (period: string = 'monthly'): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get(`/api/stats/revenue/${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get revenue stats:', error);
      return { success: false, error: 'Failed to get revenue stats' };
    }
  },

  // Get appointment stats
  getAppointmentStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get('/api/stats/appointments');
      return response.data;
    } catch (error) {
      console.error('Failed to get appointment stats:', error);
      return { success: false, error: 'Failed to get appointment stats' };
    }
  },

  // Get client stats
  getClientStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get('/api/stats/clients');
      return response.data;
    } catch (error) {
      console.error('Failed to get client stats:', error);
      return { success: false, error: 'Failed to get client stats' };
    }
  }
};

export const templateAPI = {
  // Get all templates
  getTemplates: async (): Promise<ApiResponse<EmailTemplate[]>> => {
    try {
      const response = await axiosInstance.get('/api/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return { success: false, error: 'Failed to fetch templates', data: [] };
    }
  },

  // Get template by ID
  getTemplate: async (id: string): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await axiosInstance.get(`/api/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      return { success: false, error: 'Failed to fetch template' };
    }
  },

  // Create template
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await axiosInstance.post('/api/templates', template);
      return response.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      return { success: false, error: 'Failed to create template' };
    }
  },

  // Update template
  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await axiosInstance.put(`/api/templates/${id}`, template);
      return response.data;
    } catch (error) {
      console.error('Failed to update template:', error);
      return { success: false, error: 'Failed to update template' };
    }
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return { success: false, error: 'Failed to delete template' };
    }
  }
};

export const categoryAPI = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await axiosInstance.get('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return { success: false, error: 'Failed to fetch categories', data: [] };
    }
  },

  // Get category by ID
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      const response = await axiosInstance.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      return { success: false, error: 'Failed to fetch category' };
    }
  },

  // Create category
  createCategory: async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Category>> => {
    try {
      const response = await axiosInstance.post('/api/categories', category);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      return { success: false, error: 'Failed to create category' };
    }
  },

  // Update category
  updateCategory: async (id: string, category: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const response = await axiosInstance.put(`/api/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      return { success: false, error: 'Failed to update category' };
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return { success: false, error: 'Failed to delete category' };
    }
  },

  // Get category statistics
  getCategoryStats: async (): Promise<ApiResponse<CategoryStats[]>> => {
    try {
      const response = await axiosInstance.get('/api/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category stats:', error);
      return { success: false, error: 'Failed to fetch category statistics', data: [] };
    }
  }
};

export const serviceAPI = {
  // Get all services
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    try {
      const response = await axiosInstance.get('/api/services');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return { success: false, error: 'Failed to fetch services', data: [] };
    }
  },

  // Get service by ID
  getService: async (id: string): Promise<ApiResponse<Service>> => {
    try {
      const response = await axiosInstance.get(`/api/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch service:', error);
      return { success: false, error: 'Failed to fetch service' };
    }
  },

  // Create service
  createService: async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Service>> => {
    try {
      const response = await axiosInstance.post('/api/services', service);
      return response.data;
    } catch (error) {
      console.error('Failed to create service:', error);
      return { success: false, error: 'Failed to create service' };
    }
  },

  // Update service
  updateService: async (id: string, service: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      const response = await axiosInstance.put(`/api/services/${id}`, service);
      return response.data;
    } catch (error) {
      console.error('Failed to update service:', error);
      return { success: false, error: 'Failed to update service' };
    }
  },

  // Delete service
  deleteService: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete service:', error);
      return { success: false, error: 'Failed to delete service' };
    }
  }
};

export const clientAPI = {
  // Get all clients
  getClients: async (): Promise<ApiResponse<Client[]>> => {
    try {
      const response = await axiosInstance.get('/api/clients');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      return { success: false, error: 'Failed to fetch clients', data: [] };
    }
  },

  // Get client by ID
  getClient: async (id: string): Promise<ApiResponse<Client>> => {
    try {
      const response = await axiosInstance.get(`/api/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client:', error);
      return { success: false, error: 'Failed to fetch client' };
    }
  },

  // Create client
  createClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Client>> => {
    try {
      const response = await axiosInstance.post('/api/clients', client);
      return response.data;
    } catch (error) {
      console.error('Failed to create client:', error);
      return { success: false, error: 'Failed to create client' };
    }
  },

  // Update client
  updateClient: async (id: string, client: Partial<Client>): Promise<ApiResponse<Client>> => {
    try {
      const response = await axiosInstance.put(`/api/clients/${id}`, client);
      return response.data;
    } catch (error) {
      console.error('Failed to update client:', error);
      return { success: false, error: 'Failed to update client' };
    }
  },

  // Delete client
  deleteClient: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete client:', error);
      return { success: false, error: 'Failed to delete client' };
    }
  }
};

export const quotationAPI = {
  // Get all quotations
  getQuotations: async (): Promise<ApiResponse<Quotation[]>> => {
    try {
      const response = await axiosInstance.get('/api/quotations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      return { success: false, error: 'Failed to fetch quotations', data: [] };
    }
  },

  // Get quotation by ID
  getQuotation: async (id: string): Promise<ApiResponse<Quotation>> => {
    try {
      const response = await axiosInstance.get(`/api/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quotation:', error);
      return { success: false, error: 'Failed to fetch quotation' };
    }
  },

  // Create quotation
  createQuotation: async (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Quotation>> => {
    try {
      const response = await axiosInstance.post('/api/quotations', quotation);
      return response.data;
    } catch (error) {
      console.error('Failed to create quotation:', error);
      return { success: false, error: 'Failed to create quotation' };
    }
  },

  // Update quotation
  updateQuotation: async (id: string, quotation: Partial<Quotation>): Promise<ApiResponse<Quotation>> => {
    try {
      const response = await axiosInstance.put(`/api/quotations/${id}`, quotation);
      return response.data;
    } catch (error) {
      console.error('Failed to update quotation:', error);
      return { success: false, error: 'Failed to update quotation' };
    }
  },

  // Delete quotation
  deleteQuotation: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      return { success: false, error: 'Failed to delete quotation' };
    }
  },

  // Send quotation by email
  sendQuotation: async (id: string): Promise<ApiResponse<{ sent: boolean }>> => {
    try {
      const response = await axiosInstance.post(`/api/quotations/${id}/send`);
      return response.data;
    } catch (error) {
      console.error('Failed to send quotation:', error);
      return { success: false, error: 'Failed to send quotation' };
    }
  }
};

export const appointmentAPI = {
  // Get all appointments
  getAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    try {
      const response = await axiosInstance.get('/api/appointments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      return { success: false, error: 'Failed to fetch appointments', data: [] };
    }
  },

  // Get appointment by ID
  getAppointment: async (id: string): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await axiosInstance.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      return { success: false, error: 'Failed to fetch appointment' };
    }
  },

  // Create appointment
  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await axiosInstance.post('/api/appointments', appointment);
      return response.data;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      return { success: false, error: 'Failed to create appointment' };
    }
  },

  // Update appointment
  updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await axiosInstance.put(`/api/appointments/${id}`, appointment);
      return response.data;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      return { success: false, error: 'Failed to update appointment' };
    }
  },

  // Delete appointment
  deleteAppointment: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await axiosInstance.delete(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      return { success: false, error: 'Failed to delete appointment' };
    }
  }
};



// Unified API export
export const api = {
  email: emailAPI,
  template: templateAPI,
  category: categoryAPI,
  service: serviceAPI,
  client: clientAPI,
  quotation: quotationAPI,
  appointment: appointmentAPI,
};

export default api;