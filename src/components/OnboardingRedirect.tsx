import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { useSupabaseOrganizations } from '@/hooks/organization/useSupabaseOrganizations';

interface OnboardingRedirectProps {
  children: React.ReactNode;
}

export function OnboardingRedirect({ children }: OnboardingRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const { userSubscription, isLoading, hasActiveSubscription } = useSubscription();
  const { isSuperAdmin, isLoading: orgLoading } = useSupabaseOrganizations();

  useEffect(() => {
    // Only redirect if user is signed in and we've loaded both subscription and organization data
    if (isSignedIn && !isLoading && !orgLoading) {
      const isOnOnboardingPage = location.pathname === '/onboarding';
      const isOnLandingPage = location.pathname === '/';
      const isOnAdminConsole = location.pathname.startsWith('/console/admin');
      const isOnDebugPage = location.pathname.startsWith('/debug/');
      const needsOnboarding = !hasActiveSubscription() || userSubscription?.status === 'pending';
      
      // Don't redirect from landing page - let users browse
      if (isOnLandingPage) {
        return;
      }
      
      // Don't redirect Super Admins - they have special access
      if (isSuperAdmin) {
        console.log('🔥 OnboardingRedirect: Super Admin detected, skipping onboarding redirect');
        return;
      }
      
      // Don't redirect if already on admin console or debug pages
      if (isOnAdminConsole || isOnDebugPage) {
        return;
      }
      
      // Redirect to onboarding if user needs to select a plan (but not from landing)
      if (needsOnboarding && !isOnOnboardingPage && !isOnLandingPage) {
        navigate('/onboarding', { replace: true });
      }
      
      // Redirect away from onboarding if user already has active subscription
      if (!needsOnboarding && isOnOnboardingPage) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isSignedIn, userSubscription, isLoading, orgLoading, isSuperAdmin, location.pathname, navigate, hasActiveSubscription]);

  // Show loading while checking subscription and organization status
  if ((isLoading || orgLoading) && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}