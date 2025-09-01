import { supabase } from '@/lib/supabase';
import type { 
  SubscriptionPlan, 
  UserSubscriptionResponse,
  CheckLimitsResponse 
} from '@/types/subscription/subscription';

// Organization context types
export interface UserOrganizationContext {
  user_id: string;
  is_super_admin: boolean;
  current_organization_id?: string;
  organizations: Organization[];
  permissions: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  status: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Keep API_BASE_URL for other operations that still need backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
const API_V1_URL = `${API_BASE_URL}/api/v1`;

/**
 * Subscription API Client
 * Handles all subscription and plan-related operations
 */
class SubscriptionApiClient {
  private getAuthHeaders = async (): Promise<HeadersInit> => {
    // Get token from Clerk
    let token = null;
    
    try {
      // Try to get token from Clerk if available
      if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      }
    } catch (e) {
      console.warn('Failed to get token from Clerk:', e);
    }
    
    // Fallback to localStorage (for development/testing)
    if (!token) {
      token = localStorage.getItem('clerk-token');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Include organization ID if set
    const currentOrgId = localStorage.getItem('current-organization-id');
    if (currentOrgId) {
      headers['X-Organization-ID'] = currentOrgId;
    }
    
    return headers;
  };

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Subscription API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // Get all available plans - Using Supabase directly
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('saas_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Error fetching plans from Supabase:', error);
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Transform Supabase data to match SubscriptionPlan interface
      const transformedPlans = data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        display_name: plan.display_name,
        tier: plan.tier,
        max_organizations: plan.max_organizations,
        max_users_per_org: plan.max_users_per_org,
        max_ai_requests_per_month: plan.max_ai_requests_per_month,
        features: this.parseFeatures(plan.features),
        price_monthly: parseFloat(plan.price_monthly) || 0
      }));

      return transformedPlans;
    } catch (error) {
      console.error('Error in getPlans:', error);
      throw error;
    }
  }

  // Helper method to parse features field
  private parseFeatures(features: any): any {
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return {};
      }
    }
    return features || {};
  }

  // Debug method to check database status
  async checkDatabaseStatus(): Promise<{ 
    plansCount: number; 
    subscriptionsCount: number; 
    usageCount: number;
    samplePlan?: any;
  }> {
    try {
      const [plansResult, subscriptionsResult, usageResult] = await Promise.all([
        supabase.from('saas_plans').select('*', { count: 'exact' }),
        supabase.from('saas_user_subscriptions').select('*', { count: 'exact' }),
        supabase.from('saas_resource_usage').select('*', { count: 'exact' })
      ]);

      return {
        plansCount: plansResult.count || 0,
        subscriptionsCount: subscriptionsResult.count || 0,
        usageCount: usageResult.count || 0,
        samplePlan: plansResult.data?.[0] || null
      };
    } catch (error) {
      console.error('Error checking database status:', error);
      return { plansCount: 0, subscriptionsCount: 0, usageCount: 0 };
    }
  }

  // Get current user's subscription - Using Supabase directly
  async getMySubscription(userId?: string): Promise<UserSubscriptionResponse> {
    try {
      // Get user ID from Clerk if not provided
      let currentUserId = userId;
      if (!currentUserId && window.Clerk && window.Clerk.user) {
        currentUserId = window.Clerk.user.id;
      }

      if (!currentUserId) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }

      // Get user subscription with plan details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('saas_user_subscriptions')
        .select(`
          *,
          saas_plans (*)
        `)
        .eq('user_id', currentUserId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 results gracefully

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        throw new Error(`Failed to fetch subscription: ${subscriptionError.message}`);
      }

      if (!subscriptionData) {
        return {
          success: true,
          message: "No subscription found"
        };
      }

      // Get usage stats
      const [orgCountResult, aiUsageResult] = await Promise.all([
        // Get organization count
        supabase
          .from('saas_organizations')
          .select('id', { count: 'exact' })
          .eq('owner_id', currentUserId),
        
        // Get AI usage for current month
        supabase
          .from('saas_resource_usage')
          .select('usage_count')
          .eq('user_id', currentUserId)
          .eq('resource_type', 'ai_request')
          .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      const organizationsCount = orgCountResult.count || 0;
      const aiRequestsUsed = aiUsageResult.data?.reduce((sum, usage) => sum + usage.usage_count, 0) || 0;

      return {
        success: true,
        subscription: {
          id: subscriptionData.id,
          user_id: subscriptionData.user_id,
          plan_id: subscriptionData.plan_id,
          status: subscriptionData.status,
          started_at: subscriptionData.started_at,
          expires_at: subscriptionData.expires_at
        },
        plan: subscriptionData.saas_plans ? {
          id: subscriptionData.saas_plans.id,
          name: subscriptionData.saas_plans.name,
          display_name: subscriptionData.saas_plans.display_name,
          tier: subscriptionData.saas_plans.tier,
          max_organizations: subscriptionData.saas_plans.max_organizations,
          max_users_per_org: subscriptionData.saas_plans.max_users_per_org,
          max_ai_requests_per_month: subscriptionData.saas_plans.max_ai_requests_per_month,
          features: this.parseFeatures(subscriptionData.saas_plans.features),
          price_monthly: parseFloat(subscriptionData.saas_plans.price_monthly) || 0
        } : undefined,
        usage: {
          organizations_count: organizationsCount,
          ai_requests_used: aiRequestsUsed
        }
      };

    } catch (error) {
      console.error('Error in getMySubscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get subscription'
      };
    }
  }

  // Activate a plan - Using Supabase directly
  async activatePlan(planId: string, userId?: string): Promise<UserSubscriptionResponse> {
    try {
      // Get user ID from Clerk if not provided
      let currentUserId = userId;
      if (!currentUserId && window.Clerk && window.Clerk.user) {
        currentUserId = window.Clerk.user.id;
      }

      if (!currentUserId) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }

      // Verify the plan exists
      const { data: planData, error: planError } = await supabase
        .from('saas_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (planError || !planData) {
        return {
          success: false,
          message: "Plan not found"
        };
      }

      // Check if user already has a subscription
      const { data: existingSubscription, error: checkError } = await supabase
        .from('saas_user_subscriptions')
        .select('id')
        .eq('user_id', currentUserId)
        .maybeSingle();

      const subscriptionData = {
        user_id: currentUserId,
        plan_id: planId,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('saas_user_subscriptions')
          .update(subscriptionData)
          .eq('user_id', currentUserId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('saas_user_subscriptions')
          .insert({
            ...subscriptionData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      // Return the updated subscription details
      return await this.getMySubscription(currentUserId);

    } catch (error) {
      console.error('Error activating plan:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to activate plan'
      };
    }
  }

  // Check if user can perform action based on limits - Using Supabase directly
  async checkLimits(resourceType: string, userId?: string): Promise<CheckLimitsResponse> {
    try {
      // Get user ID from Clerk if not provided
      let currentUserId = userId;
      if (!currentUserId && window.Clerk && window.Clerk.user) {
        currentUserId = window.Clerk.user.id;
      }

      if (!currentUserId) {
        return {
          allowed: false,
          reason: "User not authenticated",
          limit: 0,
          used: 0
        };
      }

      // Get user subscription with plan details
      const { data: subscriptionData, error } = await supabase
        .from('saas_user_subscriptions')
        .select(`
          *,
          saas_plans (*)
        `)
        .eq('user_id', currentUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !subscriptionData?.saas_plans) {
        return {
          allowed: false,
          reason: "No active subscription. Please select a plan.",
          limit: 0,
          used: 0
        };
      }

      const plan = subscriptionData.saas_plans;

      if (resourceType === 'organization_creation') {
        const { count } = await supabase
          .from('saas_organizations')
          .select('id', { count: 'exact' })
          .eq('owner_id', currentUserId);
        
        const used = count || 0;
        const limit = plan.max_organizations;
        
        return {
          allowed: used < limit,
          reason: used < limit ? "Within limits" : `You have used ${used} out of ${limit}`,
          limit,
          used,
          plan_name: plan.display_name
        };
        
      } else if (resourceType === 'ai_request') {
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        
        const { data: usageData } = await supabase
          .from('saas_resource_usage')
          .select('usage_count')
          .eq('user_id', currentUserId)
          .eq('resource_type', 'ai_request')
          .gte('period_start', currentMonthStart.toISOString());
        
        const used = usageData?.reduce((sum, usage) => sum + usage.usage_count, 0) || 0;
        const limit = plan.max_ai_requests_per_month;
        
        return {
          allowed: used < limit,
          reason: used < limit ? "Within limits" : `You have used ${used} out of ${limit}`,
          limit,
          used,
          plan_name: plan.display_name
        };
        
      } else if (resourceType === 'member_invitation') {
        return {
          allowed: true,
          reason: "Check at organization level",
          limit: plan.max_users_per_org,
          used: 0
        };
      }

      return {
        allowed: false,
        reason: `Unknown resource type: ${resourceType}`,
        limit: 0,
        used: 0
      };

    } catch (error) {
      console.error('Error checking limits:', error);
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : 'Failed to check limits',
        limit: 0,
        used: 0
      };
    }
  }

  // Record usage of a resource - Using Supabase directly
  async recordUsage(resourceType: string, organizationId?: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user ID from Clerk if not provided
      let currentUserId = userId;
      if (!currentUserId && window.Clerk && window.Clerk.user) {
        currentUserId = window.Clerk.user.id;
      }

      if (!currentUserId) {
        return { success: false, error: "User not authenticated" };
      }

      const currentDate = new Date();
      const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Check if record exists for this period
      const { data: existingUsage, error: checkError } = await supabase
        .from('saas_resource_usage')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('resource_type', resourceType)
        .eq('period_start', periodStart.toISOString().split('T')[0])
        .maybeSingle();

      if (existingUsage) {
        // Update existing usage record
        const { error: updateError } = await supabase
          .from('saas_resource_usage')
          .update({
            usage_count: existingUsage.usage_count + 1,
            updated_at: currentDate.toISOString()
          })
          .eq('id', existingUsage.id);

        if (updateError) throw updateError;
      } else {
        // Create new usage record
        const { error: insertError } = await supabase
          .from('saas_resource_usage')
          .insert({
            user_id: currentUserId,
            organization_id: organizationId || null,
            resource_type: resourceType,
            usage_count: 1,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            created_at: currentDate.toISOString(),
            updated_at: currentDate.toISOString()
          });

        if (insertError) throw insertError;
      }

      return { success: true };

    } catch (error) {
      console.error('Error recording usage:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record usage' 
      };
    }
  }

  // Get user organization context - Using Supabase directly
  async getUserContext(userId?: string, organizationId?: string): Promise<UserOrganizationContext> {
    try {
      // Get user ID from Clerk if not provided
      let currentUserId = userId;
      if (!currentUserId && window.Clerk && window.Clerk.user) {
        currentUserId = window.Clerk.user.id;
      }

      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Get all data in parallel
      const [superAdminResult, organizationsResult, membershipsResult] = await Promise.all([
        // Check if user is super admin
        supabase
          .from('saas_super_admin_users')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle(),
        
        // Get organizations where user is owner
        supabase
          .from('saas_organizations')
          .select('*')
          .eq('owner_id', currentUserId),
        
        // Get organization memberships
        supabase
          .from('saas_organization_memberships')
          .select(`
            *,
            saas_organizations (*)
          `)
          .eq('user_id', currentUserId)
      ]);

      const isSuperAdmin = !!superAdminResult.data;
      
      // Combine owned organizations and membership organizations
      const ownedOrgs = organizationsResult.data || [];
      const membershipOrgs = (membershipsResult.data || [])
        .map(m => m.saas_organizations)
        .filter(org => org !== null);
      
      // Remove duplicates and create organization list
      const allOrganizations = [...ownedOrgs];
      membershipOrgs.forEach(org => {
        if (!allOrganizations.find(existing => existing.id === org.id)) {
          allOrganizations.push(org);
        }
      });

      // Determine current organization
      let currentOrgId = organizationId;
      if (!currentOrgId && allOrganizations.length > 0) {
        // Use first organization as default
        currentOrgId = allOrganizations[0].id;
      }

      // Get permissions for current organization
      let permissions = {};
      if (currentOrgId) {
        const membership = membershipsResult.data?.find(m => 
          m.saas_organizations?.id === currentOrgId
        );
        if (membership) {
          permissions = membership.permissions || {};
        } else if (ownedOrgs.find(org => org.id === currentOrgId)) {
          // User is owner, has full permissions
          permissions = {
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
          };
        }
      }

      const context: UserOrganizationContext = {
        user_id: currentUserId,
        is_super_admin: isSuperAdmin,
        current_organization_id: currentOrgId,
        organizations: allOrganizations.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan_type: org.plan_type || 'free',
          status: org.status || 'active',
          settings: org.settings || {},
          created_at: org.created_at,
          updated_at: org.updated_at
        })),
        permissions
      };

      return context;

    } catch (error) {
      console.error('Error getting user context:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subscriptionApi = new SubscriptionApiClient();

// Debug functions for console testing
(window as any).debugSubscription = {
  checkStatus: () => subscriptionApi.checkDatabaseStatus(),
  getPlans: () => subscriptionApi.getPlans(),
  getMySubscription: () => subscriptionApi.getMySubscription(),
  checkUser: () => ({
    clerkUser: window.Clerk?.user,
    clerkUserId: window.Clerk?.user?.id,
    isSignedIn: !!window.Clerk?.user
  }),
  // Direct Supabase query for debugging
  rawSubscriptionQuery: async (userId = window.Clerk?.user?.id) => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('saas_user_subscriptions')
      .select('*')
      .eq('user_id', userId);
    console.log('Raw subscription query:', { userId, data, error });
    return { userId, data, error };
  },
  // Create test subscription
  createTestSubscription: async (userId = window.Clerk?.user?.id) => {
    const plans = await subscriptionApi.getPlans();
    const firstPlan = plans[0];
    if (firstPlan) {
      return await subscriptionApi.activatePlan(firstPlan.id, userId);
    }
    return null;
  },
  // Test user context
  getUserContext: (organizationId?: string) => subscriptionApi.getUserContext(undefined, organizationId)
};