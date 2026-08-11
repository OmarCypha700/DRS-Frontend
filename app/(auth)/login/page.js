import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { GuestGuard } from "@/components/auth/guest-guard";

export const metadata = { title: "Sign in — Document Request System" };

export default function LoginPage() {
  return (
    <Suspense>
      <GuestGuard>
        <LoginForm />
      </GuestGuard>
    </Suspense>
  );
}
