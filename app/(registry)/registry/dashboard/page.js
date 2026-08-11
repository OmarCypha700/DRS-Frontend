"use client";

import { PageHeader } from "@/components/layout/page-header";
import { RegistryDashboardOverview } from "@/features/registry/dashboard-overview";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegistryDashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ""}`}
        description="Review and process incoming document requests."
      />
      <RegistryDashboardOverview />
    </>
  );
}
