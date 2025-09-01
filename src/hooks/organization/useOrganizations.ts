/**
 * useOrganizations Hook
 * Custom hook for managing organization state and operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  UserOrganizationContext,
  OrganizationUIState
} from '../../types/organization/organization';
import {
  organizationApi,
  setCurrentOrganizationId,
  getCurrentOrganizationId
} from '../../services/organization/organizationApi';

// Global flag to prevent multiple simultaneous calls
let isOrgGloballyLoading = false;

/**
 * Main hook for organization management
 */
export const useOrganizations = () => {
  const { isSignedIn, getToken } = useAuth();
  
  const [state, setState] = useState<OrganizationUIState>({
    selectedOrganization: null,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showMemberModal: false,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userContext, setUserContext] = useState<UserOrganizationContext | null>(null);
  
  // Local flags to prevent re-execution
  const hasLoadedInitialData = useRef(false);

  // =====================================================
  // Authentication Setup
  // =====================================================

  useEffect(() => {
    const setupAuth = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-token', token);
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      }
    };

    setupAuth();
  }, [isSignedIn, getToken]);

  // =====================================================
  // Data Fetching
  // =====================================================

  const fetchUserContext = useCallback(async (organizationId?: string) => {
    if (!isSignedIn || isOrgGloballyLoading) return;

    try {
      isOrgGloballyLoading = true;
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const context = await organizationApi.getUserContext(organizationId);
      setUserContext(context);
      setOrganizations(context.organizations);

      // Set current organization if not set and user has organizations
      if (!context.current_organization_id && context.organizations.length > 0) {
        setCurrentOrganizationId(context.organizations[0].id);
        setState(prev => ({
          ...prev,
          selectedOrganization: context.organizations[0]
        }));
      } else if (context.current_organization_id) {
        const currentOrg = context.organizations.find(
          org => org.id === context.current_organization_id
        );
        if (currentOrg) {
          setState(prev => ({ ...prev, selectedOrganization: currentOrg }));
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch user context'
      }));
      console.error('Error fetching user context:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      isOrgGloballyLoading = false;
    }
  }, [isSignedIn]);

  const refreshOrganizations = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await organizationApi.listOrganizations();
      if (response.success) {
        setOrganizations(response.organizations);
      } else {
        throw new Error(response.error || 'Failed to fetch organizations');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch organizations'
      }));
      console.error('Error fetching organizations:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn]);

  // =====================================================
  // Organization Operations
  // =====================================================

  const createOrganization = useCallback(async (orgData: OrganizationCreate) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await organizationApi.createOrganization(orgData);
      if (response.success && response.organization) {
        // Add to local state
        setOrganizations(prev => [...prev, response.organization!]);
        
        // Refresh context to get updated data
        await fetchUserContext();
        
        return response.organization;
      } else {
        throw new Error(response.error || 'Failed to create organization');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchUserContext]);

  const updateOrganization = useCallback(async (
    organizationId: string,
    orgData: OrganizationUpdate
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await organizationApi.updateOrganization(organizationId, orgData);
      if (response.success && response.organization) {
        // Update local state
        setOrganizations(prev =>
          prev.map(org => org.id === organizationId ? response.organization! : org)
        );

        // Update selected organization if it's the one being updated
        if (state.selectedOrganization?.id === organizationId) {
          setState(prev => ({
            ...prev,
            selectedOrganization: response.organization!
          }));
        }

        return response.organization;
      } else {
        throw new Error(response.error || 'Failed to update organization');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedOrganization]);

  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await organizationApi.switchOrganization(organizationId);
      if (response.success) {
        setCurrentOrganizationId(organizationId);
        setState(prev => ({
          ...prev,
          selectedOrganization: response.organization
        }));

        // Refresh context with new organization
        await fetchUserContext(organizationId);
      } else {
        throw new Error('Failed to switch organization');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchUserContext]);

  // =====================================================
  // UI State Management
  // =====================================================

  const showCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  }, []);

  const hideCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, showCreateModal: false }));
  }, []);

  const showMemberModal = useCallback(() => {
    setState(prev => ({ ...prev, showMemberModal: true }));
  }, []);

  const hideMemberModal = useCallback(() => {
    setState(prev => ({ ...prev, showMemberModal: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // =====================================================
  // Effects
  // =====================================================

  // Load initial data when user signs in (only once)
  useEffect(() => {
    if (isSignedIn && !hasLoadedInitialData.current && !isOrgGloballyLoading) {
      hasLoadedInitialData.current = true;
      const currentOrgId = getCurrentOrganizationId();
      fetchUserContext(currentOrgId || undefined);
    }
  }, [isSignedIn]); // Only depend on isSignedIn

  // =====================================================
  // Return Hook Interface
  // =====================================================

  return {
    // State
    organizations,
    selectedOrganization: state.selectedOrganization,
    userContext,
    isLoading: state.isLoading,
    error: state.error,
    showCreateModal: state.showCreateModal,
    showMemberModal: state.showMemberModal,

    // Actions
    createOrganization,
    updateOrganization,
    switchOrganization,
    refreshOrganizations,
    fetchUserContext,

    // UI Actions
    showCreateModal,
    hideCreateModal,
    showMemberModal,
    hideMemberModal,
    clearError,

    // Computed
    isAuthenticated: isSignedIn,
    isSuperAdmin: userContext?.is_super_admin || false,
    currentPermissions: userContext?.permissions || {},
    hasOrganizations: organizations.length > 0,
  };
};