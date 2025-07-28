import { useState, useEffect } from 'react';
import { globalQuotationApi } from '@/services/global-quotation/globalQuotationApi';
import { GlobalQuotation, GlobalQuotationPayload, GlobalQuotationFilters, GlobalQuotationWithDetails, QuoteSelection } from '@/types/global-quotation/globalQuotation';

// Hook for fetching global quotations by company
export const useGlobalQuotationsByCompany = (companyId: string) => {
  const [globalQuotations, setGlobalQuotations] = useState<GlobalQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await globalQuotationApi.getByCompanyId(companyId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setGlobalQuotations(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch global quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [companyId]);

  return { globalQuotations, loading, error, refetch };
};

// Hook for fetching global quotation with details
export const useGlobalQuotationWithDetails = (id: string) => {
  const [globalQuotation, setGlobalQuotation] = useState<GlobalQuotationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await globalQuotationApi.getByIdWithDetails(id);
      
      if (response.error) {
        setError(response.error);
      } else {
        setGlobalQuotation(response.data);
      }
    } catch (err) {
      setError('Failed to fetch global quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [id]);

  return { globalQuotation, loading, error, refetch };
};

// Hook for global quotation mutations
export const useGlobalQuotationMutations = () => {
  const [loading, setLoading] = useState(false);

  const createGlobalQuotation = async (payload: GlobalQuotationPayload): Promise<{ data: GlobalQuotation | null; error: string | null }> => {
    setLoading(true);
    try {
      const response = await globalQuotationApi.create(payload);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalQuotation = async (id: string, payload: Partial<GlobalQuotationPayload>): Promise<{ data: GlobalQuotation | null; error: string | null }> => {
    setLoading(true);
    try {
      const response = await globalQuotationApi.update(id, payload);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const deleteGlobalQuotation = async (id: string): Promise<{ data: boolean | null; error: string | null }> => {
    setLoading(true);
    try {
      const response = await globalQuotationApi.delete(id);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const addPartNumberToGlobalQuotation = async (globalQuotationId: string, partNumberId: string, quotationId: string): Promise<{ data: any | null; error: string | null }> => {
    setLoading(true);
    try {
      const response = await globalQuotationApi.addPartNumber(globalQuotationId, partNumberId, quotationId);
      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGlobalQuotation,
    updateGlobalQuotation,
    deleteGlobalQuotation,
    addPartNumberToGlobalQuotation,
    loading
  };
};

// Hook for managing quote selections
export const useQuoteSelection = () => {
  const [quoteSelection, setQuoteSelection] = useState<QuoteSelection>({});

  const selectQuote = (partNumberId: string, quotationId: string) => {
    setQuoteSelection(prev => ({
      ...prev,
      [partNumberId]: [...(prev[partNumberId] || []), quotationId]
    }));
  };

  const deselectQuote = (partNumberId: string, quotationId: string) => {
    setQuoteSelection(prev => ({
      ...prev,
      [partNumberId]: (prev[partNumberId] || []).filter(id => id !== quotationId)
    }));
  };

  const clearPartNumberSelection = (partNumberId: string) => {
    setQuoteSelection(prev => {
      const newSelection = { ...prev };
      delete newSelection[partNumberId];
      return newSelection;
    });
  };

  const clearAllSelections = () => {
    setQuoteSelection({});
  };

  const isQuoteSelected = (partNumberId: string, quotationId: string): boolean => {
    return (quoteSelection[partNumberId] || []).includes(quotationId);
  };

  const getSelectedQuotesForPartNumber = (partNumberId: string): string[] => {
    return quoteSelection[partNumberId] || [];
  };

  const getTotalSelectedQuotes = (): number => {
    return Object.values(quoteSelection).reduce((total, quotes) => total + quotes.length, 0);
  };

  const hasAnySelections = (): boolean => {
    return Object.keys(quoteSelection).length > 0;
  };

  return {
    quoteSelection,
    selectQuote,
    deselectQuote,
    clearPartNumberSelection,
    clearAllSelections,
    isQuoteSelected,
    getSelectedQuotesForPartNumber,
    getTotalSelectedQuotes,
    hasAnySelections
  };
}; 