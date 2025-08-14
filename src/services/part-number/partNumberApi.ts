import { supabase } from '@/lib/supabase';
import { PartNumber, PartNumberPayload, PartNumberFilters } from '@/types/part-number/partNumber';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

export const partNumberApi = {
  // Get all part numbers with optional filters
  async getAll(filters?: PartNumberFilters): Promise<ApiResponse<PartNumber[]>> {
    try {
      let query = supabase
        .from('tb_part_number')
        .select('*');

      // Apply filters
      if (filters?.company_atos) {
        query = query.eq('company', filters.company_atos);
      }
      if (filters?.company) {
        query = query.eq('company', filters.company);
      }
      if (filters?.company_id) {
        query = query.eq('company', filters.company_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.supplier) {
        query = query.eq('supplier', filters.supplier);
      }
      if (filters?.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }
      if (filters?.priority !== undefined) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,slug_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .order('created_at_atos', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part numbers by RFQ ID
  async getByRfqId(rfqId: string): Promise<ApiResponse<PartNumber[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_part_number')
        .select('*')
        .eq('rfq', rfqId)
        .order('created_at_atos', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part numbers by RFQ ID with pagination
  async getByRfqIdPaginated(
    rfqId: string,
    page: number = 1,
    pageSize: number = 10,
    filters?: PartNumberFilters
  ): Promise<PaginatedResponse<PartNumber>> {
    try {
      const offset = (page - 1) * pageSize;
      
      let query = supabase
        .from('tb_part_number')
        .select('*', { count: 'exact' })
        .eq('rfq', rfqId);

      // Apply additional filters
      if (filters?.company_atos) {
        query = query.eq('company', filters.company_atos);
      }
      if (filters?.company) {
        query = query.eq('company', filters.company);
      }
      if (filters?.company_id) {
        query = query.eq('company', filters.company_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.supplier) {
        query = query.eq('supplier', filters.supplier);
      }
      if (filters?.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }
      if (filters?.priority !== undefined) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,slug_name.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at_atos', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0, error: null };
    } catch (err) {
      return { data: [], count: 0, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part numbers by company ID (via RFQ relationship)
  async getByCompanyId(companyId: string): Promise<ApiResponse<PartNumber[]>> {
    try {
      // First get all RFQs for this company
      const { data: rfqs, error: rfqError } = await supabase
        .from('tb_rfq')
        .select('id')
        .eq('company', companyId);

      if (rfqError) {
        return { data: null, error: rfqError.message };
      }

      if (!rfqs || rfqs.length === 0) {
        return { data: [], error: null };
      }

      // Get part numbers for all RFQs of this company
      const rfqIds = rfqs.map(rfq => rfq.id);
      const { data, error } = await supabase
        .from('tb_part_number')
        .select('*')
        .in('rfq', rfqIds)
        .order('created_at_atos', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part number by ID
  async getById(id: string): Promise<ApiResponse<PartNumber>> {
    try {
      const { data, error } = await supabase
        .from('tb_part_number')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch part number' };
    }
  },

  // Create new part number
  async create(partNumber: PartNumberPayload): Promise<ApiResponse<PartNumber>> {
    try {
      
      const { data, error } = await supabase
        .from('tb_part_number')
        .insert([partNumber])
        .select()
        .single();

      if (error) {
        
        // Enhanced error messages for specific issues
        let errorMessage = error.message || 'Failed to create part number';
        
        if (error.code === '22P02' && error.message.includes('uuid')) {
          errorMessage = `Database schema error: Expected UUID but received URL. Field: ${error.message}`;
        } else if (error.code === 'PGRST204') {
          errorMessage = `Database schema error: Column not found - ${error.message}`;
        } else if (error.code === '23505') {
          errorMessage = 'A part number with this information already exists';
        }
        
        return { data: null, error: errorMessage };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create part number';
      return { data: null, error: errorMessage };
    }
  },

  // Update part number
  async update(id: string, partNumber: Partial<PartNumberPayload>): Promise<ApiResponse<PartNumber>> {
    try {
      
      const { data, error } = await supabase
        .from('tb_part_number')
        .update(partNumber)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to update part number' };
    }
  },

  // Delete part number
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_part_number')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to delete part number' };
    }
  }
}; 