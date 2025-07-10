// Database RFQ type (matches tb_rfq table)
export interface RFQ {
  id: string
  created_at: string
  id_atos: string | null
  slug: number | null
  company_atos: string | null
  name: string | null
  description: string | null
  assigned: string | null
  created_at_atos: string | null
  status: string | null
  enabled: boolean | null
  cancel_reason: string | null
  autana_cancel_reason: string | null
  autana_canceled_rfq: boolean | null
  supplier: string | null // UUID reference to tb_supplier
  contact_company_1: string | null
  contact_company_2: string | null
  contact_supplier_1: string | null
  contact_supplier_2: string | null
  due_date: string | null
  contact_assigned: string | null
  slug_name: string | null
  comment_other_doc: string | null
  quoted_on: string | null
  sent_on: string | null
  cancel_reason_text: string | null
  priority: boolean | null
  comment_dashboard: string | null
  quotation_alert: string | null
  hs_deal_id: number | null
  customer_status_global_quotation: string | null
  remove_inbox: boolean | null
  company: string | null // UUID reference to tb_company (for new system)
}

// RFQ with company information (for joined queries)
export interface RFQWithCompany extends RFQ {
  company_info: {
    id: string
    name: string
    image: string | null
    slug: string | null
  } | null
}

// RFQ create/update payload
export interface RFQPayload {
  id_atos?: string
  slug?: number
  company_atos?: string
  name?: string
  description?: string
  assigned?: string
  created_at_atos?: string
  status?: string
  enabled?: boolean
  cancel_reason?: string
  autana_cancel_reason?: string
  autana_canceled_rfq?: boolean
  supplier?: string // UUID reference to tb_supplier
  contact_company_1?: string
  contact_company_2?: string
  contact_supplier_1?: string
  contact_supplier_2?: string
  due_date?: string
  contact_assigned?: string
  slug_name?: string
  comment_other_doc?: string
  quoted_on?: string
  sent_on?: string
  cancel_reason_text?: string
  priority?: boolean
  comment_dashboard?: string
  quotation_alert?: string
  hs_deal_id?: number
  customer_status_global_quotation?: string
  remove_inbox?: boolean
  company?: string // UUID reference to tb_company (for new system)
}

// RFQ filters for search and pagination
export interface RFQFilters {
  company?: string
  company_atos?: string
  status?: string
  priority?: boolean
  assigned?: string
  enabled?: boolean
  supplier?: string // UUID reference to tb_supplier
  search?: string
  page?: number
  pageSize?: number
  sortBy?: keyof RFQ
  sortOrder?: 'asc' | 'desc'
} 