"use client";

import { SiteLayout } from "@/components/site/site-layout";
import { ApplySection } from "@/components/apply/apply-section";
import { AuthGuard } from "@/components/site/auth-guard";

export default function ApplyPage() {
  return (
    <SiteLayout>
      <AuthGuard requireRole="member">
        <ApplySection />
      </AuthGuard>
    </SiteLayout>
  );
}
