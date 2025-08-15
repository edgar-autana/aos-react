import { supabase } from '@/lib/supabase';
import { 
  GlobalQuotation, 
  GlobalQuotationPayload, 
  GlobalQuotationFilters, 
  GlobalQuotationWithDetails,
  GlobalQuotationPartNumber,
  GlobalQuotationPartNumberWithDetails
} from '@/types/global-quotation/globalQuotation';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

export const globalQuotationApi = {
  // Get all global quotations with optional filters
  async getAll(filters?: GlobalQuotationFilters): Promise<ApiResponse<GlobalQuotation[]>> {
    try {
      let query = supabase
        .from('tb_global_quotation')
        .select('*');

      // Apply filters
      if (filters?.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching global quotations:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getAll:', err);
      return { data: null, error: 'Failed to fetch global quotations' };
    }
  },

  // Get global quotations by company ID
  async getByCompanyId(companyId: string): Promise<ApiResponse<GlobalQuotationWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .select(`
          *,
          rfq_info:tb_rfq!tb_global_quotation_rfq_fkey (
            id,
            name,
            slug_name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching global quotations by company:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByCompanyId:', err);
      return { data: null, error: 'Failed to fetch global quotations' };
    }
  },

  // Get global quotations by RFQ ID
  async getByRfqId(rfqId: string): Promise<ApiResponse<GlobalQuotation[]>> {
    try {
      // Now we can directly filter by rfq field
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .select('*')
        .eq('rfq', rfqId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching global quotations by RFQ:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByRfqId:', err);
      return { data: null, error: 'Failed to fetch global quotations' };
    }
  },

  // Get global quotation by ID with details
  async getByIdWithDetails(id: string): Promise<ApiResponse<GlobalQuotationWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .select(`
          *,
          company:tb_company!tb_global_quotation_company_id_fkey (
            id,
            name,
            image
          ),
          rfq_info:tb_rfq!tb_global_quotation_rfq_fkey (
            id,
            name,
            slug_name
          ),
          part_numbers:tb_global_quotation_part_number (
            id,
            part_number_id,
            quotation_id,
            created_at,
            part_number:tb_part_number!tb_global_quotation_part_number_part_number_id_fkey (
              id,
              part_name,
              drawing_number,
              estimated_anual_units
            ),
            quotation:tb_quotation!tb_global_quotation_part_number_quotation_id_fkey (
              id,
              version_number,
              status,
              unit_price,
              total_price,
              supplier:tb_supplier!tb_quotation_supplier_id_fkey (
                id,
                name,
                comercial_name
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching global quotation with details:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in getByIdWithDetails:', err);
      return { data: null, error: 'Failed to fetch global quotation' };
    }
  },

  // Get global quotation by ID
  async getById(id: string): Promise<ApiResponse<GlobalQuotation>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching global quotation by ID:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in getById:', err);
      return { data: null, error: 'Failed to fetch global quotation' };
    }
  },

  // Create new global quotation
  async create(globalQuotation: GlobalQuotationPayload): Promise<ApiResponse<GlobalQuotation>> {
    try {
      console.log('Creating global quotation with payload:', globalQuotation);
      
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .insert([globalQuotation])
        .select()
        .single();

      if (error) {
        console.error('Error creating global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in create:', err);
      return { data: null, error: 'Failed to create global quotation' };
    }
  },

  // Update global quotation
  async update(id: string, globalQuotation: Partial<GlobalQuotationPayload>): Promise<ApiResponse<GlobalQuotation>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation')
        .update(globalQuotation)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in update:', err);
      return { data: null, error: 'Failed to update global quotation' };
    }
  },

  // Delete global quotation
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_global_quotation')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Exception in delete:', err);
      return { data: null, error: 'Failed to delete global quotation' };
    }
  },

  // Add part number to global quotation
  async addPartNumber(globalQuotationId: string, partNumberId: string, quotationId: string): Promise<ApiResponse<GlobalQuotationPartNumber>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation_part_number')
        .insert([{
          global_quotation_id: globalQuotationId,
          part_number_id: partNumberId,
          quotation_id: quotationId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding part number to global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in addPartNumber:', err);
      return { data: null, error: 'Failed to add part number to global quotation' };
    }
  },

  // Remove part number from global quotation
  async removePartNumber(globalQuotationId: string, partNumberId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_global_quotation_part_number')
        .delete()
        .eq('global_quotation_id', globalQuotationId)
        .eq('part_number_id', partNumberId);

      if (error) {
        console.error('Error removing part number from global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Exception in removePartNumber:', err);
      return { data: null, error: 'Failed to remove part number from global quotation' };
    }
  },

  // Get part numbers for a global quotation
  async getPartNumbers(globalQuotationId: string): Promise<ApiResponse<GlobalQuotationPartNumberWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_global_quotation_part_number')
        .select(`
          *,
          part_number:tb_part_number!tb_global_quotation_part_number_part_number_id_fkey (
            id,
            part_name,
            drawing_number
          ),
          quotation:tb_quotation!tb_global_quotation_part_number_quotation_id_fkey (
            id,
            version_number,
            status,
            unit_price,
            total_price,
            supplier_id
          ),
          supplier:tb_supplier!tb_quotation_supplier_id_fkey (
            id,
            name,
            comercial_name
          )
        `)
        .eq('global_quotation_id', globalQuotationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching part numbers for global quotation:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getPartNumbers:', err);
      return { data: null, error: 'Failed to fetch part numbers for global quotation' };
    }
  }
}; 