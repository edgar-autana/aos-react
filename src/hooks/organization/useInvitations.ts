/**
 * Custom hook for organization invitation management
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  useOrganizationInvitationApi, 
  OrganizationInvitation, 
  OrganizationInvitationCreate, 
  OrganizationInvitationUpdate,
  AcceptInvitationRequest
} from '../../services/organization/invitationApi';

interface UseInvitationsOptions {
  organizationId?: string;
  autoLoad?: boolean;
}

interface UseInvitationsResult {
  // State
  invitations: OrganizationInvitation[];
  loading: boolean;
  error: string | null;
  totalCount: number;

  // Actions
  createInvitation: (invitationData: OrganizationInvitationCreate) => Promise<{ success: boolean; data?: OrganizationInvitation; error?: string }>;
  updateInvitation: (invitationId: string, data: OrganizationInvitationUpdate) => Promise<{ success: boolean; data?: OrganizationInvitation; error?: string }>;
  deleteInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  resendInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  loadInvitations: (options?: { limit?: number; offset?: number }) => Promise<void>;
  clearError: () => void;

  // Invitation acceptance (for public pages)
  getInvitationByToken: (token: string) => Promise<{ success: boolean; data?: OrganizationInvitation; error?: string }>;
  acceptInvitation: (request: AcceptInvitationRequest) => Promise<{ success: boolean; error?: string }>;
}

export const useInvitations = (options: UseInvitationsOptions = {}): UseInvitationsResult => {
  const { organizationId, autoLoad = false } = options;
  const { userId } = useAuth();
  const api = useOrganizationInvitationApi();

  // State
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load invitations for organization
  const loadInvitations = useCallback(async (loadOptions: { limit?: number; offset?: number } = {}) => {
    if (!organizationId) {
      setError('Organization ID is required to load invitations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.listOrganizationInvitations(
        organizationId,
        loadOptions
      );

      if (apiError) {
        setError(apiError);
        return;
      }

      if (data?.success) {
        setInvitations(data.invitations);
        setTotalCount(data.total_count);
      } else {
        setError(data?.message || 'Failed to load invitations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [organizationId, api]);

  // Create invitation
  const createInvitation = useCallback(async (invitationData: OrganizationInvitationCreate) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.createInvitation(invitationData);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success && data.invitation) {
        // Add new invitation to the list
        setInvitations(prev => [data.invitation!, ...prev]);
        setTotalCount(prev => prev + 1);
        
        return { 
          success: true, 
          data: data.invitation 
        };
      } else {
        const errorMsg = data?.message || 'Failed to create invitation';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Update invitation
  const updateInvitation = useCallback(async (invitationId: string, updateData: OrganizationInvitationUpdate) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.updateInvitation(invitationId, updateData);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success && data.invitation) {
        // Update invitation in the list
        setInvitations(prev => prev.map(inv => 
          inv.id === invitationId ? data.invitation! : inv
        ));
        
        return { 
          success: true, 
          data: data.invitation 
        };
      } else {
        const errorMsg = data?.message || 'Failed to update invitation';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Delete invitation
  const deleteInvitation = useCallback(async (invitationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.deleteInvitation(invitationId);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success) {
        // Remove invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        setTotalCount(prev => prev - 1);
        
        return { success: true };
      } else {
        const errorMsg = data?.message || 'Failed to delete invitation';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Resend invitation
  const resendInvitation = useCallback(async (invitationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.resendInvitation(invitationId);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success && data.invitation) {
        // Update invitation in the list with new expiration
        setInvitations(prev => prev.map(inv => 
          inv.id === invitationId ? data.invitation! : inv
        ));
        
        return { success: true };
      } else {
        const errorMsg = data?.message || 'Failed to resend invitation';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Get invitation by token (for public invitation pages)
  const getInvitationByToken = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.getInvitationByToken(token);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success && data.invitation) {
        return { 
          success: true, 
          data: data.invitation 
        };
      } else {
        const errorMsg = data?.message || 'Invitation not found or invalid';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Accept invitation
  const acceptInvitation = useCallback(async (request: AcceptInvitationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.acceptInvitation(request);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data?.success) {
        return { success: true };
      } else {
        const errorMsg = data?.message || 'Failed to accept invitation';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Auto-load invitations if organizationId provided and autoLoad is true
  React.useEffect(() => {
    if (organizationId && autoLoad) {
      loadInvitations();
    }
  }, [organizationId, autoLoad, loadInvitations]);

  return {
    // State
    invitations,
    loading,
    error,
    totalCount,

    // Actions
    createInvitation,
    updateInvitation,
    deleteInvitation,
    resendInvitation,
    loadInvitations,
    clearError,

    // Public invitation actions
    getInvitationByToken,
    acceptInvitation,
  };
};

export default useInvitations;