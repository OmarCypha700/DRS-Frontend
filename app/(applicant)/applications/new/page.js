import { PageHeader } from "@/components/layout/page-header";
import { ApplicationForm } from "@/features/applications/application-form";

export const metadata = { title: "New Application — Document Request System" };

export default function NewApplicationPage() {
  return (
    <>
      <PageHeader title="New Application" description="Request one or more official documents." />
      <ApplicationForm mode="create" />
    </>
  );
}
