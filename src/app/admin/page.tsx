"use client";

import { SiteLayout } from "@/components/site/site-layout";
import { AuthGuard } from "@/components/site/auth-guard";
import { AdminConsole } from "@/components/admin/admin-console";

export default function AdminPage() {
  return (
    <SiteLayout>
      <AuthGuard requireRole="admin">
        <AdminConsole />
      </AuthGuard>
    </SiteLayout>
  );
}
