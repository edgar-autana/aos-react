/**
 * GLOBAL DATA PROVIDER - Temporary Mode
 * Uses mock organization data to bypass RLS issues while we debug
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useOrganizationsTemp } from '@/hooks/organization/useOrganizationsTemp';
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
  // Organization data (from temp hook)
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
  
  // Use temporary mock organization hook
  const {
    organizations,
    selectedOrganization,
    userContext,
    isLoading: orgLoading,
    error: orgError,
    hasOrganizations,
    refreshOrganizations
  } = useOrganizationsTemp();
  
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
      const fallbackData: EnvironmentInfo = {
        environment: import.meta.env.VITE_ENVIRONMENT || 'DEVELOPMENT',
        status: '🔧 TEMP MODE',
        description: 'Mock Organization Data',
        color: 'orange',
        database: 'Mock Data',
        show_banner: true // Show banner to indicate temp mode
      };
      
      setEnvInfo(fallbackData);
      return fallbackData;
    } catch (error) {
      console.warn('Environment load failed:', error);
      const fallbackData: EnvironmentInfo = {
        environment: 'DEVELOPMENT',
        status: '🔧 TEMP MODE',
        description: 'Mock mode',
        color: 'orange',
        database: 'Mock Data',
        show_banner: true
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

      // Load environment and subscription data
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
      setIsReady(true); // Always ready in temp mode
    };
    
    initializeData();
  }, [isSignedIn]);

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
        // Organization data (from temp hook)
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