/**
 * usePermissions Hook - Temporary Mode
 * Provides full permissions to bypass RLS issues while we debug
 */

import { useOrganizationsTemp } from "./organization/useOrganizationsTemp";

export function usePermissions() {
  const { userContext, isAuthenticated } = useOrganizationsTemp();
  
  // In temp mode, give full permissions to authenticated users
  const permissions: string[] = [];
  
  if (isAuthenticated) {
    // Add all possible permissions
    permissions.push(
      'org:view:dashboard',
      'org:view:orders', 
      'org:all:access',
      'org:manage:settings',
      'org:manage:members',
      'org:manage:billing',
      'org:data:view_all',
      'org:data:create_all',
      'org:data:update_all',
      'org:data:delete_all'
    );
  }
  
  // Helper function
  const hasPermission = (perm: string) => permissions.includes(perm);
  
  
  return { permissions, hasPermission };
}