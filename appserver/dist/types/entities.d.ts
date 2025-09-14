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
    duration?: number;
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
export interface QueryParams extends PaginationParams, SortParams, FilterParams {
}
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
import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "operator"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
    email: string;
    role?: "admin" | "manager" | "operator" | undefined;
}, {
    name: string;
    password: string;
    email: string;
    role?: "admin" | "manager" | "operator" | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "operator"]>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    active?: boolean | undefined;
    password?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "manager" | "operator" | undefined;
}, {
    name?: string | undefined;
    active?: boolean | undefined;
    password?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "manager" | "operator" | undefined;
}>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    sort_order?: number | undefined;
    icon?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    sort_order?: number | undefined;
    icon?: string | undefined;
}>;
export declare const UpdateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    sort_order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
    active?: boolean | undefined;
    sort_order?: number | undefined;
    icon?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
    active?: boolean | undefined;
    sort_order?: number | undefined;
    icon?: string | undefined;
}>;
export declare const CreateClientSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    phone_secondary: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip_code: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    document_type: z.ZodOptional<z.ZodEnum<["cpf", "cnpj"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    phone_secondary?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    document?: string | undefined;
    document_type?: "cpf" | "cnpj" | undefined;
}, {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    phone_secondary?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    document?: string | undefined;
    document_type?: "cpf" | "cnpj" | undefined;
}>;
export declare const UpdateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    phone_secondary: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip_code: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    document_type: z.ZodOptional<z.ZodEnum<["cpf", "cnpj"]>>;
    notes: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    active?: boolean | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    phone_secondary?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    document?: string | undefined;
    document_type?: "cpf" | "cnpj" | undefined;
}, {
    name?: string | undefined;
    active?: boolean | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    phone_secondary?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    document?: string | undefined;
    document_type?: "cpf" | "cnpj" | undefined;
}>;
export declare const CreateServiceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    category_id: z.ZodOptional<z.ZodString>;
    requires_quote: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    price?: number | undefined;
    duration?: number | undefined;
    category_id?: string | undefined;
    requires_quote?: boolean | undefined;
}, {
    name: string;
    description?: string | undefined;
    price?: number | undefined;
    duration?: number | undefined;
    category_id?: string | undefined;
    requires_quote?: boolean | undefined;
}>;
export declare const UpdateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    category_id: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    requires_quote: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    active?: boolean | undefined;
    price?: number | undefined;
    duration?: number | undefined;
    category_id?: string | undefined;
    requires_quote?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    active?: boolean | undefined;
    price?: number | undefined;
    duration?: number | undefined;
    category_id?: string | undefined;
    requires_quote?: boolean | undefined;
}>;
export declare const CreateAppointmentSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start_date: z.ZodDate;
    end_date: z.ZodDate;
    client_id: z.ZodString;
    service_id: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start_date: Date;
    end_date: Date;
    client_id: string;
    description?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}, {
    title: string;
    start_date: Date;
    end_date: Date;
    client_id: string;
    description?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}>, {
    title: string;
    start_date: Date;
    end_date: Date;
    client_id: string;
    description?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}, {
    title: string;
    start_date: Date;
    end_date: Date;
    client_id: string;
    description?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}>;
export declare const UpdateAppointmentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    client_id: z.ZodOptional<z.ZodString>;
    service_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    status?: "scheduled" | "cancelled" | "confirmed" | "in_progress" | "completed" | "no_show" | undefined;
    title?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    client_id?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}, {
    description?: string | undefined;
    status?: "scheduled" | "cancelled" | "confirmed" | "in_progress" | "completed" | "no_show" | undefined;
    title?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    client_id?: string | undefined;
    service_id?: string | undefined;
    notes?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
}>;
export declare const CreateQuotationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    client_id: z.ZodString;
    valid_until: z.ZodOptional<z.ZodDate>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        service_id: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unit_price: number;
        service_id?: string | undefined;
    }, {
        description: string;
        quantity: number;
        unit_price: number;
        service_id?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    client_id: string;
    description?: string | undefined;
    valid_until?: Date | undefined;
    notes?: string | undefined;
    items?: {
        description: string;
        quantity: number;
        unit_price: number;
        service_id?: string | undefined;
    }[] | undefined;
}, {
    title: string;
    client_id: string;
    description?: string | undefined;
    valid_until?: Date | undefined;
    notes?: string | undefined;
    items?: {
        description: string;
        quantity: number;
        unit_price: number;
        service_id?: string | undefined;
    }[] | undefined;
}>;
export declare const UpdateQuotationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    client_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "approved", "rejected", "expired"]>>;
    valid_until: z.ZodOptional<z.ZodDate>;
    notes: z.ZodOptional<z.ZodString>;
    discount_amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    status?: "draft" | "sent" | "approved" | "rejected" | "expired" | undefined;
    title?: string | undefined;
    client_id?: string | undefined;
    valid_until?: Date | undefined;
    notes?: string | undefined;
    discount_amount?: number | undefined;
}, {
    description?: string | undefined;
    status?: "draft" | "sent" | "approved" | "rejected" | "expired" | undefined;
    title?: string | undefined;
    client_id?: string | undefined;
    valid_until?: Date | undefined;
    notes?: string | undefined;
    discount_amount?: number | undefined;
}>;
export declare const CreateQuotationItemSchema: z.ZodObject<{
    service_id: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit_price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    unit_price: number;
    service_id?: string | undefined;
}, {
    description: string;
    quantity: number;
    unit_price: number;
    service_id?: string | undefined;
}>;
export declare const UpdateQuotationItemSchema: z.ZodObject<{
    service_id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    unit_price: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    service_id?: string | undefined;
    quantity?: number | undefined;
    unit_price?: number | undefined;
}, {
    description?: string | undefined;
    service_id?: string | undefined;
    quantity?: number | undefined;
    unit_price?: number | undefined;
}>;
export declare const CreateEmailSchema: z.ZodObject<{
    subject: z.ZodString;
    sender: z.ZodString;
    recipient: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    body_html: z.ZodOptional<z.ZodString>;
    email_type: z.ZodOptional<z.ZodEnum<["general", "quotation", "appointment", "notification"]>>;
    related_id: z.ZodOptional<z.ZodString>;
    related_type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    sender: string;
    recipient: string;
    body?: string | undefined;
    body_html?: string | undefined;
    email_type?: "general" | "quotation" | "appointment" | "notification" | undefined;
    related_id?: string | undefined;
    related_type?: string | undefined;
}, {
    subject: string;
    sender: string;
    recipient: string;
    body?: string | undefined;
    body_html?: string | undefined;
    email_type?: "general" | "quotation" | "appointment" | "notification" | undefined;
    related_id?: string | undefined;
    related_type?: string | undefined;
}>;
export declare const UpdateEmailSchema: z.ZodObject<{
    subject: z.ZodOptional<z.ZodString>;
    sender: z.ZodOptional<z.ZodString>;
    recipient: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    body_html: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "sent", "failed", "delivered", "bounced"]>>;
    error_message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subject?: string | undefined;
    sender?: string | undefined;
    recipient?: string | undefined;
    body?: string | undefined;
    status?: "pending" | "sent" | "failed" | "delivered" | "bounced" | undefined;
    body_html?: string | undefined;
    error_message?: string | undefined;
}, {
    subject?: string | undefined;
    sender?: string | undefined;
    recipient?: string | undefined;
    body?: string | undefined;
    status?: "pending" | "sent" | "failed" | "delivered" | "bounced" | undefined;
    body_html?: string | undefined;
    error_message?: string | undefined;
}>;
export declare const CreateSettingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "json"]>>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    description?: string | undefined;
    value?: string | undefined;
    category?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
}, {
    key: string;
    description?: string | undefined;
    value?: string | undefined;
    category?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
}>;
export declare const UpdateSettingSchema: z.ZodObject<{
    value: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "json"]>>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    value?: string | undefined;
    category?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
}, {
    description?: string | undefined;
    value?: string | undefined;
    category?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
}>;
export declare const QueryParamsSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    client_id: z.ZodOptional<z.ZodString>;
    date_from: z.ZodOptional<z.ZodDate>;
    date_to: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    active?: boolean | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    status?: string | undefined;
    category_id?: string | undefined;
    client_id?: string | undefined;
    page?: number | undefined;
    offset?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_from?: Date | undefined;
    date_to?: Date | undefined;
}, {
    active?: boolean | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    status?: string | undefined;
    category_id?: string | undefined;
    client_id?: string | undefined;
    page?: number | undefined;
    offset?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_from?: Date | undefined;
    date_to?: Date | undefined;
}>;
//# sourceMappingURL=entities.d.ts.map