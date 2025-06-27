import { useState, useEffect, useCallback } from 'react'
import { companyApi } from '@/services/company/companyApi'
import { Company } from '@/lib/supabase'

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    setLoading(true)
    setError(null)
    
    const response = await companyApi.getAll()
    
    if (response.error) {
      setError(response.error)
    } else {
      const companiesData = response.data || []
      setCompanies(companiesData)
    }
    
    setLoading(false)
  }

  const createCompany = async (company: Omit<Company, 'id' | 'created_at'>) => {
    const response = await companyApi.create(company)
    
    if (response.error) {
      setError(response.error)
      return false
    }
    
    if (response.data) {
      setCompanies(prev => [response.data!, ...prev])
    }
    
    return true
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    const response = await companyApi.update(id, updates)
    
    if (response.error) {
      setError(response.error)
      return false
    }
    
    if (response.data) {
      setCompanies(prev => prev.map(company => 
        company.id === id ? response.data! : company
      ))
    }
    
    return true
  }

  const deleteCompany = async (id: string) => {
    const response = await companyApi.delete(id)
    
    if (response.error) {
      setError(response.error)
      return false
    }
    
    setCompanies(prev => prev.filter(company => company.id !== id))
    return true
  }

  const searchCompanies = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchCompanies()
      return
    }

    setLoading(true)
    setError(null)
    
    const response = await companyApi.search(query)
    
    if (response.error) {
      setError(response.error)
    } else {
      const companiesData = response.data || []
      setCompanies(companiesData)
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [])

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    searchCompanies
  }
} 