"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { LoadingState } from "@/components/shared";
import { ROLES } from "@/lib/constants";

const HOME_BY_ROLE = {
  [ROLES.APPLICANT]: "/dashboard",
  [ROLES.REGISTRY_OFFICER]: "/registry/dashboard",
};

/**
 * Client-side authorization gate. This is UX only — the real security
 * boundary is enforced by DRF permission classes on every API call, so a
 * user who bypasses this guard still can't read or write data they
 * shouldn't.
 *
 * @param {{ role: string, children: React.ReactNode }} props
 */
export function RoleGuard({ role, children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = !isLoading && user && user.role === role;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Preserve where they were headed — LoginForm already reads `next`
      // and sends them back here on success instead of dumping them on
      // their role's dashboard, this is just the only place that was ever
      // setting it.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== role) {
      router.replace(HOME_BY_ROLE[user.role] ?? "/login");
    }
  }, [isLoading, user, role, router, pathname]);

  if (!isAuthorized) {
    return <LoadingState message="Checking your session…" />;
  }

  return children;
}
