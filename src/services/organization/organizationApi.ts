/**
 * Organization API Service
 * Handles all API calls related to SAAS organization management
 */

import { useAuth } from '@clerk/clerk-react';
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationResponse,
  OrganizationListResponse,
  OrganizationMembershipCreate,
  OrganizationMembershipResponse,
  UserOrganizationContext,
  OrganizationSwitchResponse
} from '../../types/organization/organization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
const API_V1_URL = `${API_BASE_URL}/api/v1`;

/**
 * Base API client with authentication
 */
class OrganizationApiClient {
  private getAuthHeaders = async (): Promise<HeadersInit> => {
    // Get token from Clerk
    let token = null;
    
    try {
      // Try to get token from Clerk if available
      if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      }
    } catch (e) {
      console.warn('Failed to get token from Clerk:', e);
    }
    
    // Fallback to localStorage (for development/testing)
    if (!token) {
      token = localStorage.getItem('clerk-token');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Include organization ID if set
    const currentOrgId = getCurrentOrganizationId();
    if (currentOrgId) {
      headers['X-Organization-ID'] = currentOrgId;
    }
    
    return headers;
  };

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // =====================================================
  // Organization Management
  // =====================================================

  /**
   * Create a new organization
   */
  async createOrganization(orgData: OrganizationCreate): Promise<OrganizationResponse> {
    return this.makeRequest<OrganizationResponse>(`${API_V1_URL}/organizations`, {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  /**
   * Get list of organizations for current user
   */
  async listOrganizations(limit = 50, offset = 0): Promise<OrganizationListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.makeRequest<OrganizationListResponse>(
      `${API_V1_URL}/organizations?${params}`
    );
  }

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<OrganizationResponse> {
    return this.makeRequest<OrganizationResponse>(
      `${API_V1_URL}/organizations/${organizationId}`
    );
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    orgData: OrganizationUpdate
  ): Promise<OrganizationResponse> {
    return this.makeRequest<OrganizationResponse>(
      `${API_V1_URL}/organizations/${organizationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(orgData),
      }
    );
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string): Promise<{ success: boolean; message?: string }> {
    return this.makeRequest(`${API_V1_URL}/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // Organization Membership Management
  // =====================================================

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMembershipResponse> {
    return this.makeRequest<OrganizationMembershipResponse>(
      `${API_V1_URL}/organizations/${organizationId}/members`
    );
  }

  /**
   * Add member to organization
   */
  async addOrganizationMember(
    organizationId: string,
    membershipData: Omit<OrganizationMembershipCreate, 'organization_id'>
  ): Promise<OrganizationMembershipResponse> {
    return this.makeRequest<OrganizationMembershipResponse>(
      `${API_V1_URL}/organizations/${organizationId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...membershipData,
          organization_id: organizationId,
        }),
      }
    );
  }

  // =====================================================
  // User Context Management
  // =====================================================

  /**
   * Get current user's organization context
   */
  async getUserContext(organizationId?: string): Promise<UserOrganizationContext> {
    const params = organizationId 
      ? `?organization_id=${organizationId}` 
      : '';

    return this.makeRequest<UserOrganizationContext>(
      `${API_V1_URL}/organizations/context/current${params}`
    );
  }

  /**
   * Switch current organization context
   */
  async switchOrganization(organizationId: string): Promise<OrganizationSwitchResponse> {
    return this.makeRequest<OrganizationSwitchResponse>(
      `${API_V1_URL}/organizations/context/switch`,
      {
        method: 'POST',
        body: JSON.stringify({ organization_id: organizationId }),
      }
    );
  }
}

/**
 * Super Admin API Client
 * For super admin operations
 */
class SuperAdminApiClient {
  private getAuthHeaders = async (): Promise<HeadersInit> => {
    // Get token from Clerk
    let token = null;
    
    try {
      // Try to get token from Clerk if available
      if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      }
    } catch (e) {
      console.warn('Failed to get token from Clerk:', e);
    }
    
    // Fallback to localStorage (for development/testing)
    if (!token) {
      token = localStorage.getItem('clerk-token');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Include organization ID if set
    const currentOrgId = getCurrentOrganizationId();
    if (currentOrgId) {
      headers['X-Organization-ID'] = currentOrgId;
    }
    
    return headers;
  };

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Super Admin API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get all organizations (super admin only)
   */
  async getAllOrganizations(
    limit = 100,
    offset = 0,
    filters: {
      status_filter?: string;
      plan_filter?: string;
      search?: string;
    } = {}
  ): Promise<OrganizationListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...filters,
    });

    return this.makeRequest<OrganizationListResponse>(
      `${API_V1_URL}/super-admin/organizations?${params}`
    );
  }

  /**
   * Update organization status (super admin only)
   */
  async updateOrganizationStatus(
    organizationId: string,
    newStatus: 'active' | 'suspended' | 'cancelled' | 'pending',
    reason?: string
  ): Promise<OrganizationResponse> {
    const params = new URLSearchParams({
      new_status: newStatus,
      ...(reason && { reason }),
    });

    return this.makeRequest<OrganizationResponse>(
      `${API_V1_URL}/super-admin/organizations/${organizationId}/status?${params}`,
      { method: 'PUT' }
    );
  }

  /**
   * Update organization plan (super admin only)
   */
  async updateOrganizationPlan(
    organizationId: string,
    newPlan: 'free' | 'premium' | 'enterprise'
  ): Promise<OrganizationResponse> {
    const params = new URLSearchParams({
      new_plan: newPlan,
    });

    return this.makeRequest<OrganizationResponse>(
      `${API_V1_URL}/super-admin/organizations/${organizationId}/plan?${params}`,
      { method: 'PUT' }
    );
  }

  /**
   * Get system health (super admin only)
   */
  async getSystemHealth(): Promise<{
    status: string;
    timestamp: string;
    components: Record<string, string>;
    metrics: Record<string, string>;
  }> {
    return this.makeRequest(`${API_V1_URL}/super-admin/system/health`);
  }
}

// Export singleton instances
export const organizationApi = new OrganizationApiClient();
export const superAdminApi = new SuperAdminApiClient();

// Helper function to set authentication token
export const setAuthToken = (token: string) => {
  localStorage.setItem('clerk-token', token);
};

// Helper function to clear authentication token
export const clearAuthToken = () => {
  localStorage.removeItem('clerk-token');
};

// Helper function to get current organization ID from context
export const getCurrentOrganizationId = (): string | null => {
  return localStorage.getItem('current-organization-id');
};

// Helper function to set current organization ID
export const setCurrentOrganizationId = (organizationId: string) => {
  localStorage.setItem('current-organization-id', organizationId);
};

// Helper function to clear current organization ID
export const clearCurrentOrganizationId = () => {
  localStorage.removeItem('current-organization-id');
};