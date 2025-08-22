// Global quotation interface matching the tb_global_quotation table structure
export interface GlobalQuotation {
  id: string;
  company_id: string;
  rfq?: string | null; // New field for RFQ relationship
  name: string;
  description: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  total_value: number | null;
  pdf_url: string | null; // PDF URL field for generated quotation PDFs
  created_at: string;
  created_by: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  internal_notes: string | null;
}

// Global quotation payload for creating/updating
export interface GlobalQuotationPayload {
  company_id?: string;
  rfq?: string | null; // New field for RFQ relationship
  name?: string;
  description?: string | null;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  total_value?: number | null;
  pdf_url?: string | null; // PDF URL field for generated quotation PDFs
  created_by?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
}

// Global quotation part number join table interface
export interface GlobalQuotationPartNumber {
  id: string;
  global_quotation_id: string;
  part_number_id: string;
  quotation_id: string;
  created_at: string;
}

// Global quotation with related data
export interface GlobalQuotationWithDetails extends GlobalQuotation {
  part_numbers?: GlobalQuotationPartNumberWithDetails[];
  company?: {
    id: string;
    name: string;
    image?: string;
  };
  rfq_info?: {
    id: string;
    name: string;
    slug_name?: string;
  };
}

// Global quotation part number with details
export interface GlobalQuotationPartNumberWithDetails extends GlobalQuotationPartNumber {
  part_number?: {
    id: string;
    part_name: string;
    drawing_number: string;
    estimated_anual_units?: number;
  };
  quotation?: {
    id: string;
    version_number: number;
    status: string;
    unit_price: number | null;
    total_price: number | null;
    supplier_id: string;
  };
  supplier?: {
    id: string;
    name: string;
    comercial_name?: string;
  };
}

// Global quotation filters
export interface GlobalQuotationFilters {
  company_id?: string;
  status?: string;
  search?: string;
}

// Quote selection state for part numbers
export interface QuoteSelection {
  [partNumberId: string]: string[]; // partNumberId -> selected quotation IDs
} 