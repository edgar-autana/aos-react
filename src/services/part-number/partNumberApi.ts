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
        query = query.eq('company_atos', filters.company_atos);
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
        console.error('Error fetching part numbers:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getAll:', err);
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
        console.error('Error fetching part numbers by RFQ:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByRfqId:', err);
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
        console.error('Error fetching paginated part numbers:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0, error: null };
    } catch (err) {
      console.error('Exception in getByRfqIdPaginated:', err);
      return { data: [], count: 0, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part numbers by company ID
  async getByCompanyId(companyId: string): Promise<ApiResponse<PartNumber[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_part_number')
        .select('*')
        .eq('company_atos', companyId)
        .order('created_at_atos', { ascending: false });

      if (error) {
        console.error('Error fetching part numbers by company:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByCompanyId:', err);
      return { data: null, error: 'Failed to fetch part numbers' };
    }
  },

  // Get part number by ID
  async getById(id: string): Promise<ApiResponse<PartNumber>> {
    try {
      const { data, error } = await supabase
        .from('tb_part_number')
        .select('*')
        .eq('id_atos', id)
        .single();

      if (error) {
        console.error('Error fetching part number by ID:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in getById:', err);
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
        console.error('Error creating part number:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in create:', err);
      return { data: null, error: 'Failed to create part number' };
    }
  },

  // Update part number
  async update(id: string, partNumber: Partial<PartNumberPayload>): Promise<ApiResponse<PartNumber>> {
    try {
      const { data, error } = await supabase
        .from('tb_part_number')
        .update(partNumber)
        .eq('id_atos', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating part number:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in update:', err);
      return { data: null, error: 'Failed to update part number' };
    }
  },

  // Delete part number
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_part_number')
        .delete()
        .eq('id_atos', id);

      if (error) {
        console.error('Error deleting part number:', error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Exception in delete:', err);
      return { data: null, error: 'Failed to delete part number' };
    }
  }
}; 