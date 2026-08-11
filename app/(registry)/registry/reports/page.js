import { PageHeader } from "@/components/layout/page-header";
import { ReportsDashboard } from "@/features/reports/reports-dashboard";

export const metadata = { title: "Reports — Document Request System" };

export default function RegistryReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Revenue and application volume for your institution." />
      <ReportsDashboard />
    </>
  );
}
