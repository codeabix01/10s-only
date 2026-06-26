"use client";

import { SiteLayout } from "@/components/site/site-layout";
import { AuthGuard } from "@/components/site/auth-guard";
import { BecomeHostSection } from "@/components/apply/become-host-section";

export default function BecomeHostPage() {
  return (
    <SiteLayout>
      <AuthGuard requireRole="member">
        <BecomeHostSection />
      </AuthGuard>
    </SiteLayout>
  );
}
