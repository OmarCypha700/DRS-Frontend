import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/register-form";
import { GuestGuard } from "@/components/auth/guest-guard";

export const metadata = { title: "Create account — Document Request System" };

export default function RegisterPage() {
  return (
    <Suspense>
      <GuestGuard>
        <RegisterForm />
      </GuestGuard>
    </Suspense>
  );
}
