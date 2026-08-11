import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ApplicationsList } from "@/features/applications/applications-list";

export const metadata = { title: "My Applications — Document Request System" };

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        title="My Applications"
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
      <ApplicationsList />
    </>
  );
}
