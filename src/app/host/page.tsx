"use client";

import { SiteLayout } from "@/components/site/site-layout";
import { AuthGuard } from "@/components/site/auth-guard";
import { HostPortal } from "@/components/host/host-portal";

export default function HostPage() {
  return (
    <SiteLayout>
      <AuthGuard requireRole="host">
        <HostPortal />
      </AuthGuard>
    </SiteLayout>
  );
}
