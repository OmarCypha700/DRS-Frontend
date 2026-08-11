"use client";

import { Bell, FileText, LayoutDashboard, User } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RoleGuard } from "@/components/auth/role-guard";
import { ProfileCompletionDialog } from "@/components/shared";
import { ROLES } from "@/lib/constants";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export default function ApplicantLayout({ children }) {
  return (
    <RoleGuard role={ROLES.APPLICANT}>
      <AppShell
        sidebarItems={SIDEBAR_ITEMS}
        mobileNav="bottom"
        navActions={
          <>
            {/* The bottom nav's own Notifications tab replaces this on mobile. */}
            <div className="hidden md:flex">
              <NotificationBell />
            </div>
            <AuthNavActions />
          </>
        }
      >
        {children}
        <ProfileCompletionDialog />
      </AppShell>
    </RoleGuard>
  );
}
