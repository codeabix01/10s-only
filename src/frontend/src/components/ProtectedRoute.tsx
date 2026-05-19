import { useAuth } from "@/hooks/useAuth";
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
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { isConnected, isApproved, isAdmin } = useAuth();

  if (!isConnected) {
    return <Navigate to={redirectTo} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (!requireAdmin && !isApproved) {
    return <Navigate to="/status" />;
  }

  return <>{children}</>;
}
