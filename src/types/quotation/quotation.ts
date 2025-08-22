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
  moq1: number | null;
  moq_margin_1: number | null;
  material_alloy: string | null;
  cost_of_plate: number | null;
  cavities: number | null;
  rm_cnc_scrap: number | null;
  rm_cnc_margin: number | null;
  rm_cnc_piece_price: number | null;
  piece_weight_rm_cnc_percentage: number | null;
  cnc_machine: string | null;
  machine_cost_per_hour: number | null;
  cycle_time_sec: number | null;
  piece_price_cnc_no_scrap: number | null;
  piece_price_cnc_scrap: number | null;
  piece_weight_cnc_percentage: number | null;
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
  cnc_fixtures: number | null;
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
  moq1?: number | null;
  moq_margin_1?: number | null;
  material_alloy?: string | null;
  cost_of_plate?: number | null;
  cavities?: number | null;
  rm_cnc_scrap?: number | null;
  rm_cnc_margin?: number | null;
  rm_cnc_piece_price?: number | null;
  piece_weight_rm_cnc_percentage?: number | null;
  cnc_machine?: string | null;
  machine_cost_per_hour?: number | null;
  cycle_time_sec?: number | null;
  piece_price_cnc_no_scrap?: number | null;
  piece_price_cnc_scrap?: number | null;
  piece_weight_cnc_percentage?: number | null;
  lead_time_days?: number | null;
  validity_days?: number | null;
  notes?: string | null;
  created_by?: string | null;
  sent_at?: string | null;
  responded_at?: string | null;
  expires_at?: string | null;
  response_document_url?: string | null;
  internal_notes?: string | null;
  cnc_fixtures?: number | null;
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
    cavities?: number | null;
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
  moq1: number | null;
  moq_margin_1: number | null;
  material_alloy: string | null;
  cost_of_plate: number | null;
  cavities: number | null;
  rm_cnc_scrap: number | null;
  rm_cnc_margin: number | null;
  rm_cnc_piece_price: number | null;
  piece_weight_rm_cnc_percentage: number | null;
  cnc_machine: string | null;
  machine_cost_per_hour: number | null;
  cycle_time_sec: number | null;
  piece_price_cnc_no_scrap: number | null;
  piece_price_cnc_scrap: number | null;
  piece_weight_cnc_percentage: number | null;
  lead_time_days: number | null;
  validity_days: number | null;
  notes: string | null;
  internal_notes: string | null;
  cnc_fixtures: number | null;
  status: 'draft' | 'completed';
} 