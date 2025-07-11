export interface PartNumber {
  id: string;
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
  part_drawing_2d: string | null; // 2D drawing file URL
  part_drawing_3d: string | null; // 3D drawing file URL
  reason_feasibility: string | null; // Reason for feasibility (when CAN NOT DO)
  cavities: number | null; // Number of cavities
  mold_life: number | null; // Mold life
  runner: string | null; // Runner type
  mold_steel_core: string | null; // Mold steel core type
}

export interface PartNumberPayload {
  slug?: number | null;
  company_atos?: string | null;
  company?: string | null;
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
  part_drawing_2d?: string | null; // 2D drawing file URL
  part_drawing_3d?: string | null; // 3D drawing file URL
  reason_feasibility?: string | null; // Reason for feasibility (when CAN NOT DO)
  cavities?: number | null; // Number of cavities
  mold_life?: number | null; // Mold life
  runner?: string | null; // Runner type
  mold_steel_core?: string | null; // Mold steel core type
}

export interface PartNumberFilters {
  id?: string;
  rfq?: string;
  company_atos?: string;
  company?: string;
  status?: string;
  supplier?: number;
  enabled?: boolean;
  priority?: boolean;
  search?: string;
} 