import { PageHeader } from "@/components/layout/page-header";
import { NotificationsList } from "@/features/notifications/notifications-list";

export const metadata = { title: "Notifications — Document Request System" };

export default function RegistryNotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Applications that need your attention." />
      <NotificationsList />
    </>
  );
}
