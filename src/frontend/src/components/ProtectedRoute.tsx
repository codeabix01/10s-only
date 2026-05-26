import { useAuth } from "@/hooks/useAuth";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isConnected, isApproved, isAdmin } = useAuth();
  const { userProfile } = useUserAuth();

  // Admin routes still require Internet Identity
  if (requireAdmin) {
    if (!isConnected || !isAdmin) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  }

  // Regular user routes: accept EITHER Internet Identity OR session-based auth
  const hasIIAuth = isConnected && isApproved;
  const hasSessionAuth = !!userProfile;

  if (!hasIIAuth && !hasSessionAuth) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}
