export interface EmailData {
    id: number;
    gmailId: string;
    subject: string;
    from: string;
    date: string;
    body: string;
    snippet: string;
    category: string;
    confidence: number;
    processed: boolean;
    responded: boolean;
    responseTemplate?: string;
    createdAt: string;
    updatedAt: string;
    threadId?: string;
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category?: string;
    variables?: string[];
    createdAt: string;
    updatedAt: string;
}
export interface CategoryStats {
    category: string;
    count: number;
    responded_count: number;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    unit: string;
    estimatedTime: string;
    materials: string[];
    active: boolean;
}
export interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    services: string[];
}
export interface Quotation {
    id: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    services: Array<{
        serviceId: string;
        serviceName: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
    createdAt: string;
    validUntil: string;
    updatedAt: string;
    notes?: string;
}
export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    createdAt: string;
}
export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    serviceIds: string[];
    serviceNames: string[];
    date: string;
    time: string;
    duration: number;
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    address: string;
    createdAt: string;
}
export interface CalendarAvailability {
    date: string;
    timeSlots: Array<{
        time: string;
        available: boolean;
        appointmentId?: string;
    }>;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
//# sourceMappingURL=types.d.ts.map