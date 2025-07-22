import { supabase } from '@/lib/supabase';

interface MaterialAlloy {
  id: string;
  description: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export const materialAlloyApi = {
  async getAll(): Promise<ApiResponse<MaterialAlloy[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_material_alloy')
        .select('id, description')
        .order('description');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error fetching material alloys:', err);
      return { data: null, error: 'Failed to fetch material alloys' };
    }
  },

  async getById(id: string): Promise<ApiResponse<MaterialAlloy>> {
    try {
      const { data, error } = await supabase
        .from('tb_material_alloy')
        .select('id, description')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error fetching material alloy:', err);
      return { data: null, error: 'Failed to fetch material alloy' };
    }
  }
}; 