"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Send } from "lucide-react";
import { StatCard, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { applicationsApi } from "@/lib/api";
import { APPLICATION_STATUS } from "@/lib/constants";

export function DashboardOverview() {
  const [state, setState] = useState("loading"); // loading | ready | error
  const [counts, setCounts] = useState({ total: 0, submitted: 0, ready: 0 });
  const [recent, setRecent] = useState([]);

  const load = async () => {
    setState("loading");
    try {
      const [totalRes, submittedRes, readyRes, recentRes] = await Promise.all([
        applicationsApi.list({ page_size: 1 }),
        applicationsApi.list({ page_size: 1, status: APPLICATION_STATUS.SUBMITTED }),
        applicationsApi.list({ page_size: 1, status: APPLICATION_STATUS.READY }),
        applicationsApi.list({ page_size: 5 }),
      ]);
      setCounts({
        total: totalRes.data.count,
        submitted: submittedRes.data.count,
        ready: readyRes.data.count,
      });
      setRecent(recentRes.data.results);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (state === "loading") return <LoadingState message="Loading your applications…" />;
  if (state === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total applications" value={counts.total} icon={FileText} />
        <StatCard label="Awaiting review" value={counts.submitted} icon={Send} />
        <StatCard label="Ready" value={counts.ready} icon={CheckCircle2} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent applications</h2>
        {recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Document requests will show up here once you submit one."
          />
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {recent.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{app.application_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.item_count} document{app.item_count === 1 ? "" : "s"} · {Number(app.total_amount).toFixed(2)}
                  </p>
                </div>
                <StatusBadge status={app.status} type="application" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
