"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  requireRole: UserRole;
  children: React.ReactNode;
}

const ROLE_LABEL: Record<UserRole, string> = {
  member: "Member",
  host: "Host",
  admin: "Admin",
};

const ROLE_DASHBOARD: Record<UserRole, string> = {
  member: "/member",
  host: "/host",
  admin: "/admin",
};

export function AuthGuard({ requireRole, children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Not signed in
  if (!isAuthenticated || !user) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="border border-border bg-card w-full rounded-3xl p-8">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold">Members only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This room is sealed. Sign in with your 10s Only handle to enter.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              size="lg"
              className="h-11 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
              onClick={() => router.push("/login")}
            >
              <LogIn className="size-4" />
              Sign in
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 gap-2 rounded-xl text-muted-foreground"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Wrong role
  const hasAccess =
    requireRole === "member"
      ? user.role === "member" || user.role === "host" || user.role === "admin"
      : user.role === requireRole || user.role === "admin";

  if (!hasAccess) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="border border-border bg-card w-full rounded-3xl p-8">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#ff3b3b]/15 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area requires{" "}
            <span className="font-semibold text-foreground">
              {ROLE_LABEL[requireRole]}
            </span>{" "}
            access. Your current role is{" "}
            <span className="font-semibold text-foreground">
              {ROLE_LABEL[user.role]}
            </span>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
            >
              <Link href={ROLE_DASHBOARD[user.role]}>
                Go to your dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 gap-2 rounded-xl text-muted-foreground"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
