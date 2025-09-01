import { useSupabaseOrganizations } from '@/hooks/organization/useSupabaseOrganizations';
import { useSubscription } from '@/hooks/subscription/useSubscription';

/**
 * Hook unificado que combina datos de organizaciones y suscripciones usando Supabase directamente
 * Reemplaza el GlobalDataProviderReal actual
 */
export function useSupabaseGlobalData() {
  // Organization context
  const {
    context,
    organizations,
    currentOrganization,
    currentOrganizationId,
    permissions,
    isLoading: organizationsLoading,
    error: organizationsError,
    hasOrganizations,
    isSuperAdmin,
    loadUserContext,
    switchOrganization,
    hasPermission,
    canManageOrganization
  } = useSupabaseOrganizations();

  // Subscription context
  const {
    plans,
    userSubscription,
    currentPlan,
    usage,
    isLoading: subscriptionLoading,
    isActivating,
    activatePlan,
    checkLimit,
    loadUserSubscription,
    hasActiveSubscription,
    canCreateOrganization,
    getOrganizationLimitText,
    getAIRequestsLimitText
  } = useSubscription();

  // Combined loading state
  const isLoading = organizationsLoading || subscriptionLoading;
  
  // Combined error state
  const error = organizationsError;

  // Debug logging
  console.log('🔍 useSupabaseGlobalData state:', {
    organizationsLoading,
    subscriptionLoading,
    isLoading,
    hasOrganizations,
    organizationsCount: organizations.length,
    plansCount: plans.length,
    currentPlan: currentPlan?.display_name,
    error
  });

  // Enhanced organization data with subscription info
  const enhancedCurrentOrganization = currentOrganization ? {
    ...currentOrganization,
    subscription: userSubscription,
    plan: currentPlan,
    usage: usage
  } : null;

  return {
    // Organization data
    organizations,
    currentOrganization: enhancedCurrentOrganization,
    currentOrganizationId,
    hasOrganizations,
    isSuperAdmin,
    permissions,
    
    // Subscription data
    plans,
    userSubscription,
    currentPlan,
    usage,
    hasActiveSubscription: hasActiveSubscription(),
    canCreateOrganization: canCreateOrganization(),
    getOrganizationLimitText,
    getAIRequestsLimitText,
    
    // Loading states
    isLoading,
    isActivating,
    error,
    
    // Actions
    switchOrganization,
    activatePlan,
    checkLimit,
    loadUserContext,
    loadUserSubscription,
    
    // Permission helpers
    hasPermission,
    canManageOrganization,
    
    // Debug info
    debugInfo: {
      organizationsLoading,
      subscriptionLoading,
      organizationsError,
      context,
      plans: plans.length,
      organizations: organizations.length
    }
  };
}