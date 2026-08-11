"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, FilterBar, SearchInput, PaginationControl, StatusBadge } from "@/components/shared";
import { applicationsApi } from "@/lib/api";
import { APPLICATION_STATUS_META, DELIVERY_METHOD_LABELS, VISIBLE_APPLICATION_STATUSES } from "@/lib/constants";

const COLUMNS = [
  { key: "application_number", header: "Application #" },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} type="application" />,
  },
  { key: "item_count", header: "Items" },
  {
    key: "delivery_method",
    header: "Delivery",
    render: (row) => DELIVERY_METHOD_LABELS[row.delivery_method] ?? row.delivery_method,
  },
  {
    key: "total_amount",
    header: "Total",
    render: (row) => Number(row.total_amount).toFixed(2),
  },
  {
    key: "created_at",
    header: "Created",
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
];

export function ApplicationsList() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestState, setRequestState] = useState("loading"); // loading | ready | error

  const load = async () => {
    setRequestState("loading");
    try {
      const { data } = await applicationsApi.list({
        page,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
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
  }, [page, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={search}
          onSearch={(value) => {
            setPage(1);
            setSearch(value);
          }}
          placeholder="Search by application number…"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {VISIBLE_APPLICATION_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {APPLICATION_STATUS_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={requestState === "loading"}
        isError={requestState === "error"}
        onRetry={load}
        onRowClick={(row) => router.push(`/applications/${row.id}`)}
        emptyTitle="No applications found"
        emptyDescription="Try adjusting your search or filters, or create a new application."
      />

      <PaginationControl currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
