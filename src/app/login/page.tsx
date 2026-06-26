"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  member: "/member",
  host: "/host",
  admin: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);

  // Open the login modal on mount
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_DASHBOARD[user.role]);
    }
  }, [isAuthenticated, user, router]);

  // When the modal closes (without auth), bounce to home
  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o && !isAuthenticated) {
      router.replace("/");
    }
  };

  return (
    <SiteLayout showLoginModal={false}>
      <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Opening sign-in…</p>
      </div>

      <LoginModal
        open={open}
        onOpenChange={handleOpenChange}
        onClose={() => handleOpenChange(false)}
      />
    </SiteLayout>
  );
}
