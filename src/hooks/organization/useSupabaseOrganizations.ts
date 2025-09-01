import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { subscriptionApi, type UserOrganizationContext } from '@/services/subscription/subscriptionApi';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para manejar organizaciones usando Supabase directamente
 * Reemplaza las llamadas al backend /api/v1/organizations/context/current
 */
export function useSupabaseOrganizations() {
  const { isSignedIn, user } = useAuth();
  const [context, setContext] = useState<UserOrganizationContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clerkUser, setClerkUser] = useState<any>(null);

  // Get Clerk user directly from window as fallback
  useEffect(() => {
    const checkClerkUser = () => {
      if (window.Clerk?.user) {
        setClerkUser(window.Clerk.user);
      }
    };
    
    checkClerkUser();
    const timer = setTimeout(checkClerkUser, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get the actual user (from hook or window)
  const actualUser = user || clerkUser;

  // Load user context
  const loadUserContext = async (organizationId?: string) => {
    if (!actualUser?.id) {
      setContext(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 useSupabaseOrganizations: Loading user context with Supabase...', actualUser.id);
      const userContext = await subscriptionApi.getUserContext(actualUser.id, organizationId);
      
      setContext(userContext);
      console.log('✅ useSupabaseOrganizations: User context loaded successfully:', userContext);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user context';
      console.error('❌ useSupabaseOrganizations: Error loading user context:', err);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: 'Failed to load organization context',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 useSupabaseOrganizations: Loading finished');
    }
  };

  // Switch organization
  const switchOrganization = async (organizationId: string) => {
    await loadUserContext(organizationId);
    
    // Store current organization in localStorage for persistence
    localStorage.setItem('current-organization-id', organizationId);
  };

  // Load context on mount and auth changes
  useEffect(() => {
    if (actualUser?.id) {
      // Check if there's a stored organization ID
      const storedOrgId = localStorage.getItem('current-organization-id');
      loadUserContext(storedOrgId || undefined);
    } else {
      setContext(null);
      setIsLoading(false);
    }
  }, [actualUser?.id]);

  // Helper functions
  const getCurrentOrganization = () => {
    if (!context?.current_organization_id) return null;
    return context.organizations.find(org => org.id === context.current_organization_id) || null;
  };

  const hasOrganizations = () => {
    return (context?.organizations?.length || 0) > 0;
  };

  const isSuperAdmin = () => {
    return context?.is_super_admin || false;
  };

  const hasPermission = (permission: string) => {
    if (!context?.permissions) return false;
    
    // Check nested permission structure
    const parts = permission.split('.');
    let current: any = context.permissions;
    
    for (const part of parts) {
      if (!current[part]) return false;
      current = current[part];
    }
    
    return current === true;
  };

  const canManageOrganization = () => {
    return hasPermission('organization.manage_settings') || 
           hasPermission('organization.manage_members') ||
           isSuperAdmin();
  };

  return {
    // Data
    context,
    organizations: context?.organizations || [],
    currentOrganization: getCurrentOrganization(),
    currentOrganizationId: context?.current_organization_id || null,
    permissions: context?.permissions || {},
    isLoading,
    error,
    
    // Computed values
    hasOrganizations: hasOrganizations(),
    isSuperAdmin: isSuperAdmin(),
    
    // Actions
    loadUserContext,
    switchOrganization,
    
    // Permission helpers
    hasPermission,
    canManageOrganization
  };
}