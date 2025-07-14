// Contact interface matching the tb_contact table structure
export interface Contact {
  id: string;
  name: string;
  email: string;
  id_atos: string;
  created_at_atos: string; // ISO datetime string
  last_name: string;
  register_company_atos: string | null;
  source: string | null;
  lead_file: string | null;
  phone: string;
  enabled: boolean;
  tag: string | null;
  provider_atos: string | null;
  company_atos: string;
  position: string | null;
  other_position: string | null;
  image: string | null;
  hs_contact_id: string;
  hs_company_id: string;
  hs_owner_id: string;
  main_contact: boolean;
  invited: boolean;
  retool_user_id: string | null;
  linkedin: string | null;
  // New fields for company and supplier selection
  company: string | null;
  supplier: string | null;
}

// Contact payload for creating/updating contacts
export interface ContactPayload {
  name?: string;
  email?: string;
  id_atos?: string;
  created_at_atos?: string;
  last_name?: string;
  register_company_atos?: string | null;
  source?: string | null;
  lead_file?: string | null;
  phone?: string;
  enabled?: boolean;
  tag?: string | null;
  provider_atos?: string | null;
  company_atos?: string;
  position?: string | null;
  other_position?: string | null;
  image?: string | null;
  hs_contact_id?: string;
  hs_company_id?: string;
  hs_owner_id?: string;
  main_contact?: boolean;
  invited?: boolean;
  retool_user_id?: string | null;
  linkedin?: string | null;
  // New fields for company and supplier selection
  company?: string | null;
  supplier?: string | null;
}

// Contact filters for search and pagination
export interface ContactFilters {
  company_atos?: string;
  enabled?: boolean;
  main_contact?: boolean;
  source?: string | null;
  tag?: string | null;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Contact;
  sortOrder?: 'asc' | 'desc';
} 