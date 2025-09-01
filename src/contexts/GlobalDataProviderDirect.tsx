/**
 * GLOBAL DATA PROVIDER - Direct Supabase Mode
 * Simplified version using direct Supabase queries via hooks
 * Organizations handled by useOrganizationsDirect hook
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useOrganizationsDirect } from '@/hooks/organization/useOrganizationsDirect';
import { subscriptionApi } from '@/services/subscription/subscriptionApi';
import type { 
  Organization, 
  UserOrganizationContext 
} from '@/types/organization/organization';
import type { 
  SubscriptionPlan, 
  UserSubscription 
} from '@/types/subscription/subscription';

export interface EnvironmentInfo {
  environment: string;
  status: string;
  description: string;
  color: string;
  database: string;
  show_banner: boolean;
}

interface GlobalDataContextType {
  // Organization data (from direct hook)
  organizations: Organization[];
  selectedOrganization: Organization | null;
  userContext: UserOrganizationContext | null;
  
  // Subscription data
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription | null;
  currentPlan: SubscriptionPlan | null;
  usage: { organizations_count: number; ai_requests_used: number } | null;
  
  // Environment data
  envInfo: EnvironmentInfo | null;
  
  // Loading state - controls entire app
  isReady: boolean;
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

const GlobalDataContext = createContext<GlobalDataContextType | null>(null);

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  
  // Use direct Supabase organization hook
  const {
    organizations,
    selectedOrganization,
    userContext,
    isLoading: orgLoading,
    error: orgError,
    hasOrganizations,
    refreshOrganizations
  } = useOrganizationsDirect();
  
  // Subscription and environment state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<{ organizations_count: number; ai_requests_used: number } | null>(null);
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  
  // Global loading state
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load environment data
  const loadEnvironmentData = async () => {
    try {
      // For now, use environment variables as fallback
      const fallbackData: EnvironmentInfo = {
        environment: import.meta.env.VITE_ENVIRONMENT || 'DEVELOPMENT',
        status: '🔧 DEVELOPMENT',
        description: 'Direct Supabase Mode',
        color: 'blue',
        database: 'Supabase Direct',
        show_banner: import.meta.env.VITE_ENVIRONMENT === 'STAGING'
      };
      
      setEnvInfo(fallbackData);
      return fallbackData;
    } catch (error) {
      console.warn('Environment load failed:', error);
      const fallbackData: EnvironmentInfo = {
        environment: 'DEVELOPMENT',
        status: '🔧 DEVELOPMENT',
        description: 'Fallback mode',
        color: 'blue',
        database: 'Frontend Config',
        show_banner: false
      };
      setEnvInfo(fallbackData);
      return fallbackData;
    }
  };

  // Load subscription and environment data
  const loadAllData = async () => {
    try {
      setError(orgError); // Include organization errors

      // Setup auth token if signed in
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          localStorage.setItem('clerk-token', token);
        }
      }

      // Load environment and subscription data in parallel
      const [
        envResult,
        subscriptionResult, 
        plansResult
      ] = await Promise.allSettled([
        loadEnvironmentData(),
        isSignedIn ? subscriptionApi.getMySubscription() : Promise.resolve(null),
        subscriptionApi.getPlans()
      ]);

      // Process environment data
      if (envResult.status === 'fulfilled') {
      } else {
        console.warn('⚠️ Environment data failed:', envResult.reason);
      }

      // Process subscription data (only if signed in)
      if (isSignedIn && subscriptionResult.status === 'fulfilled' && subscriptionResult.value?.success) {
        const subData = subscriptionResult.value;
        setUserSubscription(subData.subscription);
        setCurrentPlan(subData.plan);
        setUsage(subData.usage);
      } else if (isSignedIn) {
        console.warn('⚠️ Subscription failed:', subscriptionResult.status === 'rejected' ? subscriptionResult.reason : 'No success');
      }

      // Process plans data
      if (plansResult.status === 'fulfilled') {
        setPlans(plansResult.value || []);
      } else {
        console.warn('⚠️ Plans failed:', plansResult.reason);
        setPlans([]);
      }


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load application data';
      setError(errorMessage);
      console.error('❌ Global data load failed:', error);
    }
  };

  // Initialize data when auth state changes
  useEffect(() => {
    const initializeData = async () => {
      await loadAllData();
      // Wait for organizations to load or fail, then mark ready
      setIsReady(true);
    };
    
    initializeData();
  }, [isSignedIn]);

  // Update ready state when organization loading completes
  useEffect(() => {
    if (!orgLoading) {
      setIsReady(true);
    }
  }, [orgLoading]);

  // Computed values
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
    setIsReady(false);
    await Promise.all([
      loadAllData(),
      refreshOrganizations()
    ]);
    setIsReady(true);
  };

  // Combine errors from organizations and other sources
  const combinedError = error || orgError;


  return (
    <GlobalDataContext.Provider
      value={{
        // Organization data (from direct hook)
        organizations,
        selectedOrganization,
        userContext,
        
        // Subscription data
        plans,
        userSubscription,
        currentPlan,
        usage,
        
        // Environment data
        envInfo,
        
        // Loading state
        isReady,
        error: combinedError,
        
        // Computed values
        hasOrganizations,
        hasActiveSubscription,
        canUpgradePlan,
        canCreateOrganization,
        
        // Helper functions
        getOrganizationLimitText,
        
        // Actions
        refreshData,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}