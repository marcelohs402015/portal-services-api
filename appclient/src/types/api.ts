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
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables?: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryStats {
  category: string;
  count: number;
  responded_count: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  category?: string;
  from?: string;
  dateFrom?: string;
  dateTo?: string;
  responded?: boolean;
  processed?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Services and Quotations
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string; // 'hora', 'dia', 'metro', 'unidade', etc.
  estimated_time: string;
  materials?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface QuotationItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  discount?: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
  validUntil: string;
  created_at: string;
  updated_at: string;
}

// Calendar Availability
export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  notes?: string;
}

export interface WeeklyAvailability {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface CalendarAvailability {
  id: string;
  type: 'specific' | 'weekly' | 'monthly';
  specificDays?: AvailabilityDay[];
  weeklyPattern?: WeeklyAvailability[];
  created_at: string;
  updated_at: string;
}

// Client Management
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Calendar Appointments
export interface Appointment {
  id: string;
  clientId: string;
  client: Client;
  quotationId?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

