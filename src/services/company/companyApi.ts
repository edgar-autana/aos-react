import { supabase, Company, ApiResponse } from '@/lib/supabase'

export const companyApi = {
  // Get all companies
  async getAll(): Promise<ApiResponse<Company[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_company')
        .select('*')
        .order('created_at', { ascending: false })


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

  // Get company by ID
  async getById(id: string): Promise<ApiResponse<Company>> {
    try {
      const { data, error } = await supabase
        .from('tb_company')
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

  // Create company
  async create(company: Omit<Company, 'id' | 'created_at'>): Promise<ApiResponse<Company>> {
    try {
      const { data, error } = await supabase
        .from('tb_company')
        .insert([company])
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

  // Update company
  async update(id: string, updates: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const { data, error } = await supabase
        .from('tb_company')
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

  // Delete company
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tb_company')
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

  // Search companies
  async search(query: string): Promise<ApiResponse<Company[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_company')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

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