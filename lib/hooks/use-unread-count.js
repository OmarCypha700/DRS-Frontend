"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api";

const POLL_INTERVAL_MS = 60_000;

/**
 * Polls the unread notification count so the navbar bell and the mobile
 * bottom-nav badge (and anything else that needs it) never drift out of
 * sync — each caller gets its own poll loop, but they all read the same
 * endpoint on the same cadence.
 *
 * @param {{ enabled?: boolean }} [options]
 */
export function useUnreadCount({ enabled = true } = {}) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await notificationsApi.unreadCount();
      setCount(data.count);
    } catch {
      // Silent — the badge just won't update this cycle, not worth a toast.
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  // Keeps the installed PWA's OS-level icon badge (Badging API) in sync
  // with whatever this hook last learned the unread count to be — every
  // path that changes `count` (polling, mark-read, mark-all-read) flows
  // through this same state, so there's one place that needs to know about
  // the badge rather than scattering setAppBadge calls at every call site.
  // No-ops harmlessly where the Badging API isn't supported (e.g. iOS).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("setAppBadge" in navigator)) return;
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [count]);

  return { count, setCount, refresh };
}
