"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { ROLES } from "@/lib/constants";

export function NotificationBell() {
  const { user } = useAuth();
  const { count: unreadCount, setCount: setUnreadCount } = useUnreadCount({ enabled: Boolean(user) });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadRecent = async () => {
    setLoading(true);
    try {
      const { data } = await notificationsApi.list({ page_size: 6 });
      setNotifications(data.results);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) loadRecent();
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationsApi.markRead(id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await notificationsApi.markAllRead().catch(() => {});
  };

  if (!user) return null;

  const allHref = user.role === ROLES.REGISTRY_OFFICER ? "/registry/notifications" : "/notifications";

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-0 p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={handleMarkAllRead}>
              <Check className="mr-1 size-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="border-t" />
        <ScrollArea className="max-h-80">
          {loading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted/50",
                  !n.is_read && "bg-muted/30"
                )}
              >
                <span className="font-medium">{n.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
              </button>
            ))
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Link href={allHref} className="block text-center text-xs text-muted-foreground hover:text-foreground">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
