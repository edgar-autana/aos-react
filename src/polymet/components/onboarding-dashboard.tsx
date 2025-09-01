import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Building2, Users, Brain, Zap, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OnboardingDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    plans, 
    userSubscription, 
    currentPlan, 
    isLoading, 
    isActivating,
    activatePlan,
    hasActiveSubscription
  } = useSubscription();

  // Redirect to dashboard if user already has active subscription
  useEffect(() => {
    if (!isLoading && hasActiveSubscription()) {
      navigate('/dashboard');
    }
  }, [isLoading, hasActiveSubscription, navigate]);

  const handlePlanSelection = async (planId: string) => {
    const success = await activatePlan(planId);
    if (success) {
      // Navigate directly to dashboard where user can create organization
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getPlanIcon = (tier: number) => {
    return tier === 1 ? <Zap className="w-8 h-8" /> : <Brain className="w-8 h-8" />;
  };

  // Check if a plan should be disabled based on current subscription
  const isPlanDisabled = (plan: any) => {
    if (!currentPlan) return false; // No current plan, all plans available
    
    // Current plan is disabled (can't buy the same plan)
    if (currentPlan.id === plan.id) return true;
    
    // Plans with lower or equal tier are disabled (no downgrades)
    if (plan.tier <= currentPlan.tier) return true;
    
    // Higher tier plans remain enabled (upgrades allowed)
    return false;
  };

  const getPlanButtonText = (plan: any) => {
    if (isActivating) return "Activating...";
    if (currentPlan?.id === plan.id) return "Current Plan";
    if (currentPlan && plan.tier <= currentPlan.tier) return "Not Available";
    return "Get Started";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header with logout */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AUTANA, {user?.firstName || 'there'}! 🎉
          </h1>
          {currentPlan ? (
            <>
              <p className="text-xl text-muted-foreground mb-2">
                You're currently on the <strong>{currentPlan.display_name}</strong> plan
              </p>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock more features and capabilities
              </p>
            </>
          ) : (
            <>
              <p className="text-xl text-muted-foreground mb-2">
                Choose your plan to get started with AI-powered manufacturing analysis
              </p>
              <p className="text-sm text-muted-foreground">
                You can upgrade anytime after choosing your initial plan
              </p>
            </>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isProfessional = plan.tier === 2;
            const planDisabled = isPlanDisabled(plan);
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-200",
                  isProfessional && !planDisabled && "border-primary shadow-lg scale-105",
                  !planDisabled && "hover:shadow-xl",
                  planDisabled && "opacity-60 cursor-not-allowed bg-muted/50"
                )}
              >
                {isProfessional && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                    ACTIVE
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={cn(
                    "mx-auto mb-4 p-3 rounded-full",
                    isProfessional ? "bg-primary/10 text-primary" : "bg-muted"
                  )}>
                    {getPlanIcon(plan.tier)}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.display_name}</CardTitle>
                  <CardDescription className="text-3xl font-bold">
                    ${plan.price_monthly}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{plan.max_organizations}</strong> Organization{plan.max_organizations > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{plan.max_users_per_org}</strong> Users per organization
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{plan.max_ai_requests_per_month}</strong> AI analyses/month
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="border-t pt-4 space-y-2">
                    {plan.features.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className={cn(
                      "w-full",
                      planDisabled && "cursor-not-allowed"
                    )}
                    size="lg"
                    variant={isProfessional && !planDisabled ? "default" : "outline"}
                    onClick={() => !planDisabled && handlePlanSelection(plan.id)}
                    disabled={isActivating || planDisabled}
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      getPlanButtonText(plan)
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p className="mb-2">
            🔒 <strong>No credit card required.</strong> This is a demo mode without Stripe integration.
          </p>
          <p>
            In production, you would be redirected to a secure payment page. 
            For now, click any plan to activate it instantly.
          </p>
        </div>

        {/* Navigation options */}
        <div className="text-center mt-8 space-y-2">
          {/* Back to Dashboard button - always visible */}
          {hasActiveSubscription() && (
            <div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
            </div>
          )}
          
          {/* Skip for now option - only for pending subscriptions */}
          {userSubscription?.status === 'pending' && (
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground"
              >
                Skip for now →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}