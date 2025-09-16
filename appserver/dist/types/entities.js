"use strict";
// =====================================================
// Portal Services - Entity Types
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryParamsSchema = exports.UpdateSettingSchema = exports.CreateSettingSchema = exports.UpdateEmailSchema = exports.CreateEmailSchema = exports.UpdateQuotationItemSchema = exports.CreateQuotationItemSchema = exports.UpdateQuotationSchema = exports.CreateQuotationSchema = exports.UpdateAppointmentSchema = exports.CreateAppointmentSchema = exports.UpdateServiceSchema = exports.CreateServiceSchema = exports.UpdateClientSchema = exports.CreateClientSchema = exports.UpdateCategorySchema = exports.CreateCategorySchema = exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
// =====================================================
// Validation Schemas (using Zod)
// =====================================================
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: zod_1.z.enum(['admin', 'manager', 'operator']).optional()
});
exports.UpdateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(['admin', 'manager', 'operator']).optional(),
    active: zod_1.z.boolean().optional()
});
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido').optional(),
    icon: zod_1.z.string().optional(),
    sort_order: zod_1.z.number().int().min(0).optional()
});
exports.UpdateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icon: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional(),
    sort_order: zod_1.z.number().int().min(0).optional()
});
exports.CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    email: zod_1.z.string().email('Email deve ser válido'),
    phone: zod_1.z.string().optional(),
    phone_secondary: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().length(2).optional(),
    zip_code: zod_1.z.string().optional(),
    document: zod_1.z.string().optional(),
    document_type: zod_1.z.enum(['cpf', 'cnpj']).optional(),
    notes: zod_1.z.string().optional()
});
exports.UpdateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    phone_secondary: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().length(2).optional(),
    zip_code: zod_1.z.string().optional(),
    document: zod_1.z.string().optional(),
    document_type: zod_1.z.enum(['cpf', 'cnpj']).optional(),
    notes: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional()
});
exports.CreateServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    price: zod_1.z.number().min(0).optional(),
    duration: zod_1.z.number().int().min(0).optional(),
    category_id: zod_1.z.string().uuid().optional(),
    requires_quote: zod_1.z.boolean().optional()
});
exports.UpdateServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().min(0).optional(),
    duration: zod_1.z.number().int().min(0).optional(),
    category_id: zod_1.z.string().uuid().optional(),
    active: zod_1.z.boolean().optional(),
    requires_quote: zod_1.z.boolean().optional()
});
exports.CreateAppointmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    description: zod_1.z.string().optional(),
    start_date: zod_1.z.coerce.date(),
    end_date: zod_1.z.coerce.date(),
    client_id: zod_1.z.string().uuid('ID do cliente inválido'),
    service_id: zod_1.z.string().uuid().optional(),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    notes: zod_1.z.string().optional()
}).refine(data => data.end_date > data.start_date, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['end_date']
});
exports.UpdateAppointmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    start_date: zod_1.z.coerce.date().optional(),
    end_date: zod_1.z.coerce.date().optional(),
    client_id: zod_1.z.string().uuid().optional(),
    service_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    notes: zod_1.z.string().optional()
});
exports.CreateQuotationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    description: zod_1.z.string().optional(),
    client_id: zod_1.z.string().uuid('ID do cliente inválido'),
    valid_until: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        service_id: zod_1.z.string().uuid().optional(),
        description: zod_1.z.string().min(1, 'Descrição do item é obrigatória'),
        quantity: zod_1.z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
        unit_price: zod_1.z.number().min(0, 'Preço unitário deve ser positivo')
    })).optional()
});
exports.UpdateQuotationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    client_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
    valid_until: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
    discount_amount: zod_1.z.number().min(0).optional()
});
exports.CreateQuotationItemSchema = zod_1.z.object({
    service_id: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    quantity: zod_1.z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
    unit_price: zod_1.z.number().min(0, 'Preço unitário deve ser positivo')
});
exports.UpdateQuotationItemSchema = zod_1.z.object({
    service_id: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().min(1).optional(),
    quantity: zod_1.z.number().int().min(1).optional(),
    unit_price: zod_1.z.number().min(0).optional()
});
exports.CreateEmailSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, 'Assunto é obrigatório'),
    sender: zod_1.z.string().email('Email do remetente inválido'),
    recipient: zod_1.z.string().email('Email do destinatário inválido'),
    body: zod_1.z.string().optional(),
    body_html: zod_1.z.string().optional(),
    email_type: zod_1.z.enum(['general', 'quotation', 'appointment', 'notification']).optional(),
    related_id: zod_1.z.string().uuid().optional(),
    related_type: zod_1.z.string().optional()
});
exports.UpdateEmailSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1).optional(),
    sender: zod_1.z.string().email().optional(),
    recipient: zod_1.z.string().email().optional(),
    body: zod_1.z.string().optional(),
    body_html: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'sent', 'failed', 'delivered', 'bounced']).optional(),
    error_message: zod_1.z.string().optional()
});
exports.CreateSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Chave é obrigatória'),
    value: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'json']).optional(),
    category: zod_1.z.string().optional()
});
exports.UpdateSettingSchema = zod_1.z.object({
    value: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'json']).optional(),
    category: zod_1.z.string().optional()
});
exports.QueryParamsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    offset: zod_1.z.coerce.number().int().min(0).optional(),
    sort_by: zod_1.z.string().optional(),
    sort_order: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional(),
    status: zod_1.z.string().optional(),
    category_id: zod_1.z.string().uuid().optional(),
    client_id: zod_1.z.string().uuid().optional(),
    date_from: zod_1.z.coerce.date().optional(),
    date_to: zod_1.z.coerce.date().optional()
});
