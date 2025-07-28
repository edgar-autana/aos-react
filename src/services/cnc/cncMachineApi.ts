import { supabase } from '@/lib/supabase';

interface CNCMachine {
  id: string;
  description: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export const cncMachineApi = {
  async getAll(): Promise<ApiResponse<CNCMachine[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_cnc_machine')
        .select('id, description')
        .order('description');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error fetching CNC machines:', err);
      return { data: null, error: 'Failed to fetch CNC machines' };
    }
  },

  async getById(id: string): Promise<ApiResponse<CNCMachine>> {
    try {
      const { data, error } = await supabase
        .from('tb_cnc_machine')
        .select('id, description')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error fetching CNC machine:', err);
      return { data: null, error: 'Failed to fetch CNC machine' };
    }
  }
}; 