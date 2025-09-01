/**
 * Organization Invitation API Service
 * Handles all API calls related to organization invitation management
 */

import { useAuth } from '@clerk/clerk-react';

// Types for invitation management
export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  invited_by?: string;
  token: string;
  expires_at?: string;
  accepted_at?: string;
  created_at: string;
}

export interface OrganizationInvitationCreate {
  organization_id: string;
  email: string;
  role: string;
}

export interface OrganizationInvitationUpdate {
  role?: string;
  expires_at?: string;
}

export interface OrganizationInvitationResponse {
  success: boolean;
  invitation?: OrganizationInvitation;
  message?: string;
}

export interface OrganizationInvitationListResponse {
  success: boolean;
  invitations: OrganizationInvitation[];
  total_count: number;
  message?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  user_id: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
const API_V1_URL = `${API_BASE_URL}/api/v1`;

/**
 * Organization Invitation API client with authentication
 */
class OrganizationInvitationApiClient {
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
    
    return headers;
  };

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_V1_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Create a new organization invitation
   */
  async createInvitation(
    invitationData: OrganizationInvitationCreate
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    return this.request<OrganizationInvitationResponse>(
      '/invitations',
      {
        method: 'POST',
        body: JSON.stringify(invitationData),
      }
    );
  }

  /**
   * Get invitation by ID
   */
  async getInvitation(
    invitationId: string
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    return this.request<OrganizationInvitationResponse>(
      `/invitations/${invitationId}`
    );
  }

  /**
   * Get invitation by token (public endpoint)
   */
  async getInvitationByToken(
    token: string
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    // This is a public endpoint, so we don't need auth headers
    try {
      const response = await fetch(`${API_V1_URL}/invitations/token/${token}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * List invitations for an organization
   */
  async listOrganizationInvitations(
    organizationId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ data?: OrganizationInvitationListResponse; error?: string }> {
    const { limit = 50, offset = 0 } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.request<OrganizationInvitationListResponse>(
      `/invitations/organization/${organizationId}?${queryParams}`
    );
  }

  /**
   * Update an invitation
   */
  async updateInvitation(
    invitationId: string,
    invitationData: OrganizationInvitationUpdate
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    return this.request<OrganizationInvitationResponse>(
      `/invitations/${invitationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(invitationData),
      }
    );
  }

  /**
   * Delete an invitation
   */
  async deleteInvitation(
    invitationId: string
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    return this.request<OrganizationInvitationResponse>(
      `/invitations/${invitationId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(
    request: AcceptInvitationRequest
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    return this.request<OrganizationInvitationResponse>(
      '/invitations/accept',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Resend invitation email
   * Note: This will require email service integration
   */
  async resendInvitation(
    invitationId: string
  ): Promise<{ data?: OrganizationInvitationResponse; error?: string }> {
    // For now, this just extends the expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
    
    return this.updateInvitation(invitationId, {
      expires_at: expirationDate.toISOString()
    });
  }
}

// Create singleton instance
const invitationApiClient = new OrganizationInvitationApiClient();

/**
 * Hook for organization invitation API operations
 */
export const useOrganizationInvitationApi = () => {
  const { getToken } = useAuth();

  // Update the client's token getter to use Clerk's getToken
  const updateTokenGetter = () => {
    invitationApiClient['getAuthHeaders'] = async (): Promise<HeadersInit> => {
      let token = null;
      
      try {
        token = await getToken();
      } catch (e) {
        console.warn('Failed to get token from Clerk:', e);
        // Fallback to localStorage
        token = localStorage.getItem('clerk-token');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return headers;
    };
  };

  // Update token getter when hook is used
  updateTokenGetter();

  return {
    createInvitation: invitationApiClient.createInvitation.bind(invitationApiClient),
    getInvitation: invitationApiClient.getInvitation.bind(invitationApiClient),
    getInvitationByToken: invitationApiClient.getInvitationByToken.bind(invitationApiClient),
    listOrganizationInvitations: invitationApiClient.listOrganizationInvitations.bind(invitationApiClient),
    updateInvitation: invitationApiClient.updateInvitation.bind(invitationApiClient),
    deleteInvitation: invitationApiClient.deleteInvitation.bind(invitationApiClient),
    acceptInvitation: invitationApiClient.acceptInvitation.bind(invitationApiClient),
    resendInvitation: invitationApiClient.resendInvitation.bind(invitationApiClient),
  };
};

export default invitationApiClient;