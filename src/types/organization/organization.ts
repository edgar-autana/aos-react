/**
 * TypeScript types for SAAS Multi-Tenant Organizations
 * These types mirror the backend Pydantic models
 */

export interface OrganizationBase {
  name: string;
  slug: string;
  plan_type: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationCreate extends OrganizationBase {}

export interface OrganizationUpdate {
  name?: string;
  plan_type?: 'free' | 'premium' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled' | 'pending';
  settings?: Record<string, any>;
}

export interface Organization extends OrganizationBase {
  id: string;
  member_count?: number;
  is_current_user_member?: boolean;
}

// Organization Membership Types
export interface OrganizationMembershipBase {
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationMembershipCreate extends OrganizationMembershipBase {}

export interface OrganizationMembershipUpdate {
  role?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions?: Record<string, any>;
}

export interface OrganizationMembership extends OrganizationMembershipBase {
  id: string;
  joined_at?: string;
  user_email?: string;
  user_name?: string;
}

// Super Admin Types
export interface SuperAdminUserBase {
  user_id: string;
  permissions?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SuperAdminUserCreate extends SuperAdminUserBase {}

export interface SuperAdminUser extends SuperAdminUserBase {
  id: string;
  last_login?: string;
  user_email?: string;
  user_name?: string;
}

// User Context Types
export interface UserOrganizationContext {
  user_id: string;
  is_super_admin: boolean;
  current_organization_id?: string;
  organizations: Organization[];
  permissions: Record<string, any>;
}

// API Response Types
export interface OrganizationResponse {
  success: boolean;
  organization?: Organization;
  error?: string;
}

export interface OrganizationListResponse {
  success: boolean;
  organizations: Organization[];
  total_count: number;
  has_more: boolean;
  error?: string;
}

export interface OrganizationMembershipResponse {
  success: boolean;
  membership?: OrganizationMembership;
  error?: string;
}

export interface SuperAdminResponse {
  success: boolean;
  super_admin?: SuperAdminUser;
  error?: string;
}

// Organization Switch Response
export interface OrganizationSwitchResponse {
  success: boolean;
  organization: Organization;
  message: string;
}

// Permission Helper Types
export interface OrganizationPermissions {
  organization: {
    manage_settings?: boolean;
    manage_members?: boolean;
    manage_billing?: boolean;
    delete_organization?: boolean;
  };
  data: {
    view_all?: boolean;
    create_all?: boolean;
    update_all?: boolean;
    delete_all?: boolean;
  };
}

// Role Helper Types
export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
export type PlanType = 'free' | 'premium' | 'enterprise';
export type OrganizationStatus = 'active' | 'suspended' | 'cancelled' | 'pending';

// UI State Types
export interface OrganizationUIState {
  selectedOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showMemberModal: boolean;
}

// Form Types
export interface CreateOrganizationForm {
  name: string;
  slug: string;
  plan_type: PlanType;
}

export interface InviteMemberForm {
  email: string;
  role: OrganizationRole;
  permissions?: Partial<OrganizationPermissions>;
}