/**
 * useSuperAdmin Hook
 * Custom hook for super admin operations
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Organization,
  OrganizationListResponse,
  OrganizationResponse,
  PlanType,
  OrganizationStatus
} from '../../types/organization/organization';
import { superAdminApi } from '../../services/organization/organizationApi';

interface UseSuperAdminState {
  allOrganizations: Organization[];
  isLoading: boolean;
  error: string | null;
  systemHealth: {
    status: string;
    timestamp: string;
    components: Record<string, string>;
    metrics: Record<string, string>;
  } | null;
}

export const useSuperAdmin = () => {
  const { isSignedIn } = useAuth();
  
  const [state, setState] = useState<UseSuperAdminState>({
    allOrganizations: [],
    isLoading: false,
    error: null,
    systemHealth: null,
  });

  // =====================================================
  // Organization Management (Super Admin)
  // =====================================================

  const fetchAllOrganizations = useCallback(async (
    limit = 100,
    offset = 0,
    filters: {
      status_filter?: string;
      plan_filter?: string;
      search?: string;
    } = {}
  ) => {
    if (!isSignedIn) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await superAdminApi.getAllOrganizations(limit, offset, filters);
      if (response.success) {
        setState(prev => ({
          ...prev,
          allOrganizations: response.organizations
        }));
        return response;
      } else {
        throw new Error(response.error || 'Failed to fetch organizations');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch organizations'
      }));
      console.error('Error fetching all organizations:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn]);

  const updateOrganizationStatus = useCallback(async (
    organizationId: string,
    newStatus: OrganizationStatus,
    reason?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await superAdminApi.updateOrganizationStatus(
        organizationId,
        newStatus,
        reason
      );

      if (response.success && response.organization) {
        // Update local state
        setState(prev => ({
          ...prev,
          allOrganizations: prev.allOrganizations.map(org =>
            org.id === organizationId ? response.organization! : org
          )
        }));

        return response.organization;
      } else {
        throw new Error(response.error || 'Failed to update organization status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization status';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateOrganizationPlan = useCallback(async (
    organizationId: string,
    newPlan: PlanType
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await superAdminApi.updateOrganizationPlan(organizationId, newPlan);

      if (response.success && response.organization) {
        // Update local state
        setState(prev => ({
          ...prev,
          allOrganizations: prev.allOrganizations.map(org =>
            org.id === organizationId ? response.organization! : org
          )
        }));

        return response.organization;
      } else {
        throw new Error(response.error || 'Failed to update organization plan');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization plan';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // =====================================================
  // System Management
  // =====================================================

  const fetchSystemHealth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const health = await superAdminApi.getSystemHealth();
      setState(prev => ({ ...prev, systemHealth: health }));

      return health;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system health';
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

  const getOrganizationsByStatus = useCallback((status: OrganizationStatus) => {
    return state.allOrganizations.filter(org => org.status === status);
  }, [state.allOrganizations]);

  const getOrganizationsByPlan = useCallback((plan: PlanType) => {
    return state.allOrganizations.filter(org => org.plan_type === plan);
  }, [state.allOrganizations]);

  const searchOrganizations = useCallback((query: string) => {
    if (!query) return state.allOrganizations;
    
    return state.allOrganizations.filter(org =>
      org.name.toLowerCase().includes(query.toLowerCase()) ||
      org.slug.toLowerCase().includes(query.toLowerCase())
    );
  }, [state.allOrganizations]);

  // =====================================================
  // Analytics and Metrics
  // =====================================================

  const getAnalytics = useCallback(() => {
    const organizations = state.allOrganizations;
    
    return {
      totalOrganizations: organizations.length,
      activeOrganizations: getOrganizationsByStatus('active').length,
      suspendedOrganizations: getOrganizationsByStatus('suspended').length,
      cancelledOrganizations: getOrganizationsByStatus('cancelled').length,
      
      freeOrganizations: getOrganizationsByPlan('free').length,
      premiumOrganizations: getOrganizationsByPlan('premium').length,
      enterpriseOrganizations: getOrganizationsByPlan('enterprise').length,
      
      totalMembers: organizations.reduce((sum, org) => sum + (org.member_count || 0), 0),
      averageMembersPerOrganization: organizations.length > 0 
        ? Math.round(organizations.reduce((sum, org) => sum + (org.member_count || 0), 0) / organizations.length)
        : 0,
      
      organizationsByStatus: {
        active: getOrganizationsByStatus('active').length,
        suspended: getOrganizationsByStatus('suspended').length,
        cancelled: getOrganizationsByStatus('cancelled').length,
        pending: getOrganizationsByStatus('pending').length,
      },
      
      organizationsByPlan: {
        free: getOrganizationsByPlan('free').length,
        premium: getOrganizationsByPlan('premium').length,
        enterprise: getOrganizationsByPlan('enterprise').length,
      },
    };
  }, [state.allOrganizations, getOrganizationsByStatus, getOrganizationsByPlan]);

  // =====================================================
  // Return Hook Interface
  // =====================================================

  return {
    // State
    allOrganizations: state.allOrganizations,
    isLoading: state.isLoading,
    error: state.error,
    systemHealth: state.systemHealth,

    // Actions
    fetchAllOrganizations,
    updateOrganizationStatus,
    updateOrganizationPlan,
    fetchSystemHealth,
    clearError,

    // Utilities
    getOrganizationsByStatus,
    getOrganizationsByPlan,
    searchOrganizations,
    getAnalytics,

    // Computed
    isAuthenticated: isSignedIn,
    analytics: getAnalytics(),
  };
};