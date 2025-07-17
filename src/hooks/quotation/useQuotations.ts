import { useState, useEffect } from 'react';
import { quotationApi } from '@/services/quotation/quotationApi';
import { 
  Quotation, 
  QuotationWithDetails, 
  QuotationFilters, 
  QuotationPayload 
} from '@/types/quotation/quotation';

// Hook for quotations by part number ID
export function useQuotationsByPartNumber(partNumberId: string) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    if (!partNumberId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.getByPartNumberId(partNumberId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setQuotations(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [partNumberId]);

  return {
    quotations,
    loading,
    error,
    refetch: fetchQuotations
  };
}

// Hook for quotations with details (includes supplier, part number info)
export function useQuotationsWithDetails(partNumberId: string) {
  const [quotations, setQuotations] = useState<QuotationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    if (!partNumberId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.getByPartNumberIdWithDetails(partNumberId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setQuotations(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch quotations with details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [partNumberId]);

  return {
    quotations,
    loading,
    error,
    refetch: fetchQuotations
  };
}

// Hook for a single quotation
export function useQuotation(id: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.getById(id);
      
      if (response.error) {
        setError(response.error);
      } else {
        setQuotation(response.data);
      }
    } catch (err) {
      setError('Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  return {
    quotation,
    loading,
    error,
    refetch: fetchQuotation
  };
}

// Hook for quotation versions
export function useQuotationVersions(rootId: string) {
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    if (!rootId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.getQuoteVersions(rootId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setVersions(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch quotation versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [rootId]);

  return {
    versions,
    loading,
    error,
    refetch: fetchVersions
  };
}

// Hook for quotation statistics
export function useQuotationStats(partNumberId: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!partNumberId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.getStatsByPartNumber(partNumberId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response.data);
      }
    } catch (err) {
      setError('Failed to fetch quotation statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [partNumberId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Hook for quotation mutations (create, update, delete)
export function useQuotationMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuotation = async (quotation: QuotationPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.create(quotation);
      
      if (response.error) {
        setError(response.error);
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = 'Failed to create quotation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async (parentId: string, quotation: QuotationPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.createVersion(parentId, quotation);
      
      if (response.error) {
        setError(response.error);
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = 'Failed to create quotation version';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateQuotation = async (id: string, quotation: Partial<QuotationPayload>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.update(id, quotation);
      
      if (response.error) {
        setError(response.error);
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = 'Failed to update quotation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.updateStatus(id, status);
      
      if (response.error) {
        setError(response.error);
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = 'Failed to update quotation status';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteQuotation = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotationApi.delete(id);
      
      if (response.error) {
        setError(response.error);
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = 'Failed to delete quotation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createQuotation,
    createVersion,
    updateQuotation,
    updateStatus,
    deleteQuotation,
    loading,
    error
  };
} 