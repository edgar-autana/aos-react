export interface RMSupplier {
  id: string;
  name: string;
  comercial_name?: string | null;
  link_web?: string | null;
  phone?: string | null;
  email?: string | null;
  full_address?: string | null;
  enabled: boolean;
  image?: string | null;
  created_at: string;
  updated_at: string;
  // RM Supplier specific fields
  material_types?: string[] | null; // Types of raw materials they supply
  certifications?: string[] | null; // Certifications they have
  notes?: string | null; // Additional notes
}

export interface RMSupplierPayload {
  name: string;
  comercial_name?: string | null;
  link_web?: string | null;
  phone?: string | null;
  email?: string | null;
  full_address?: string | null;
  enabled?: boolean;
  image?: string | null;
  material_types?: string[] | null;
  certifications?: string[] | null;
  notes?: string | null;
}

export interface RMSupplierFilters {
  enabled?: boolean;
  search?: string;
  material_type?: string;
  certification?: string;
  country?: string;
} 