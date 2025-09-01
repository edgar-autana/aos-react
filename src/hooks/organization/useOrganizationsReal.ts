/**
 * useOrganizationsReal Hook
 * Real Supabase integration without RLS complexity
 * Direct queries with organization_id filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  UserOrganizationContext,
  OrganizationUIState
} from '../../types/organization/organization';

interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  permissions: any;
  joined_at: string;
  organization?: Organization;
}

/**
 * Real hook for organization management using direct Supabase queries (no RLS)
 */
export const useOrganizationsReal = () => {
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

  // =====================================================
  // Core Data Fetching
  // =====================================================

  const fetchUserOrganizations = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Query user's organization memberships with organization data and member count
      const { data: memberships, error: membershipError } = await supabase
        .from('saas_organization_memberships')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          permissions,
          joined_at,
          organization:saas_organizations(
            id,
            name,
            slug,
            plan_type,
            status,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      // For each organization found, get the member count
      if (memberships && memberships.length > 0) {
        for (let membership of memberships) {
          if (membership.organization) {
            const { count, error: countError } = await supabase
              .from('saas_organization_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', membership.organization.id);
              
            if (!countError && count !== null) {
              // Add member_count to the organization object
              (membership.organization as any).member_count = count;
            }
          }
        }
      }

      if (membershipError) {
        throw new Error(`Membership query failed: ${membershipError.message}`);
      }

      // Extract organizations from memberships
      const userOrganizations: Organization[] = [];
      let userPermissions = {};
      let currentOrgId = null;

      if (memberships && memberships.length > 0) {
        memberships.forEach((membership: OrganizationMembership) => {
          if (membership.organization) {
            userOrganizations.push(membership.organization);
            
            // Use permissions from the first membership (can be enhanced later)
            if (!currentOrgId) {
              currentOrgId = membership.organization_id;
              userPermissions = membership.permissions || {};
            }
          }
        });
      }

      // Check if user is super admin (simple query without RLS)
      let isSuperAdmin = false;
      try {
        const { data: superAdminData } = await supabase
          .from('saas_super_admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if no record found
        
        isSuperAdmin = !!superAdminData;
      } catch (error) {
        isSuperAdmin = false;
      }

      // Build user context
      const context: UserOrganizationContext = {
        user_id: user.id,
        is_super_admin: isSuperAdmin,
        current_organization_id: currentOrgId,
        organizations: userOrganizations,
        permissions: userPermissions
      };

      setOrganizations(userOrganizations);
      setUserContext(context);

      // Set selected organization (first one for now)
      if (userOrganizations.length > 0) {
        setState(prev => ({
          ...prev,
          selectedOrganization: userOrganizations[0]
        }));
      } else {
        setState(prev => ({
          ...prev,
          selectedOrganization: null
        }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizations';
      setState(prev => ({ ...prev, error: errorMessage }));
      setOrganizations([]);
      setUserContext(null);
      setState(prev => ({ 
        ...prev, 
        selectedOrganization: null
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn, user?.id]);

  // =====================================================
  // Organization Operations
  // =====================================================

  const createOrganization = useCallback(async (orgData: OrganizationCreate) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('saas_organizations')
        .insert({
          name: orgData.name,
          slug: orgData.slug || orgData.name.toLowerCase().replace(/\s+/g, '-'),
          plan_type: orgData.plan_type || 'free',
          status: 'active',
          settings: {}
        })
        .select()
        .single();

      if (orgError) {
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      // Create membership for the creator as owner
      const { error: membershipError } = await supabase
        .from('saas_organization_memberships')
        .insert({
          organization_id: newOrg.id,
          user_id: user.id,
          role: 'owner',
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
        });

      if (membershipError) {
        throw new Error(`Failed to create membership: ${membershipError.message}`);
      }

      // Refresh organizations
      await fetchUserOrganizations();

      return newOrg;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id, fetchUserOrganizations]);

  const updateOrganization = useCallback(async (
    organizationId: string,
    orgData: OrganizationUpdate
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: updatedOrg, error } = await supabase
        .from('saas_organizations')
        .update({
          name: orgData.name,
          slug: orgData.slug,
          plan_type: orgData.plan_type,
          status: orgData.status,
          settings: orgData.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update organization: ${error.message}`);
      }

      // Update local state
      setOrganizations(prev =>
        prev.map(org => org.id === organizationId ? updatedOrg : org)
      );

      // Update selected organization if it's the one being updated
      setState(prev => ({
        ...prev,
        selectedOrganization: prev.selectedOrganization?.id === organizationId 
          ? updatedOrg 
          : prev.selectedOrganization
      }));

      return updatedOrg;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const selectedOrg = organizations.find(org => org.id === organizationId);
      if (!selectedOrg) {
        throw new Error('Organization not found');
      }

      setState(prev => ({
        ...prev,
        selectedOrganization: selectedOrg
      }));

      // Update user context
      if (userContext) {
        setUserContext({
          ...userContext,
          current_organization_id: organizationId
        });
      }


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch organization';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [organizations, userContext]);

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

  // Load organizations when user signs in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchUserOrganizations();
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
  }, [isSignedIn, user?.id, fetchUserOrganizations]);

  // =====================================================
  // Return Hook Interface
  // =====================================================

  const hasOrganizations = organizations.length > 0;

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
    refreshOrganizations: fetchUserOrganizations,
    fetchUserContext: fetchUserOrganizations, // Alias for compatibility

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
    hasOrganizations: hasOrganizations,
  };
};