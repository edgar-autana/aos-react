import { useState, useEffect, useCallback } from 'react'
import { rfqApi } from '@/services/rfq/rfqApi'
import { RFQ, RFQWithCompany, RFQFilters } from '@/types/rfq/rfq'

export function useRfqs() {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRfqs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.getAll()
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfqs(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchRfqs = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = query 
        ? await rfqApi.search(query)
        : await rfqApi.getAll()
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfqs(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchWithFilters = useCallback(async (filters: RFQFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.searchWithFilters(filters)
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfqs(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRfqs()
  }, [fetchRfqs])

  return {
    rfqs,
    loading,
    error,
    refetch: fetchRfqs,
    searchRfqs,
    searchWithFilters
  }
}

export function useRfqsByCompany(companyId: string) {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRfqs = useCallback(async () => {
    if (!companyId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.getByCompanyId(companyId)
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfqs(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchRfqs()
  }, [fetchRfqs])

  return {
    rfqs,
    loading,
    error,
    refetch: fetchRfqs
  }
}

export function useRfqWithCompany(id: string) {
  const [rfq, setRfq] = useState<RFQWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRfq = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.getByIdWithCompany(id)
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfq(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRfq()
  }, [fetchRfq])

  return {
    rfq,
    loading,
    error,
    refetch: fetchRfq
  }
}

export function useRfqsByCompanyPaginated(companyId: string) {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const fetchRfqs = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    if (!companyId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.getByCompanyIdPaginated(companyId, page, size)
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setRfqs(response.data.data)
        setTotalItems(response.data.total)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [companyId, currentPage, pageSize])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    fetchRfqs(page, pageSize)
  }, [fetchRfqs, pageSize])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    fetchRfqs(1, size)
  }, [fetchRfqs])

  useEffect(() => {
    fetchRfqs()
  }, [fetchRfqs])

  return {
    rfqs,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    refetch: fetchRfqs,
    handlePageChange,
    handlePageSizeChange
  }
}

export function useRfqsWithCompany() {
  const [rfqs, setRfqs] = useState<RFQWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRfqs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfqApi.getAllWithCompany()
      
      if (response.error) {
        setError(response.error)
      } else {
        setRfqs(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRfqs()
  }, [fetchRfqs])

  return {
    rfqs,
    loading,
    error,
    refetch: fetchRfqs
  }
} 