import { supabase, ApiResponse } from '@/lib/supabase'
import { Supplier } from '@/types/supplier/supplier'

export const supplierApi = {
  // Get all suppliers
  async getAll(): Promise<ApiResponse<Supplier[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_supplier')
        .select('*')
        .order('created_at_atos', { ascending: false })

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Exception in getAll:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Get supplier by ID
  async getById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('tb_supplier')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Create supplier
  async create(supplier: Omit<Supplier, 'id'>): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('tb_supplier')
        .insert([supplier])
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Update supplier
  async update(id: string, updates: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('tb_supplier')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Delete supplier
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tb_supplier')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: null,
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Search suppliers
  async search(query: string): Promise<ApiResponse<Supplier[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_supplier')
        .select('*')
        .or(`name.ilike.%${query}%,comercial_name.ilike.%${query}%,link_web.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at_atos', { ascending: false })

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Filter suppliers by specific criteria
  async filter(filters: {
    enabled?: boolean;
    size?: string;
    type?: string;
    state?: string;
    iso_9001_2015?: boolean;
    iatf?: boolean;
  }): Promise<ApiResponse<Supplier[]>> {
    try {
      let query = supabase
        .from('tb_supplier')
        .select('*')

      // Apply filters
      if (filters.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled)
      }

      if (filters.size) {
        query = query.eq('size', filters.size)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.state) {
        query = query.eq('state', filters.state)
      }

      if (filters.iso_9001_2015 !== undefined) {
        query = query.eq('iso_9001_2015', filters.iso_9001_2015)
      }

      if (filters.iatf !== undefined) {
        query = query.eq('iatf', filters.iatf)
      }

      query = query.order('created_at_atos', { ascending: false })

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  }
} 