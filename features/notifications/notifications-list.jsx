"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState, PaginationControl } from "@/components/shared";
import { cn } from "@/lib/utils";
import { notificationsApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLES } from "@/lib/constants";

export function NotificationsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all | unread
  const [requestState, setRequestState] = useState("loading"); // loading | ready | error

  const load = async () => {
    setRequestState("loading");
    try {
      const { data } = await notificationsApi.list({ page, is_read: filter === "unread" ? false : undefined });
      setRows(data.results);
      setTotalPages(data.total_pages);
      setRequestState("ready");
    } catch {
      setRequestState("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const applicationHref = (appId) => {
    const base = user?.role === ROLES.REGISTRY_OFFICER ? "/registry/applications" : "/applications";
    return `${base}/${appId}`;
  };

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      setRows((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
      await notificationsApi.markRead(notification.id).catch(() => {});
    }
    if (notification.application) {
      router.push(applicationHref(notification.application));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setRows((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not mark notifications as read."));
    }
  };

  if (requestState === "loading") return <LoadingState message="Loading notifications…" />;
  if (requestState === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Select
          value={filter}
          onValueChange={(value) => {
            setPage(1);
            setFilter(value);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <Check className="mr-2 size-4" />
          Mark all read
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {rows.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              className={cn("flex flex-col gap-1 p-4 text-left hover:bg-muted/50", !n.is_read && "bg-muted/30")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{n.title}</span>
                {!n.is_read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      <PaginationControl currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
