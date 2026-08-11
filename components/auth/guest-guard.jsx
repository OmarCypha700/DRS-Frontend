"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { LoadingState } from "@/components/shared";
import { ROLES } from "@/lib/constants";

const HOME_BY_ROLE = {
  [ROLES.APPLICANT]: "/dashboard",
  [ROLES.REGISTRY_OFFICER]: "/registry/dashboard",
};

/**
 * The inverse of RoleGuard — for pages that only make sense to a logged-out
 * visitor (login, register). An already-authenticated user is bounced to
 * their dashboard (or `next`, if the login page was itself reached via a
 * `next` redirect) instead of seeing the form again.
 */
export function GuestGuard({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(searchParams.get("next") || HOME_BY_ROLE[user.role] || "/");
  }, [isLoading, user, router, searchParams]);

  if (isLoading) return <LoadingState message="Checking your session…" />;
  if (user) return <LoadingState message="Redirecting…" />;

  return children;
}
