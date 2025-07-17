// Quotation interface matching the tb_quotation table structure
export interface Quotation {
  id: string;
  parent_id: string | null;
  part_number_id: string;
  supplier_id: string;
  version_number: number;
  status: 'draft' | 'completed' | 'sent' | 'responded' | 'accepted' | 'rejected' | 'expired';
  unit_price: number | null;
  total_price: number | null;
  quantity: number | null;
  lead_time_days: number | null;
  validity_days: number | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  sent_at: string | null;
  responded_at: string | null;
  expires_at: string | null;
  response_document_url: string | null;
  internal_notes: string | null;
}

// Quotation payload for creating/updating quotations
export interface QuotationPayload {
  parent_id?: string | null;
  part_number_id?: string;
  supplier_id?: string;
  status?: 'draft' | 'completed' | 'sent' | 'responded' | 'accepted' | 'rejected' | 'expired';
  unit_price?: number | null;
  total_price?: number | null;
  quantity?: number | null;
  lead_time_days?: number | null;
  validity_days?: number | null;
  notes?: string | null;
  created_by?: string | null;
  sent_at?: string | null;
  responded_at?: string | null;
  expires_at?: string | null;
  response_document_url?: string | null;
  internal_notes?: string | null;
}

// Quotation with related data
export interface QuotationWithDetails extends Quotation {
  supplier?: {
    id: string;
    name: string;
    comercial_name?: string;
    image?: string;
  };
  part_number?: {
    id: string;
    part_name: string;
    drawing_number: string;
  };
  versions?: Quotation[];
}

// Quotation filters
export interface QuotationFilters {
  part_number_id?: string;
  supplier_id?: string;
  status?: string;
  parent_id?: string | null;
  search?: string;
}

// Quotation form data
export interface QuotationFormData {
  supplier_id: string;
  unit_price: number | null;
  total_price: number | null;
  quantity: number | null;
  lead_time_days: number | null;
  validity_days: number | null;
  notes: string | null;
  internal_notes: string | null;
  status: 'draft' | 'completed';
} 