import { supabase } from '@/lib/supabase';
import { 
  Quotation, 
  QuotationPayload, 
  QuotationFilters, 
  QuotationWithDetails 
} from '@/types/quotation/quotation';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

export const quotationApi = {
  // Get all quotations with optional filters
  async getAll(filters?: QuotationFilters): Promise<ApiResponse<Quotation[]>> {
    try {
      let query = supabase
        .from('tb_quotation')
        .select('*');

      // Apply filters
      if (filters?.part_number_id) {
        query = query.eq('part_number_id', filters.part_number_id);
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.parent_id !== undefined) {
        if (filters.parent_id === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parent_id);
        }
      }
      if (filters?.search) {
        query = query.or(`notes.ilike.%${filters.search}%,internal_notes.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotations:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getAll:', err);
      return { data: null, error: 'Failed to fetch quotations' };
    }
  },

  // Get quotations by part number ID
  async getByPartNumberId(partNumberId: string): Promise<ApiResponse<Quotation[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .select('*')
        .eq('part_number_id', partNumberId)
        .order('version_number', { ascending: true });

      if (error) {
        console.error('Error fetching quotations by part number:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByPartNumberId:', err);
      return { data: null, error: 'Failed to fetch quotations' };
    }
  },

  // Get quotations with related data (supplier, part number info)
  async getByPartNumberIdWithDetails(partNumberId: string): Promise<ApiResponse<QuotationWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .select(`
          *,
          supplier:tb_supplier!tb_quotation_supplier_id_fkey (
            id,
            name,
            comercial_name,
            image
          ),
          part_number:tb_part_number!tb_quotation_part_number_id_fkey (
            id,
            part_name,
            drawing_number
          )
        `)
        .eq('part_number_id', partNumberId)
        .order('version_number', { ascending: true });

      if (error) {
        console.error('Error fetching quotations with details:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getByPartNumberIdWithDetails:', err);
      return { data: null, error: 'Failed to fetch quotations with details' };
    }
  },

  // Get all versions of a quotation (including parent)
  async getQuoteVersions(rootId: string): Promise<ApiResponse<Quotation[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .select('*')
        .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
        .order('version_number', { ascending: true });

      if (error) {
        console.error('Error fetching quote versions:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception in getQuoteVersions:', err);
      return { data: null, error: 'Failed to fetch quote versions' };
    }
  },

  // Get quotation by ID
  async getById(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching quotation by ID:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in getById:', err);
      return { data: null, error: 'Failed to fetch quotation' };
    }
  },

  // Create new quotation (root quote)
  async create(quotation: QuotationPayload): Promise<ApiResponse<Quotation>> {
    try {
      console.log('Creating quotation with payload:', quotation);
      
      const { data, error } = await supabase
        .from('tb_quotation')
        .insert([quotation])
        .select()
        .single();

      if (error) {
        console.error('Error creating quotation:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in create:', err);
      return { data: null, error: 'Failed to create quotation' };
    }
  },

  // Create new version of an existing quotation
  async createVersion(parentId: string, quotation: QuotationPayload): Promise<ApiResponse<Quotation>> {
    try {
      const quotationWithParent = {
        ...quotation,
        parent_id: parentId
      };

      console.log('Creating quotation version with payload:', quotationWithParent);
      
      const { data, error } = await supabase
        .from('tb_quotation')
        .insert([quotationWithParent])
        .select()
        .single();

      if (error) {
        console.error('Error creating quotation version:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in createVersion:', err);
      return { data: null, error: 'Failed to create quotation version' };
    }
  },

  // Update quotation
  async update(id: string, quotation: Partial<QuotationPayload>): Promise<ApiResponse<Quotation>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .update(quotation)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating quotation:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in update:', err);
      return { data: null, error: 'Failed to update quotation' };
    }
  },

  // Update quotation status
  async updateStatus(id: string, status: string): Promise<ApiResponse<Quotation>> {
    try {
      const updateData: any = { status };
      
      // Set timestamps based on status
      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (status === 'responded') {
        updateData.responded_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('tb_quotation')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating quotation status:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in updateStatus:', err);
      return { data: null, error: 'Failed to update quotation status' };
    }
  },

  // Delete quotation
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_quotation')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting quotation:', error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Exception in delete:', err);
      return { data: null, error: 'Failed to delete quotation' };
    }
  },

  // Get quotation statistics for a part number
  async getStatsByPartNumber(partNumberId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('tb_quotation')
        .select('status')
        .eq('part_number_id', partNumberId);

      if (error) {
        console.error('Error fetching quotation stats:', error);
        return { data: null, error: error.message };
      }

      const stats = {
        total: data.length,
        draft: data.filter(q => q.status === 'draft').length,
        completed: data.filter(q => q.status === 'completed').length,
        sent: data.filter(q => q.status === 'sent').length,
        responded: data.filter(q => q.status === 'responded').length,
        accepted: data.filter(q => q.status === 'accepted').length,
        rejected: data.filter(q => q.status === 'rejected').length,
      };

      return { data: stats, error: null };
    } catch (err) {
      console.error('Exception in getStatsByPartNumber:', err);
      return { data: null, error: 'Failed to fetch quotation stats' };
    }
  }
}; 