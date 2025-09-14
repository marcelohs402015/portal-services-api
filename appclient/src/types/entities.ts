// =====================================================
// Portal Services - Frontend Entity Types
// =====================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phone_secondary?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  document?: string;
  document_type: 'cpf' | 'cnpj';
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number; // em minutos
  category_id?: string;
  active: boolean;
  requires_quote: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  client_id: string;
  service_id?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  title: string;
  description?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  client_id: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  body?: string;
  body_html?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  email_type: 'general' | 'quotation' | 'appointment' | 'notification';
  related_id?: string;
  related_type?: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  active?: boolean;
  sort_order?: number;
}

export interface CreateClientDTO {
  name: string;
  email?: string;
  phone?: string;
  phone_secondary?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  document?: string;
  document_type?: 'cpf' | 'cnpj';
  notes?: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
  phone_secondary?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  document?: string;
  document_type?: 'cpf' | 'cnpj';
  notes?: string;
  active?: boolean;
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  category_id?: string;
  requires_quote?: boolean;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category_id?: string;
  active?: boolean;
  requires_quote?: boolean;
}

export interface CreateAppointmentDTO {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  client_id: string;
  service_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface UpdateAppointmentDTO {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  service_id?: string;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface CreateQuotationDTO {
  title: string;
  description?: string;
  client_id: string;
  valid_until?: string;
  notes?: string;
  items?: CreateQuotationItemDTO[];
}

export interface UpdateQuotationDTO {
  title?: string;
  description?: string;
  client_id?: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until?: string;
  notes?: string;
  discount_amount?: number;
}

export interface CreateQuotationItemDTO {
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateQuotationItemDTO {
  service_id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
}

// =====================================================
// Query Parameters
// =====================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  active?: boolean;
  status?: string;
  category_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// =====================================================
// Response Types
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DashboardStats {
  total_clients: number;
  pending_appointments: number;
  draft_quotations: number;
  pending_emails: number;
  monthly_revenue: number;
}

export interface AppointmentWithDetails extends Appointment {
  client?: Client;
  service?: Service;
  category?: Category;
}

export interface QuotationWithDetails extends Quotation {
  client?: Client;
  items?: QuotationItem[];
  created_by_user?: User;
}
