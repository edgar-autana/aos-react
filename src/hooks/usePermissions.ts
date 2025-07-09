import { useUser } from "@clerk/clerk-react";

export function usePermissions() {
  const { user } = useUser();
  // Get permissions from the first organization membership
  const permissions: string[] = user?.organizationMemberships?.[0]?.permissions || [];
  // Helper function
  const hasPermission = (perm: string) => permissions.includes(perm);
  return { permissions, hasPermission };
} 