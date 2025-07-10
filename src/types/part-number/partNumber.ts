export interface PartNumber {
  id_atos: string;
  slug: number | null;
  company_atos: string | null;
  rfq: string | null; // UUID reference to tb_rfq
  name: string | null;
  part_name: string | null; // Part name field
  drawing_number: string | null; // Drawing number field
  main_process: string | null; // Main process field
  feasibility: string | null; // Feasibility field
  estimated_anual_units: number | null; // Estimated annual units
  piece_price: number | null; // Piece price field
  description: string | null;
  assigned: string | null;
  created_at_atos: string;
  status: string | null; // UUID reference to status table
  enabled: boolean;
  cancel_reason: string | null; // UUID reference
  autana_cancel_reason: string | null;
  autana_canceled_rfq: boolean;
  supplier: number | null;
  contact_company_1: string | null;
  contact_company_2: string | null;
  contact_supplier_1: string | null;
  contact_supplier_2: string | null;
  due_date: string | null;
  contact_assigned: string | null; // UUID reference
  slug_name: string | null;
  comment_other_doc: string | null;
  quoted_on: string | null;
  sent_on: string | null;
  cancel_reason_text: string | null;
  priority: boolean;
  comment_dashboard: string | null;
  quotation_alert: boolean;
  hs_deal_id: string | null;
  customer_status_global_quotation: string | null;
  remove_inbox: boolean;
}

export interface PartNumberPayload {
  slug?: number | null;
  company_atos?: string | null;
  rfq?: string | null;
  name?: string | null;
  part_name?: string | null;
  drawing_number?: string | null;
  main_process?: string | null;
  feasibility?: string | null;
  estimated_anual_units?: number | null;
  piece_price?: number | null;
  description?: string | null;
  assigned?: string | null;
  status?: string | null;
  enabled?: boolean;
  cancel_reason?: string | null;
  autana_cancel_reason?: string | null;
  autana_canceled_rfq?: boolean;
  supplier?: number | null;
  contact_company_1?: string | null;
  contact_company_2?: string | null;
  contact_supplier_1?: string | null;
  contact_supplier_2?: string | null;
  due_date?: string | null;
  contact_assigned?: string | null;
  slug_name?: string | null;
  comment_other_doc?: string | null;
  quoted_on?: string | null;
  sent_on?: string | null;
  cancel_reason_text?: string | null;
  priority?: boolean;
  comment_dashboard?: string | null;
  quotation_alert?: boolean;
  hs_deal_id?: string | null;
  customer_status_global_quotation?: string | null;
  remove_inbox?: boolean;
}

export interface PartNumberFilters {
  rfq?: string;
  company_atos?: string;
  status?: string;
  supplier?: number;
  enabled?: boolean;
  priority?: boolean;
  search?: string;
} 