import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/features/profile/profile-form";

export const metadata = { title: "Profile — Document Request System" };

export default function RegistryProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information." />
      <ProfileForm />
    </>
  );
}
