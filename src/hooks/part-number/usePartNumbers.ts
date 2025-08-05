import { useState, useEffect, useCallback } from 'react';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { PartNumber, PartNumberFilters } from '@/types/part-number/partNumber';

// Hook for managing part numbers
export function usePartNumbers(filters?: PartNumberFilters) {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartNumbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await partNumberApi.getAll(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPartNumbers(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch part numbers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPartNumbers();
  }, [filters]);

  return {
    partNumbers,
    loading,
    error,
    refetch: fetchPartNumbers
  };
}

// Hook for part numbers by RFQ ID
export function usePartNumbersByRfq(rfqId: string) {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartNumbers = useCallback(async () => {
    if (!rfqId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await partNumberApi.getByRfqId(rfqId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPartNumbers(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch part numbers');
    } finally {
      setLoading(false);
    }
  }, [rfqId]);

  useEffect(() => {
    fetchPartNumbers();
  }, [rfqId]);

  return {
    partNumbers,
    loading,
    error,
    refetch: fetchPartNumbers
  };
}

// Hook for part numbers by RFQ ID with pagination
export function usePartNumbersByRfqPaginated(
  rfqId: string,
  initialPage: number = 1,
  initialPageSize: number = 10,
  filters?: PartNumberFilters
) {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPartNumbers = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    if (!rfqId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await partNumberApi.getByRfqIdPaginated(rfqId, page, size, filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPartNumbers(response.data || []);
        setTotalItems(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / size));
      }
    } catch (err) {
      setError('Failed to fetch part numbers');
    } finally {
      setLoading(false);
    }
  }, [rfqId, currentPage, pageSize, filters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchPartNumbers(page, pageSize);
  }, [fetchPartNumbers, pageSize]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchPartNumbers(1, size);
  }, [fetchPartNumbers]);

  useEffect(() => {
    fetchPartNumbers();
  }, [rfqId, filters]);

  return {
    partNumbers,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    refetch: fetchPartNumbers
  };
}

// Hook for part numbers by company ID
export function usePartNumbersByCompany(companyId: string) {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartNumbers = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await partNumberApi.getByCompanyId(companyId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPartNumbers(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch part numbers');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPartNumbers();
  }, [companyId]);

  return {
    partNumbers,
    loading,
    error,
    refetch: fetchPartNumbers
  };
}

// Hook for a single part number
export function usePartNumber(id: string) {
  const [partNumber, setPartNumber] = useState<PartNumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartNumber = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await partNumberApi.getById(id);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPartNumber(response.data);
      }
    } catch (err) {
      setError('Failed to fetch part number');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPartNumber();
  }, [id]);

  return {
    partNumber,
    loading,
    error,
    refetch: fetchPartNumber
  };
} 