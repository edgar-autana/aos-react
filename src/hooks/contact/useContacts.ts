import { useState, useEffect, useCallback } from 'react';
import { contactApi } from '@/services/contact/contactApi';
import { Contact, ContactFilters, ContactPayload } from '@/types/contact/contact';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contactApi.getAll();
      
      if (response.error) {
        setError(response.error);
      } else {
        setContacts(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchContacts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = query 
        ? await contactApi.search(query)
        : await contactApi.getAll();
      
      if (response.error) {
        setError(response.error);
      } else {
        setContacts(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchWithFilters = useCallback(async (filters: ContactFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contactApi.searchWithFilters(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setContacts(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (contactData: ContactPayload) => {
    setError(null);
    
    try {
      const response = await contactApi.create(contactData);
      
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      } else if (response.data) {
        // Add the new contact to the existing contacts list
        setContacts(prev => [response.data!, ...prev]);
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    searchContacts,
    searchWithFilters,
    createContact
  };
}

export function useContactsByCompany(companyId: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await contactApi.getByCompanyId(companyId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setContacts(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts
  };
}

export function useContactsPaginated(
  initialPage: number = 1,
  initialPageSize: number = 10,
  filters?: ContactFilters
) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchContacts = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contactApi.getWithPagination(page, size, filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setContacts(response.data || []);
        setTotalItems(response.count || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchContacts(page, pageSize);
  }, [fetchContacts, pageSize]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchContacts(1, size);
  }, [fetchContacts]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    refetch: fetchContacts,
    handlePageChange,
    handlePageSizeChange
  };
}

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await contactApi.getById(id);
      
      if (response.error) {
        setError(response.error);
      } else {
        setContact(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    error,
    refetch: fetchContact
  };
} 