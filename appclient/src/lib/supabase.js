import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions para operações comuns
export const supabaseHelpers = {
  // Services
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createService(service) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateService(id, updates) {
    const { data, error } = await supabase
      .from('services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteService(id) {
    const { error } = await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id)
    
    if (error) throw error
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async createCategory(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Clients
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createClient(client) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Quotations
  async getQuotations() {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createQuotation(quotation) {
    const { data, error } = await supabase
      .from('quotations')
      .insert([quotation])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateQuotation(id, updates) {
    const { data, error } = await supabase
      .from('quotations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Appointments
  async getAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createAppointment(appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Emails
  async getEmails() {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEmail(email) {
    const { data, error } = await supabase
      .from('emails')
      .insert([email])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Stats
  async getStats() {
    const [services, clients, quotations, appointments] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact' }),
      supabase.from('clients').select('id', { count: 'exact' }),
      supabase.from('quotations').select('id', { count: 'exact' }),
      supabase.from('appointments').select('id', { count: 'exact' })
    ])

    return {
      services: services.count || 0,
      clients: clients.count || 0,
      quotations: quotations.count || 0,
      appointments: appointments.count || 0
    }
  }
}
