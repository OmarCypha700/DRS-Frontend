import { PageHeader } from "@/components/layout/page-header";
import { RegistryApplicationsList } from "@/features/registry/applications-list";

export const metadata = { title: "Applications — Document Request System" };

export default function RegistryApplicationsPage() {
  return (
    <>
      <PageHeader title="Applications" description="Review and process document requests for your institution." />
      <RegistryApplicationsList />
    </>
  );
}
