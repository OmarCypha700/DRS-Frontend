"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Mobile tab bar for the applicant portal — replaces the hamburger drawer
 * on small screens with a native-app-style bottom nav. Registry keeps the
 * drawer (see MobileNav); this is intentionally applicant-only.
 *
 * @param {{ items: { href: string, label: string, icon: React.ComponentType }[] }} props
 */
export function BottomNav({ items }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadCount({ enabled: Boolean(user) });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] supports-[backdrop-filter]:bg-background/80 md:hidden"
      aria-label="Primary"
    >
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const isNotifications = label === "Notifications";
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                {Icon && <Icon className="size-5" />}
                {isNotifications && unreadCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full border-0 p-0 text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
