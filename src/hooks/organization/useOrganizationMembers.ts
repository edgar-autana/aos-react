/**
 * useOrganizationMembers Hook
 * Custom hook for managing organization membership
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  OrganizationMembership,
  OrganizationMembershipCreate,
  OrganizationRole
} from '../../types/organization/organization';
import { organizationApi } from '../../services/organization/organizationApi';

interface UseOrganizationMembersState {
  members: OrganizationMembership[];
  isLoading: boolean;
  error: string | null;
  isInviting: boolean;
}

export const useOrganizationMembers = (organizationId: string | null) => {
  const { isSignedIn } = useAuth();
  
  const [state, setState] = useState<UseOrganizationMembersState>({
    members: [],
    isLoading: false,
    error: null,
    isInviting: false,
  });

  // =====================================================
  // Data Fetching
  // =====================================================

  const fetchMembers = useCallback(async () => {
    if (!isSignedIn || !organizationId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await organizationApi.getOrganizationMembers(organizationId);
      if (response.success && response.membership) {
        // Note: Backend returns single membership, but we expect array
        // This might need adjustment based on actual backend response
        setState(prev => ({
          ...prev,
          members: Array.isArray(response.membership) 
            ? response.membership 
            : [response.membership]
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch members');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch members'
      }));
      console.error('Error fetching organization members:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn, organizationId]);

  // =====================================================
  // Member Operations
  // =====================================================

  const inviteMember = useCallback(async (
    email: string,
    role: OrganizationRole,
    permissions?: Record<string, any>
  ) => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      setState(prev => ({ ...prev, isInviting: true, error: null }));

      // Create membership data
      const membershipData: Omit<OrganizationMembershipCreate, 'organization_id'> = {
        user_id: email, // This will need to be converted to actual user ID
        role,
        permissions: permissions || getDefaultPermissions(role),
      };

      const response = await organizationApi.addOrganizationMember(
        organizationId,
        membershipData
      );

      if (response.success && response.membership) {
        // Add to local state
        setState(prev => ({
          ...prev,
          members: [...prev.members, response.membership!]
        }));

        return response.membership;
      } else {
        throw new Error(response.error || 'Failed to invite member');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite member';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isInviting: false }));
    }
  }, [organizationId]);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // TODO: Implement remove member API call when backend supports it
      // For now, just remove from local state
      setState(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== memberId)
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateMemberRole = useCallback(async (
    memberId: string,
    newRole: OrganizationRole
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // TODO: Implement update member role API call when backend supports it
      // For now, just update local state
      setState(prev => ({
        ...prev,
        members: prev.members.map(member =>
          member.id === memberId
            ? { ...member, role: newRole, permissions: getDefaultPermissions(newRole) }
            : member
        )
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // =====================================================
  // Utility Functions
  // =====================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getMemberByUserId = useCallback((userId: string) => {
    return state.members.find(member => member.user_id === userId);
  }, [state.members]);

  const getMembersByRole = useCallback((role: OrganizationRole) => {
    return state.members.filter(member => member.role === role);
  }, [state.members]);

  // =====================================================
  // Effects
  // =====================================================

  // Fetch members when organization changes
  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    } else {
      setState(prev => ({ ...prev, members: [] }));
    }
  }, [organizationId, fetchMembers]);

  // =====================================================
  // Return Hook Interface
  // =====================================================

  return {
    // State
    members: state.members,
    isLoading: state.isLoading,
    error: state.error,
    isInviting: state.isInviting,

    // Actions
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    clearError,

    // Utilities
    getMemberByUserId,
    getMembersByRole,

    // Computed
    memberCount: state.members.length,
    owners: getMembersByRole('owner'),
    admins: getMembersByRole('admin'),
    managers: getMembersByRole('manager'),
    regularMembers: getMembersByRole('member'),
    viewers: getMembersByRole('viewer'),
  };
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get default permissions for a role
 */
const getDefaultPermissions = (role: OrganizationRole): Record<string, any> => {
  const permissions = {
    organization: {},
    data: {}
  };

  switch (role) {
    case 'owner':
      permissions.organization = {
        manage_settings: true,
        manage_members: true,
        manage_billing: true,
        delete_organization: true
      };
      permissions.data = {
        view_all: true,
        create_all: true,
        update_all: true,
        delete_all: true
      };
      break;

    case 'admin':
      permissions.organization = {
        manage_settings: true,
        manage_members: true,
        manage_billing: false,
        delete_organization: false
      };
      permissions.data = {
        view_all: true,
        create_all: true,
        update_all: true,
        delete_all: true
      };
      break;

    case 'manager':
      permissions.organization = {
        manage_settings: false,
        manage_members: true,
        manage_billing: false,
        delete_organization: false
      };
      permissions.data = {
        view_all: true,
        create_all: true,
        update_all: true,
        delete_all: false
      };
      break;

    case 'member':
      permissions.organization = {
        manage_settings: false,
        manage_members: false,
        manage_billing: false,
        delete_organization: false
      };
      permissions.data = {
        view_all: true,
        create_all: true,
        update_all: true,
        delete_all: false
      };
      break;

    case 'viewer':
      permissions.organization = {
        manage_settings: false,
        manage_members: false,
        manage_billing: false,
        delete_organization: false
      };
      permissions.data = {
        view_all: true,
        create_all: false,
        update_all: false,
        delete_all: false
      };
      break;

    default:
      break;
  }

  return permissions;
};