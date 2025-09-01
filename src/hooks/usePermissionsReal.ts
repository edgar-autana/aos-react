/**
 * usePermissions Hook - Real Supabase Mode
 * Uses real organization data from GlobalDataProvider context
 */

import { useGlobalData } from "@/contexts/GlobalDataProviderReal";
import { useAuth } from "@clerk/clerk-react";

export function usePermissions() {
  const { isSignedIn } = useAuth();
  const { userContext } = useGlobalData();
  
  // Get permissions from the SAAS organization context
  const permissionsObj = userContext?.permissions || {};
  
  // Convert permissions object to a flat array of permission strings
  const permissions: string[] = [];
  
  // Add organization permissions
  if (permissionsObj.organization) {
    Object.entries(permissionsObj.organization).forEach(([key, value]) => {
      if (value === true) {
        permissions.push(`org:manage:${key}`);
      }
    });
  }
  
  // Add data permissions
  if (permissionsObj.data) {
    Object.entries(permissionsObj.data).forEach(([key, value]) => {
      if (value === true) {
        if (key === 'view_all') {
          permissions.push('org:view:dashboard', 'org:view:orders', 'org:all:access');
        }
        permissions.push(`org:data:${key}`);
      }
    });
  }
  
  // Super admin gets all permissions
  if (userContext?.is_super_admin) {
    permissions.push('org:all:access', 'org:view:dashboard', 'org:view:orders', 'org:manage:settings', 'super:admin', 'admin:all');
  }
  
  // Default permissions for any authenticated user with an organization  
  if (userContext && !userContext.is_super_admin && userContext.organizations.length > 0) {
    permissions.push('org:view:dashboard', 'org:view:orders', 'org:all:access');
  }
  
  // Helper function
  const hasPermission = (perm: string) => permissions.includes(perm);
  
  return { permissions, hasPermission };
}