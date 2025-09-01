// Subscription and Plan Types

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  tier: string | number; // Can be either string or number from API
  max_organizations: number;
  max_users_per_org: number;
  max_ai_requests_per_month: number;
  features: {
    features: string[];
  } | any; // More flexible for different feature formats
  price_monthly: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
}

export interface UserSubscriptionResponse {
  success: boolean;
  subscription?: UserSubscription;
  plan?: SubscriptionPlan;
  usage?: {
    organizations_count: number;
    ai_requests_used: number;
  };
  message?: string;
}

export interface CheckLimitsResponse {
  allowed: boolean;
  reason: string;
  limit: number;
  used: number;
  plan_name?: string;
}