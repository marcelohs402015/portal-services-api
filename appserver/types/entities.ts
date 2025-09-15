// =====================================================
// Portal Services - Entity Types
// =====================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'operator';
  active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  client_id: string;
  service_id?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
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
  valid_until?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
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
  sent_at?: Date;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Setting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'operator';
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'operator';
  active?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  keywords?: string[];
  patterns?: string[];
  domains?: string[];
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  active?: boolean;
  sort_order?: number;
  keywords?: string[];
  patterns?: string[];
  domains?: string[];
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
  start_date: Date;
  end_date: Date;
  client_id: string;
  service_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface UpdateAppointmentDTO {
  title?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
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
  valid_until?: Date;
  notes?: string;
  items?: CreateQuotationItemDTO[];
  created_by?: string;
}

export interface UpdateQuotationDTO {
  title?: string;
  description?: string;
  client_id?: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until?: Date;
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

export interface CreateEmailDTO {
  subject: string;
  sender: string;
  recipient: string;
  body?: string;
  body_html?: string;
  email_type?: 'general' | 'quotation' | 'appointment' | 'notification';
  related_id?: string;
  related_type?: string;
}

export interface UpdateEmailDTO {
  subject?: string;
  sender?: string;
  recipient?: string;
  body?: string;
  body_html?: string;
  status?: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  error_message?: string;
}

export interface CreateSettingDTO {
  key: string;
  value?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  category?: string;
}

export interface UpdateSettingDTO {
  value?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  category?: string;
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
  date_from?: Date;
  date_to?: Date;
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

// =====================================================
// Validation Schemas (using Zod)
// =====================================================

import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'manager', 'operator']).optional()
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'manager', 'operator']).optional(),
  active: z.boolean().optional()
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido').optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().min(0).optional()
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional()
});

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  phone_secondary: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip_code: z.string().optional(),
  document: z.string().optional(),
  document_type: z.enum(['cpf', 'cnpj']).optional(),
  notes: z.string().optional()
});

export const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  phone_secondary: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip_code: z.string().optional(),
  document: z.string().optional(),
  document_type: z.enum(['cpf', 'cnpj']).optional(),
  notes: z.string().optional(),
  active: z.boolean().optional()
});

export const CreateServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  category_id: z.string().uuid().optional(),
  requires_quote: z.boolean().optional()
});

export const UpdateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  category_id: z.string().uuid().optional(),
  active: z.boolean().optional(),
  requires_quote: z.boolean().optional()
});

export const CreateAppointmentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  client_id: z.string().uuid('ID do cliente inválido'),
  service_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  notes: z.string().optional()
}).refine(data => data.end_date > data.start_date, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['end_date']
});

export const UpdateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  client_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  notes: z.string().optional()
});

export const CreateQuotationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  client_id: z.string().uuid('ID do cliente inválido'),
  valid_until: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    service_id: z.string().uuid().optional(),
    description: z.string().min(1, 'Descrição do item é obrigatória'),
    quantity: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
    unit_price: z.number().min(0, 'Preço unitário deve ser positivo')
  })).optional()
});

export const UpdateQuotationSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  client_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
  valid_until: z.coerce.date().optional(),
  notes: z.string().optional(),
  discount_amount: z.number().min(0).optional()
});

export const CreateQuotationItemSchema = z.object({
  service_id: z.string().uuid().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
  unit_price: z.number().min(0, 'Preço unitário deve ser positivo')
});

export const UpdateQuotationItemSchema = z.object({
  service_id: z.string().uuid().optional(),
  description: z.string().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  unit_price: z.number().min(0).optional()
});

export const CreateEmailSchema = z.object({
  subject: z.string().min(1, 'Assunto é obrigatório'),
  sender: z.string().email('Email do remetente inválido'),
  recipient: z.string().email('Email do destinatário inválido'),
  body: z.string().optional(),
  body_html: z.string().optional(),
  email_type: z.enum(['general', 'quotation', 'appointment', 'notification']).optional(),
  related_id: z.string().uuid().optional(),
  related_type: z.string().optional()
});

export const UpdateEmailSchema = z.object({
  subject: z.string().min(1).optional(),
  sender: z.string().email().optional(),
  recipient: z.string().email().optional(),
  body: z.string().optional(),
  body_html: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed', 'delivered', 'bounced']).optional(),
  error_message: z.string().optional()
});

export const CreateSettingSchema = z.object({
  key: z.string().min(1, 'Chave é obrigatória'),
  value: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().optional()
});

export const UpdateSettingSchema = z.object({
  value: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().optional()
});

export const QueryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  status: z.string().optional(),
  category_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional()
});
