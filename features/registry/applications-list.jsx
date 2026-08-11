"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, FilterBar, SearchInput, PaginationControl, StatusBadge } from "@/components/shared";
import { registryApplicationsApi, getApiErrorMessage } from "@/lib/api";
import { APPLICATION_STATUS, APPLICATION_STATUS_META, DELIVERY_METHOD_LABELS, VISIBLE_APPLICATION_STATUSES } from "@/lib/constants";

const REVIEWABLE_STATUSES = VISIBLE_APPLICATION_STATUSES;

const COLUMNS = [
  { key: "application_number", header: "Application #" },
  {
    key: "applicant",
    header: "Applicant",
    render: (row) => (
      <div>
        <p className="font-medium">{row.applicant.full_name}</p>
        <p className="text-xs text-muted-foreground">{row.applicant.email}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} type="application" />,
  },
  {
    key: "payment_status",
    header: "Payment",
    render: (row) => <StatusBadge status={row.payment_status} type="payment" />,
  },
  {
    key: "delivery_method",
    header: "Delivery",
    className: "hidden md:table-cell",
    render: (row) => DELIVERY_METHOD_LABELS[row.delivery_method] ?? row.delivery_method,
  },
  {
    key: "total_amount",
    header: "Total",
    render: (row) => Number(row.total_amount).toFixed(2),
  },
  {
    key: "submitted_at",
    header: "Submitted",
    className: "hidden md:table-cell",
    render: (row) => (row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : "—"),
  },
];

export function RegistryApplicationsList() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submittedAfter, setSubmittedAfter] = useState("");
  const [submittedBefore, setSubmittedBefore] = useState("");
  const [requestState, setRequestState] = useState("loading"); // loading | ready | error
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // null | 'csv' | 'xlsx'

  const filterParams = {
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    submitted_after: submittedAfter || undefined,
    submitted_before: submittedBefore || undefined,
  };

  const load = async () => {
    setRequestState("loading");
    try {
      const { data } = await registryApplicationsApi.list({ page, ...filterParams });
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
  }, [page, search, statusFilter, submittedAfter, submittedBefore]);

  const resetToPageOne = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  const handleExport = async (fileType, useSelection) => {
    setExporting(fileType);
    try {
      await registryApplicationsApi.export({
        ids: useSelection ? selectedIds : undefined,
        filterParams,
        fileType,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not export applications."));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={search}
          onSearch={resetToPageOne(setSearch)}
          placeholder="Search by applicant or application number…"
        />
        <Select value={statusFilter} onValueChange={resetToPageOne(setStatusFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {REVIEWABLE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {APPLICATION_STATUS_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="submitted-after" className="text-xs text-muted-foreground">
            Submitted from
          </Label>
          <Input
            id="submitted-after"
            type="date"
            value={submittedAfter}
            onChange={(e) => resetToPageOne(setSubmittedAfter)(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="submitted-before" className="text-xs text-muted-foreground">
            Submitted to
          </Label>
          <Input
            id="submitted-before"
            type="date"
            value={submittedBefore}
            onChange={(e) => resetToPageOne(setSubmittedBefore)(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleExport("csv", false)}
            disabled={exporting !== null}
          >
            {exporting === "csv" ? "Exporting…" : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleExport("xlsx", false)}
            disabled={exporting !== null}
          >
            {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" onClick={() => setBulkDialogOpen(true)}>
            Update status
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("csv", true)} disabled={exporting !== null}>
            Export selected (CSV)
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("xlsx", true)} disabled={exporting !== null}>
            Export selected (Excel)
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={requestState === "loading"}
        isError={requestState === "error"}
        onRetry={load}
        onRowClick={(row) => router.push(`/registry/applications/${row.id}`)}
        emptyTitle="No applications found"
        emptyDescription="Try adjusting your search or filters."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <PaginationControl currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <BulkStatusDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        count={selectedIds.length}
        onConfirm={async (status, remarks) => {
          try {
            const { data } = await registryApplicationsApi.bulkUpdateStatus({ ids: selectedIds, status, remarks });
            if (data.failed.length > 0) {
              toast.warning(`${data.updated.length} updated, ${data.failed.length} could not be changed.`);
            } else {
              toast.success(`${data.updated.length} application(s) updated.`);
            }
            setBulkDialogOpen(false);
            setSelectedIds([]);
            await load();
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not update the selected applications."));
          }
        }}
      />
    </div>
  );
}

function BulkStatusDialog({ open, onOpenChange, count, onConfirm }) {
  const [status, setStatus] = useState(APPLICATION_STATUS.UNDER_REVIEW);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(status, remarks);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update {count} application{count === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>
            Applications that can&apos;t move to this status (e.g. already completed, or unpaid) will be skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-status">New status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="bulk-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REVIEWABLE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {APPLICATION_STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-remarks">Remarks (optional)</Label>
            <Textarea id="bulk-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Updating…" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
