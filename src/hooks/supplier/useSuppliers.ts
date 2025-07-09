import { useState, useCallback, useEffect } from 'react';
import { Supplier } from '@/types/supplier/supplier';
import { supplierApi } from '@/services/supplier/supplierApi';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    
    const response = await supplierApi.getAll();
    
    if (response.error) {
      setError(response.error);
    } else {
      const suppliersData = response.data || [];
      setSuppliers(suppliersData);
    }
    
    setLoading(false);
  };

  const searchSuppliers = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchSuppliers();
      return;
    }

    setLoading(true);
    setError(null);
    
    const response = await supplierApi.search(query);
    
    if (response.error) {
      setError(response.error);
    } else {
      const suppliersData = response.data || [];
      setSuppliers(suppliersData);
    }
    
    setLoading(false);
  }, []);

  const filterSuppliers = useCallback(async (filters: {
    enabled?: boolean;
    size?: string;
    type?: string;
    state?: string;
    iso_9001_2015?: boolean;
    iatf?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    const response = await supplierApi.filter(filters);
    
    if (response.error) {
      setError(response.error);
    } else {
      const suppliersData = response.data || [];
      setSuppliers(suppliersData);
    }
    
    setLoading(false);
  }, []);

  const getSupplierById = useCallback(async (id: string) => {
    const response = await supplierApi.getById(id);
    
    if (response.error) {
      setError(response.error);
      return null;
    }
    
    return response.data;
  }, []);

  const createSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const response = await supplierApi.create(supplier);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    if (response.data) {
      setSuppliers(prev => [response.data!, ...prev]);
    }
    
    return true;
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    const response = await supplierApi.update(id, updates);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    if (response.data) {
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? response.data! : supplier
      ));
    }
    
    return true;
  };

  const deleteSupplier = async (id: string) => {
    const response = await supplierApi.delete(id);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    return true;
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshSuppliers = useCallback(() => {
    fetchSuppliers();
  }, []);

  // Initial load
  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    searchSuppliers,
    filterSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError,
    refreshSuppliers
  };
}; 