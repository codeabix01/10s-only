"use client";

import { SiteLayout } from "@/components/site/site-layout";
import { AuthGuard } from "@/components/site/auth-guard";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";

export default function MemberPage() {
  return (
    <SiteLayout>
      <AuthGuard requireRole="member">
        <MemberDashboard />
      </AuthGuard>
    </SiteLayout>
  );
}
