import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { Check, Crown, Zap, Building2, CreditCard, Loader2 } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription/subscription';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanActivated?: () => void;
}

interface PlanFeatureProps {
  feature: string;
  included: boolean;
}

function PlanFeature({ feature, included }: PlanFeatureProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {included && <Check className="w-3 h-3" />}
      </div>
      <span className={`text-sm ${included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
        {feature}
      </span>
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSelectPlan: (planId: string) => void;
  isActivating: boolean;
  disabled?: boolean;
}

function PlanCard({ plan, isCurrentPlan, onSelectPlan, isActivating, disabled }: PlanCardProps) {
  const getPlanIcon = (tier: string | number | undefined) => {
    const tierStr = String(tier || '').toLowerCase();
    switch (tierStr) {
      case 'enterprise':
        return <Crown className="w-5 h-5" />;
      case 'premium':
        return <Zap className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getPlanBadgeVariant = (tier: string | number | undefined) => {
    const tierStr = String(tier || '').toLowerCase();
    switch (tierStr) {
      case 'enterprise':
        return 'default' as const;
      case 'premium':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getFeatureList = (plan: SubscriptionPlan) => {
    const baseFeatures = [
      { name: `Up to ${plan.max_organizations || 0} organization${(plan.max_organizations || 0) !== 1 ? 's' : ''}`, included: true },
      { name: `${plan.max_users_per_org || 0} users per organization`, included: true },
      { name: `${plan.max_ai_requests_per_month || 0} AI requests per month`, included: true }
    ];

    // Add tier-specific features
    const tierStr = String(plan.tier || '').toLowerCase();
    if (tierStr === 'premium') {
      baseFeatures.push(
        { name: 'Priority support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom integrations', included: false }
      );
    } else if (tierStr === 'enterprise') {
      baseFeatures.push(
        { name: 'Priority support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'SSO integration', included: true }
      );
    } else {
      baseFeatures.push(
        { name: 'Community support', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Priority support', included: false },
        { name: 'Advanced analytics', included: false }
      );
    }

    return baseFeatures;
  };

  const features = getFeatureList(plan);

  return (
    <Card className={`relative h-full ${isCurrentPlan ? 'ring-2 ring-primary shadow-lg' : ''} ${
      String(plan.tier || '').toLowerCase() === 'premium' ? 'border-primary/20' : ''
    }`}>
      {String(plan.tier || '').toLowerCase() === 'premium' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="default" className="bg-green-600 text-white">Current Plan</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getPlanIcon(plan.tier)}
          <CardTitle className="text-xl">{plan.display_name}</CardTitle>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl font-bold">${plan.price_monthly || 0}</span>
          <span className="text-muted-foreground">/month</span>
          <Badge variant={getPlanBadgeVariant(plan.tier)}>
            {plan.tier || 'Basic'}
          </Badge>
        </div>
        <CardDescription className="text-center">
          Perfect for {String(plan.tier || '').toLowerCase() === 'enterprise' ? 'large organizations' : 
                     String(plan.tier || '').toLowerCase() === 'premium' ? 'growing teams' : 'small teams'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <PlanFeature
              key={index}
              feature={feature.name}
              included={feature.included}
            />
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button
            onClick={() => onSelectPlan(plan.id)}
            disabled={isCurrentPlan || isActivating || disabled}
            className="w-full"
            variant={isCurrentPlan ? 'outline' : 'default'}
          >
            {isActivating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Choose Plan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionPlansModal({ isOpen, onClose, onPlanActivated }: SubscriptionPlansModalProps) {
  const { plans, currentPlan, activatePlan, isActivating, isLoading } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
    const success = await activatePlan(planId);
    
    if (success) {
      onPlanActivated?.();
      onClose();
    }
    
    setSelectedPlanId(null);
  };

  // Dynamic width based on number of plans
  const getModalWidth = () => {
    const planCount = plans.length;
    if (planCount <= 1) return 'max-w-md';      // 1 plan: small
    if (planCount <= 2) return 'max-w-2xl';     // 2 plans: medium
    if (planCount <= 3) return 'max-w-4xl';     // 3 plans: large
    return 'max-w-6xl';                         // 4+ plans: extra large
  };

  const getGridCols = () => {
    const planCount = plans.length;
    if (planCount <= 1) return 'grid-cols-1';
    if (planCount <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (planCount <= 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${getModalWidth()} max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading subscription plans...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalWidth()} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Your Subscription Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscription plans available.</p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Select the perfect plan for your team's needs. You can upgrade or downgrade at any time.
                </p>
                <div className="text-xs text-muted-foreground">
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} available
                </div>
              </div>
              
              <div className={`grid ${getGridCols()} gap-4 pt-4 ${
                plans.length === 1 ? 'place-items-center' : ''
              }`}>
                {plans
                  .sort((a, b) => a.price_monthly - b.price_monthly)
                  .map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`${plans.length === 1 ? 'w-full max-w-sm' : 'w-full'}`}
                    >
                      <PlanCard
                        plan={plan}
                        isCurrentPlan={currentPlan?.id === plan.id}
                        onSelectPlan={handleSelectPlan}
                        isActivating={isActivating && selectedPlanId === plan.id}
                        disabled={isActivating && selectedPlanId !== plan.id}
                      />
                    </div>
                  ))}
              </div>
              
              <div className="text-center text-sm text-muted-foreground border-t pt-6">
                <p>✓ 30-day free trial • ✓ Cancel anytime • ✓ Secure payment processing</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}