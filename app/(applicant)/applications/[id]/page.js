import { PageHeader } from "@/components/layout/page-header";
import { ApplicationDetail } from "@/features/applications/application-detail";

export const metadata = { title: "Application — Document Request System" };

export default async function ApplicationDetailPage({ params }) {
  const { id } = await params;

  return (
    <>
      <PageHeader title="Application" description="Track and manage this document request." />
      <ApplicationDetail id={id} />
    </>
  );
}
