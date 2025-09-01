/**
 * App Data Context - Single source of truth for organization and subscription data
 * Prevents multiple API calls by providing data through context instead of multiple hook instances
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

interface AppDataContextType {
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
  canCreateOrganization: boolean;
  
  // Helper functions
  getOrganizationLimitText: () => string;
  
  // Actions
  refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  
  // All state in one place
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [userContext, setUserContext] = useState<UserOrganizationContext | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<{ organizations_count: number; ai_requests_used: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent multiple loads
  const hasInitialized = useRef(false);
  const isLoadingRef = useRef(false);

  // Load all data function
  const loadAllData = async () => {
    if (!isSignedIn || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Setup auth token
      const token = await getToken();
      if (token) {
        localStorage.setItem('clerk-token', token);
      }

      // Load all data in parallel
      const [userContextResponse, subscriptionResponse, plansResponse] = await Promise.all([
        organizationApi.getUserContext().catch(() => null),
        subscriptionApi.getMySubscription().catch(() => null),
        subscriptionApi.getPlans().catch(() => [])
      ]);

      // Process responses
      if (userContextResponse) {
        setOrganizations(userContextResponse.organizations);
        setUserContext(userContextResponse);
        
        // Set selected organization
        const selected = userContextResponse.current_organization_id 
          ? userContextResponse.organizations.find(org => org.id === userContextResponse.current_organization_id)
          : userContextResponse.organizations[0] || null;
        setSelectedOrganization(selected);
      }

      if (subscriptionResponse?.success) {
        setUserSubscription(subscriptionResponse.subscription);
        setCurrentPlan(subscriptionResponse.plan);
        setUsage(subscriptionResponse.usage);
      }

      setPlans(plansResponse || []);
      
      hasInitialized.current = true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Initialize data when user signs in
  useEffect(() => {
    if (isSignedIn && !hasInitialized.current) {
      loadAllData();
    }
  }, [isSignedIn]);

  // Computed values
  const hasOrganizations = organizations.length > 0;
  const hasActiveSubscription = userSubscription?.status === 'active' && currentPlan !== null;
  const canUpgradePlan = currentPlan && plans.length > 0 
    ? plans.some(plan => plan.tier > currentPlan.tier)
    : false;
  const canCreateOrganization = currentPlan && hasOrganizations
    ? organizations.length < currentPlan.max_organizations
    : false;

  const getOrganizationLimitText = () => {
    if (!currentPlan) return '';
    return `${organizations.length} / ${currentPlan.max_organizations} organizations`;
  };

  const refreshData = async () => {
    hasInitialized.current = false;
    await loadAllData();
  };

  const value: AppDataContextType = {
    // Organization data
    organizations,
    selectedOrganization,
    userContext,
    
    // Subscription data
    plans,
    userSubscription,
    currentPlan,
    usage,
    
    // Loading states
    isLoading,
    error,
    
    // Computed values
    hasOrganizations,
    hasActiveSubscription,
    canUpgradePlan,
    canCreateOrganization,
    
    // Helper functions
    getOrganizationLimitText,
    
    // Actions
    refreshData
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}