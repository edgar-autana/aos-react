/**
 * useOrganizationsTemp Hook
 * Temporary implementation with mock data to bypass RLS issues
 * This allows us to see the sidebar while we fix the backend integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  UserOrganizationContext,
  OrganizationUIState
} from '../../types/organization/organization';

/**
 * Temporary hook with mock organization data
 */
export const useOrganizationsTemp = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  const [state, setState] = useState<OrganizationUIState>({
    selectedOrganization: null,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showMemberModal: false,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userContext, setUserContext] = useState<UserOrganizationContext | null>(null);

  // Create mock organization data when user is signed in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      
      // Mock organization data
      const mockOrganization: Organization = {
        id: '0eb926d4-be1d-4263-a315-7389a3781b2a', // Use the real org ID
        name: 'Mi Empresa',
        slug: 'mi-empresa',
        plan_type: 'premium',
        status: 'active',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock user context with full permissions
      const mockUserContext: UserOrganizationContext = {
        user_id: user.id,
        is_super_admin: false,
        current_organization_id: mockOrganization.id,
        organizations: [mockOrganization],
        permissions: {
          organization: {
            manage_settings: true,
            manage_members: true,
            manage_billing: true,
            delete_organization: true
          },
          data: {
            view_all: true,
            create_all: true,
            update_all: true,
            delete_all: true
          }
        }
      };

      setOrganizations([mockOrganization]);
      setUserContext(mockUserContext);
      setState(prev => ({
        ...prev,
        selectedOrganization: mockOrganization,
        isLoading: false,
        error: null
      }));


    } else {
      // Clear data when user signs out
      setOrganizations([]);
      setUserContext(null);
      setState(prev => ({ 
        ...prev, 
        selectedOrganization: null,
        isLoading: false,
        error: null 
      }));
    }
  }, [isSignedIn, user?.id]);

  // Mock functions (no-op for now)
  const createOrganization = useCallback(async (orgData: OrganizationCreate) => {
    throw new Error('Create organization not implemented in temp mode');
  }, []);

  const updateOrganization = useCallback(async (
    organizationId: string,
    orgData: OrganizationUpdate
  ) => {
    throw new Error('Update organization not implemented in temp mode');
  }, []);

  const switchOrganization = useCallback(async (organizationId: string) => {
    // Just log for now
  }, []);

  const refreshOrganizations = useCallback(async () => {
    // Just log for now
  }, []);

  // UI State Management
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
    fetchUserContext: refreshOrganizations, // Alias for compatibility

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