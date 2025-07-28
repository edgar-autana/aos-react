import { supabase } from "@/lib/supabase";
import { RMSupplier, RMSupplierPayload, RMSupplierFilters } from "@/types/rm-supplier/rmSupplier";

export const rmSupplierApi = {
  // Get all RM suppliers
  async getAll(): Promise<{ data: RMSupplier[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tb_rm_supplier')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Get RM supplier by ID
  async getById(id: string): Promise<{ data: RMSupplier | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tb_rm_supplier')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Search RM suppliers
  async search(searchTerm: string): Promise<{ data: RMSupplier[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tb_rm_supplier')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,comercial_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Create new RM supplier
  async create(supplier: RMSupplierPayload): Promise<{ data: RMSupplier | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tb_rm_supplier')
        .insert([supplier])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Update RM supplier
  async update(id: string, supplier: Partial<RMSupplierPayload>): Promise<{ data: RMSupplier | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tb_rm_supplier')
        .update(supplier)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Delete RM supplier
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tb_rm_supplier')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Get RM suppliers with filters
  async getWithFilters(filters: RMSupplierFilters): Promise<{ data: RMSupplier[] | null; error: string | null }> {
    try {
      let query = supabase.from('tb_rm_supplier').select('*');

      if (filters.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,comercial_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.material_type) {
        query = query.contains('material_types', [filters.material_type]);
      }

      if (filters.certification) {
        query = query.contains('certifications', [filters.certification]);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}; 