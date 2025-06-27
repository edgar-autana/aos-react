import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not configured. Please set it in your .env file.')
  throw new Error('VITE_SUPABASE_ANON_KEY is not configured. Please set it in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Company type (matches tb_company table)
export interface Company {
  id: string
  created_at: string
  id_atos: string
  name: string
  description: string
  created_at_atos: string
  url: string
  phone: string
  presentation: string
  status: string
  enabled: boolean
  slug: string
  address: string
  image: string
  nda_signed: string
  hs_company_id: string
}

// Transaction type
export interface Transaction {
  id: string
  orderNumber: string
  projectName: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled' | 'processing'
  date: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
} 