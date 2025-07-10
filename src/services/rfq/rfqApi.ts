import { supabase, ApiResponse } from '@/lib/supabase'
import { RFQ, RFQWithCompany, RFQPayload, RFQFilters } from '@/types/rfq/rfq'

export const rfqApi = {
  // Get all RFQs
  async getAll(): Promise<ApiResponse<RFQ[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
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

  // Get RFQ by ID
  async getById(id: string): Promise<ApiResponse<RFQ>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
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

  // Get RFQ by ID with company information
  async getByIdWithCompany(id: string): Promise<ApiResponse<RFQWithCompany>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
        .select(`
          *,
          company_info:tb_company!tb_rfq_company_fkey (
            id,
            name,
            image,
            slug,
            phone,
            address,
            url,
            status,
            enabled
          )
        `)
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

  // Get RFQs by company ID
  async getByCompanyId(companyId: string): Promise<ApiResponse<RFQ[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
        .select('*')
        .or(`company.eq.${companyId},company_atos.eq.${companyId}`)
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
  },

  // Get RFQs with company information
  async getAllWithCompany(): Promise<ApiResponse<RFQWithCompany[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
        .select(`
          *,
          company_info:tb_company!tb_rfq_company_fkey (
            id,
            name,
            image,
            slug
          )
        `)
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
      console.error('Exception in getAllWithCompany:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }
    }
  },

  // Get RFQs by company ID with pagination
  async getByCompanyIdPaginated(
    companyId: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<ApiResponse<{ data: RFQ[]; total: number }>> {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await supabase
        .from('tb_rfq')
        .select('*', { count: 'exact' })
        .or(`company.eq.${companyId},company_atos.eq.${companyId}`)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: {
          data: data || [],
          total: count || 0
        },
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

  // Create RFQ
  async create(rfq: RFQPayload): Promise<ApiResponse<RFQ>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
        .insert([rfq])
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

  // Update RFQ
  async update(id: string, updates: Partial<RFQPayload>): Promise<ApiResponse<RFQ>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
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

  // Delete RFQ
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tb_rfq')
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

  // Search RFQs
  async search(query: string): Promise<ApiResponse<RFQ[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_rfq')
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
  },

  // Advanced search with filters
  async searchWithFilters(filters: RFQFilters): Promise<ApiResponse<RFQ[]>> {
    try {
      let query = supabase
        .from('tb_rfq')
        .select('*')

      // Apply filters
      if (filters.company) {
        query = query.eq('company', filters.company)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      
      if (filters.assigned) {
        query = query.eq('assigned', filters.assigned)
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize
        const to = from + filters.pageSize - 1
        query = query.range(from, to)
      }

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