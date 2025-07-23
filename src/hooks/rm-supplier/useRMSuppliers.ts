import { useState, useEffect, useCallback } from 'react';
import { rmSupplierApi } from '@/services/rm-supplier/rmSupplierApi';
import { RMSupplier, RMSupplierPayload, RMSupplierFilters } from '@/types/rm-supplier/rmSupplier';

export const useRMSuppliers = () => {
  const [suppliers, setSuppliers] = useState<RMSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await rmSupplierApi.getAll();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuppliers(response.data || []);
      }
    } catch (err) {
      setError('Failed to load RM suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSuppliers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return fetchSuppliers();
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await rmSupplierApi.search(searchTerm);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuppliers(response.data || []);
      }
    } catch (err) {
      setError('Failed to search RM suppliers');
    } finally {
      setLoading(false);
    }
  }, [fetchSuppliers]);

  const createSupplier = useCallback(async (supplier: RMSupplierPayload) => {
    try {
      const response = await rmSupplierApi.create(supplier);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setSuppliers(prev => [...prev, response.data!]);
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, supplier: Partial<RMSupplierPayload>) => {
    try {
      const response = await rmSupplierApi.update(id, supplier);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setSuppliers(prev => prev.map(s => s.id === id ? response.data! : s));
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      const response = await rmSupplierApi.delete(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
      
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const getSuppliersWithFilters = useCallback(async (filters: RMSupplierFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await rmSupplierApi.getWithFilters(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuppliers(response.data || []);
      }
    } catch (err) {
      setError('Failed to load RM suppliers with filters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    searchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSuppliersWithFilters,
  };
}; 