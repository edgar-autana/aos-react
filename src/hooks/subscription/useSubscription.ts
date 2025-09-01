import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { subscriptionApi } from '@/services/subscription/subscriptionApi';
import type { 
  SubscriptionPlan, 
  UserSubscription,
  CheckLimitsResponse 
} from '@/types/subscription/subscription';
import { toast } from '@/hooks/use-toast';

export function useSubscription() {
  const { isSignedIn } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<{ organizations_count: number; ai_requests_used: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  
  // Load plans on mount (only once)
  useEffect(() => {
    loadPlans();
  }, []); // Empty dependency array to run only once

  // Load user subscription when signed in
  useEffect(() => {
    if (isSignedIn) {
      console.log('✅ useSubscription: User signed in, loading subscription');
      loadUserSubscription();
    } else {
      console.log('⚠️ useSubscription: User not signed in, resetting state');
      setUserSubscription(null);
      setCurrentPlan(null);
      setUsage(null);
      setIsLoading(false);
    }
  }, [isSignedIn]); // Only depend on isSignedIn

  const loadPlans = async () => {
    try {
      const plansData = await subscriptionApi.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive'
      });
    }
  };

  const loadUserSubscription = async () => {
    try {
      console.log('🔄 useSubscription: Starting loadUserSubscription');
      setIsLoading(true);
      
      const response = await subscriptionApi.getMySubscription();
      console.log('✅ useSubscription: getMySubscription response:', response);
      
      if (response.success) {
        setUserSubscription(response.subscription || null);
        setCurrentPlan(response.plan || null);
        setUsage(response.usage || null);
        console.log('✅ useSubscription: State updated successfully');
      } else {
        console.log('⚠️ useSubscription: Unsuccessful response, clearing state');
        setUserSubscription(null);
        setCurrentPlan(null);
        setUsage(null);
      }
    } catch (error) {
      console.error('❌ useSubscription: Error loading subscription:', error);
      setUserSubscription(null);
      setCurrentPlan(null);
      setUsage(null);
    } finally {
      console.log('🏁 useSubscription: Setting loading to false');
      setIsLoading(false);
    }
  };

  const activatePlan = async (planId: string) => {
    try {
      setIsActivating(true);
      const response = await subscriptionApi.activatePlan(planId);
      
      if (response.success) {
        toast({
          title: 'Success!',
          description: 'Your plan has been activated successfully'
        });
        
        // Update local state
        if (response.subscription) {
          setUserSubscription(response.subscription);
          setCurrentPlan(response.plan || null);
          setUsage(response.usage || null);
        }
        
        // Reload to ensure fresh data
        await loadUserSubscription();
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to activate plan');
      }
    } catch (error: any) {
      console.error('Error activating plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate plan',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsActivating(false);
    }
  };

  const checkLimit = async (resourceType: string): Promise<CheckLimitsResponse | null> => {
    try {
      return await subscriptionApi.checkLimits(resourceType);
    } catch (error) {
      console.error('Error checking limits:', error);
      return null;
    }
  };

  const hasActiveSubscription = () => {
    return userSubscription?.status === 'active' && currentPlan !== null;
  };

  const canCreateOrganization = () => {
    if (!usage || !currentPlan) return false;
    return usage.organizations_count < currentPlan.max_organizations;
  };

  const getOrganizationLimitText = () => {
    if (!currentPlan || !usage) return '';
    return `${usage.organizations_count} / ${currentPlan.max_organizations} organizations`;
  };

  const getAIRequestsLimitText = () => {
    if (!currentPlan || !usage) return '';
    return `${usage.ai_requests_used} / ${currentPlan.max_ai_requests_per_month} AI requests this month`;
  };

  return {
    // Data
    plans,
    userSubscription,
    currentPlan,
    usage,
    isLoading,
    isActivating,
    
    // Actions
    activatePlan,
    checkLimit,
    loadUserSubscription,
    
    // Helpers
    hasActiveSubscription,
    canCreateOrganization,
    getOrganizationLimitText,
    getAIRequestsLimitText
  };
}