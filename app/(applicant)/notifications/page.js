import { PageHeader } from "@/components/layout/page-header";
import { NotificationsList } from "@/features/notifications/notifications-list";

export const metadata = { title: "Notifications — Document Request System" };

export default function ApplicantNotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Updates about your document requests." />
      <NotificationsList />
    </>
  );
}
