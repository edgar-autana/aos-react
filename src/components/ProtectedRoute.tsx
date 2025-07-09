import { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeftIcon, LockIcon } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

type PermissionType = string | string[];

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: PermissionType;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const isAllowed = !permission
    || (Array.isArray(permission)
      ? permission.some(perm => hasPermission(perm))
      : hasPermission(permission));

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LockIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-muted-foreground mb-4">You do not have permission to view this page.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Go back
        </button>
      </div>
    );
  }
  return <>{children}</>;
} 