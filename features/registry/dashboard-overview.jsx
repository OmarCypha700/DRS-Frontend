"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Search } from "lucide-react";
import { StatCard, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { registryApplicationsApi } from "@/lib/api";
import { APPLICATION_STATUS } from "@/lib/constants";

export function RegistryDashboardOverview() {
  const [state, setState] = useState("loading"); // loading | ready | error
  const [counts, setCounts] = useState({ submitted: 0, underReview: 0, ready: 0 });
  const [recent, setRecent] = useState([]);

  const load = async () => {
    setState("loading");
    try {
      const [submittedRes, underReviewRes, readyRes, recentRes] = await Promise.all([
        registryApplicationsApi.list({ page_size: 1, status: APPLICATION_STATUS.SUBMITTED }),
        registryApplicationsApi.list({ page_size: 1, status: APPLICATION_STATUS.UNDER_REVIEW }),
        registryApplicationsApi.list({ page_size: 1, status: APPLICATION_STATUS.READY }),
        registryApplicationsApi.list({ page_size: 5 }),
      ]);
      setCounts({
        submitted: submittedRes.data.count,
        underReview: underReviewRes.data.count,
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

  if (state === "loading") return <LoadingState message="Loading applications…" />;
  if (state === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={counts.submitted} icon={ClipboardList} />
        <StatCard label="Under review" value={counts.underReview} icon={Search} />
        <StatCard label="Ready" value={counts.ready} icon={CheckCircle2} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent applications</h2>
        {recent.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No applications yet"
            description="Submitted applications will show up here for processing."
          />
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {recent.map((app) => (
              <Link
                key={app.id}
                href={`/registry/applications/${app.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{app.application_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.applicant.full_name} · {app.item_count} document{app.item_count === 1 ? "" : "s"}
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
