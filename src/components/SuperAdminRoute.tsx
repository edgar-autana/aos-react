import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseOrganizations } from '@/hooks/organization/useSupabaseOrganizations';
import { Loader2 } from 'lucide-react';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { isSignedIn, isLoaded, user } = useAuth();
  const { isSuperAdmin, isLoading, context, error } = useSupabaseOrganizations();

  // Debug logging
  useEffect(() => {
    console.log('🔍 SuperAdminRoute Debug:', {
      isSignedIn,
      isLoaded,
      isLoading,
      isSuperAdmin,
      userId: user?.id,
      context,
      error
    });
  }, [isSignedIn, isLoaded, isLoading, isSuperAdmin, user?.id, context, error]);

  // Show loading screen while auth is loading
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    console.log('❌ SuperAdminRoute: User not signed in, redirecting to sign-in');
    return <Navigate to="/sign-in" replace />;
  }

  // Show debug info if not super admin
  if (!isSuperAdmin) {
    console.log('❌ SuperAdminRoute: User is not super admin', {
      userId: user?.id,
      isSuperAdmin,
      context
    });
    
    // Temporary: show debug info instead of redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You are not authorized as a Super Admin.</p>
          <div className="bg-gray-100 p-4 rounded text-sm text-left">
            <strong>Debug Info:</strong>
            <br />User ID: {user?.id}
            <br />Is Super Admin: {isSuperAdmin ? 'Yes' : 'No'}
            <br />Loading: {isLoading ? 'Yes' : 'No'}
            <br />Error: {error || 'None'}
            <br />Context: {context ? 'Loaded' : 'Not loaded'}
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ SuperAdminRoute: Access granted');
  // Render children if user is super admin
  return <>{children}</>;
}