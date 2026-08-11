"use client";

import { BarChart3, Bell, ClipboardList, LayoutDashboard, User } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RoleGuard } from "@/components/auth/role-guard";
import { ROLES } from "@/lib/constants";

const SIDEBAR_ITEMS = [
  { href: "/registry/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registry/applications", label: "Applications", icon: ClipboardList },
  { href: "/registry/notifications", label: "Notifications", icon: Bell },
  { href: "/registry/reports", label: "Reports", icon: BarChart3 },
  { href: "/registry/profile", label: "Profile", icon: User },
];

export default function RegistryLayout({ children }) {
  return (
    <RoleGuard role={ROLES.REGISTRY_OFFICER}>
      <AppShell
        sidebarItems={SIDEBAR_ITEMS}
        navActions={
          <>
            <NotificationBell />
            <AuthNavActions />
          </>
        }
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
