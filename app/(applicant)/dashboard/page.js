"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardOverview } from "@/features/applications/dashboard-overview";
import { useAuth } from "@/lib/auth/auth-context";

export default function ApplicantDashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ""}`}
        description="Track and manage your document requests."
        actions={
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="mr-2 size-4" />
              New Application
            </Link>
          </Button>
        }
      />
      <DashboardOverview />
    </>
  );
}
