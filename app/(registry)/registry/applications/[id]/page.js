import { PageHeader } from "@/components/layout/page-header";
import { RegistryApplicationDetail } from "@/features/registry/application-detail";

export const metadata = { title: "Application — Document Request System" };

export default async function RegistryApplicationDetailPage({ params }) {
  const { id } = await params;

  return (
    <>
      <PageHeader title="Application" description="Review and update this document request." />
      <RegistryApplicationDetail id={id} />
    </>
  );
}
