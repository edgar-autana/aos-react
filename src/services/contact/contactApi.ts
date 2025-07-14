import { supabase } from '@/lib/supabase';
import { Contact, ContactPayload, ContactFilters } from '@/types/contact/contact';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

export const contactApi = {
  // Get all contacts
  async getAll(): Promise<ApiResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .select('*')
        .order('created_at_atos', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data: data || [], error: null, loading: false };
    } catch (err) {
      console.error('Exception in getAll:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Get contact by ID
  async getById(id: string): Promise<ApiResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contact by ID:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err) {
      console.error('Exception in getById:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Get contacts by company ID
  async getByCompanyId(companyId: string): Promise<ApiResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .select('*')
        .eq('company_atos', companyId)
        .order('created_at_atos', { ascending: false });

      if (error) {
        console.error('Error fetching contacts by company:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data: data || [], error: null, loading: false };
    } catch (err) {
      console.error('Exception in getByCompanyId:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Search contacts
  async search(query: string): Promise<ApiResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .select('*')
        .or(`name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at_atos', { ascending: false });

      if (error) {
        console.error('Error searching contacts:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data: data || [], error: null, loading: false };
    } catch (err) {
      console.error('Exception in search:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Get contacts with pagination
  async getWithPagination(
    page: number = 1,
    pageSize: number = 10,
    filters?: ContactFilters
  ): Promise<PaginatedResponse<Contact>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('tb_contact')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.company_atos) {
        query = query.eq('company_atos', filters.company_atos);
      }
      if (filters?.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }
      if (filters?.main_contact !== undefined) {
        query = query.eq('main_contact', filters.main_contact);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.tag) {
        query = query.eq('tag', filters.tag);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at_atos';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Error fetching paginated contacts:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0, error: null };
    } catch (err) {
      console.error('Exception in getWithPagination:', err);
      return { 
        data: [], 
        count: 0, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  },

  // Create new contact
  async create(contact: ContactPayload): Promise<ApiResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .insert([contact])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err) {
      console.error('Exception in create:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Update contact
  async update(id: string, contact: Partial<ContactPayload>): Promise<ApiResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('tb_contact')
        .update(contact)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data, error: null, loading: false };
    } catch (err) {
      console.error('Exception in update:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Delete contact
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tb_contact')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data: true, error: null, loading: false };
    } catch (err) {
      console.error('Exception in delete:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  },

  // Advanced search with filters
  async searchWithFilters(filters: ContactFilters): Promise<ApiResponse<Contact[]>> {
    try {
      let query = supabase
        .from('tb_contact')
        .select('*');

      // Apply filters
      if (filters.company_atos) {
        query = query.eq('company_atos', filters.company_atos);
      }
      if (filters.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }
      if (filters.main_contact !== undefined) {
        query = query.eq('main_contact', filters.main_contact);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.tag) {
        query = query.eq('tag', filters.tag);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at_atos';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching contacts with filters:', error);
        return { data: null, error: error.message, loading: false };
      }

      return { data: data || [], error: null, loading: false };
    } catch (err) {
      console.error('Exception in searchWithFilters:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Unknown error', 
        loading: false 
      };
    }
  }
}; 