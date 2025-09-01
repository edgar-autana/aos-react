import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SuperAdminDebug() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [dbCheck, setDbCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [clerkUser, setClerkUser] = useState<any>(null);

  // Get Clerk user directly from window as fallback
  useEffect(() => {
    const checkClerkUser = () => {
      if (window.Clerk?.user) {
        setClerkUser(window.Clerk.user);
      }
    };
    
    // Check immediately
    checkClerkUser();
    
    // Also check with a delay in case Clerk is still loading
    const timer = setTimeout(checkClerkUser, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get the actual user (from hook or window)
  const actualUser = user || clerkUser;

  const checkDatabase = async () => {
    if (!actualUser?.id) return;
    
    setLoading(true);
    try {
      console.log('🔍 Checking database for user:', actualUser.id);
      
      const { data, error } = await supabase
        .from('saas_super_admin_users')
        .select('*')
        .eq('user_id', actualUser.id)
        .maybeSingle();

      console.log('🔍 Database result:', { data, error });
      setDbCheck({ data, error });
    } catch (err) {
      console.error('🔍 Database check failed:', err);
      setDbCheck({ data: null, error: err });
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async () => {
    if (!actualUser?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saas_super_admin_users')
        .insert({
          user_id: actualUser.id,
          permissions: {
            system: {
              manage_all: true,
              manage_users: true,
              manage_organizations: true,
              manage_invitations: true,
              manage_settings: true
            },
            admin: {
              full_access: true
            }
          },
          created_by: actualUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      console.log('✅ Super Admin created:', { data, error });
      setDbCheck({ data, error });
      
      if (!error) {
        alert('Super Admin created successfully! Refresh the page.');
      }
    } catch (err) {
      console.error('❌ Failed to create Super Admin:', err);
      setDbCheck({ data: null, error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (actualUser?.id) {
      checkDatabase();
    }
  }, [actualUser?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Super Admin Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Clerk Info */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold mb-2">Clerk Authentication</h3>
            <div className="text-sm space-y-1">
              <div>Is Loaded: {isLoaded ? '✅' : '❌'}</div>
              <div>Is Signed In: {isSignedIn ? '✅' : '❌'}</div>
              <div>Hook User: {user?.id ? '✅' : '❌'}</div>
              <div>Window User: {clerkUser?.id ? '✅' : '❌'}</div>
              <div>User ID: <code className="bg-white px-2 py-1 rounded">{actualUser?.id || 'Not available'}</code></div>
              <div>Email: {actualUser?.primaryEmailAddress?.emailAddress || actualUser?.emailAddresses?.[0]?.emailAddress || 'Not available'}</div>
              <div>Name: {actualUser?.firstName} {actualUser?.lastName}</div>
            </div>
          </div>

          {/* Database Check */}
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold mb-2">Database Check</h3>
            <Button onClick={checkDatabase} disabled={loading} className="mb-2">
              {loading ? 'Checking...' : 'Check Database'}
            </Button>
            
            {dbCheck && (
              <div className="text-sm space-y-1">
                <div>Found in DB: {dbCheck.data ? '✅ YES' : '❌ NO'}</div>
                {dbCheck.error && (
                  <div className="text-red-600">Error: {dbCheck.error.message}</div>
                )}
                {dbCheck.data && (
                  <div className="bg-white p-2 rounded text-xs">
                    <strong>DB Record:</strong>
                    <pre>{JSON.stringify(dbCheck.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="font-bold mb-2">Actions</h3>
            <div className="space-y-2">
              {actualUser?.id && !dbCheck?.data && (
                <Button onClick={createSuperAdmin} disabled={loading} variant="outline">
                  {loading ? 'Creating...' : 'Create Super Admin Record'}
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.href = '/console/admin'} 
                className="w-full"
              >
                Try Admin Console Again
              </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </div>

          {/* SQL Helper */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">Manual SQL (if needed)</h3>
            <div className="bg-white p-2 rounded text-xs">
              <code>
                {`INSERT INTO saas_super_admin_users (user_id, permissions, created_by, created_at, updated_at) 
VALUES ('${actualUser?.id || 'YOUR_USER_ID'}', '{"system": {"manage_all": true}}', '${actualUser?.id || 'YOUR_USER_ID'}', NOW(), NOW());`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}