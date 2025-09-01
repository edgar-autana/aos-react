/**
 * Unified Dashboard Data Hook
 * Optimized hook that combines organization and subscription data to prevent multiple API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { organizationApi } from '@/services/organization/organizationApi';
import { subscriptionApi } from '@/services/subscription/subscriptionApi';
import type { 
  Organization, 
  UserOrganizationContext 
} from '@/types/organization/organization';
import type { 
  SubscriptionPlan, 
  UserSubscription 
} from '@/types/subscription/subscription';

interface DashboardData {
  // Organization data
  organizations: Organization[];
  selectedOrganization: Organization | null;
  userContext: UserOrganizationContext | null;
  
  // Subscription data
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription | null;
  currentPlan: SubscriptionPlan | null;
  usage: { organizations_count: number; ai_requests_used: number } | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  hasOrganizations: boolean;
  hasActiveSubscription: boolean;
  canUpgradePlan: boolean;
}

export function useDashboardData(): DashboardData {
  const { isSignedIn, getToken } = useAuth();
  const [data, setData] = useState<DashboardData>({
    organizations: [],
    selectedOrganization: null,
    userContext: null,
    plans: [],
    userSubscription: null,
    currentPlan: null,
    usage: null,
    isLoading: true,
    error: null,
    hasOrganizations: false,
    hasActiveSubscription: false,
    canUpgradePlan: false,
  });

  // Use ref to track if data has been loaded to prevent re-fetching
  const isInitialized = useRef(false);
  const isLoadingRef = useRef(false);

  const loadAllData = useCallback(async () => {
    if (!isSignedIn || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Setup auth token
      const token = await getToken();
      if (token) {
        localStorage.setItem('clerk-token', token);
      }

      // Load all data in parallel to minimize API calls
      const [userContextResponse, subscriptionResponse, plansResponse] = await Promise.all([
        organizationApi.getUserContext().catch(err => {
          console.warn('Failed to load user context:', err);
          return null;
        }),
        subscriptionApi.getMySubscription().catch(err => {
          console.warn('Failed to load subscription:', err);
          return null;
        }),
        subscriptionApi.getPlans().catch(err => {
          console.warn('Failed to load plans:', err);
          return [];
        })
      ]);

      // Process the responses
      const organizations = userContextResponse?.organizations || [];
      const selectedOrganization = userContextResponse?.current_organization_id 
        ? organizations.find(org => org.id === userContextResponse.current_organization_id) || null
        : organizations.length > 0 ? organizations[0] : null;

      const userSubscription = subscriptionResponse?.success ? subscriptionResponse.subscription : null;
      const currentPlan = subscriptionResponse?.success ? subscriptionResponse.plan : null;
      const usage = subscriptionResponse?.success ? subscriptionResponse.usage : null;

      // Calculate computed values
      const hasOrganizations = organizations.length > 0;
      const hasActiveSubscription = userSubscription?.status === 'active' && currentPlan !== null;
      const canUpgradePlan = currentPlan && plansResponse && plansResponse.length > 0 
        ? plansResponse.some((plan: SubscriptionPlan) => plan.tier > currentPlan.tier)
        : false;

      setData({
        organizations,
        selectedOrganization,
        userContext: userContextResponse,
        plans: plansResponse || [],
        userSubscription,
        currentPlan,
        usage,
        isLoading: false,
        error: null,
        hasOrganizations,
        hasActiveSubscription,
        canUpgradePlan,
      });

      isInitialized.current = true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      console.error('Error loading dashboard data:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [isSignedIn, getToken]);

  // Load data when user signs in (only once)
  useEffect(() => {
    if (isSignedIn && !isInitialized.current) {
      loadAllData();
    }
  }, [isSignedIn, loadAllData]);

  return data;
}