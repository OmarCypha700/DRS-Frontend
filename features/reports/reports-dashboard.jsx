"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Banknote, ClipboardList, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, ErrorState, LoadingState } from "@/components/shared";
import { BarList } from "./bar-list";
import { reportsApi, getApiErrorMessage } from "@/lib/api";

export function ReportsDashboard() {
  const [submittedAfter, setSubmittedAfter] = useState("");
  const [submittedBefore, setSubmittedBefore] = useState("");
  const [report, setReport] = useState(null);
  const [requestState, setRequestState] = useState("loading"); // loading | ready | error
  const [exporting, setExporting] = useState(null); // null | 'csv' | 'xlsx'

  const filterParams = {
    submitted_after: submittedAfter || undefined,
    submitted_before: submittedBefore || undefined,
  };

  const load = async () => {
    setRequestState("loading");
    try {
      const { data } = await reportsApi.summary(filterParams);
      setReport(data);
      setRequestState("ready");
    } catch {
      setRequestState("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedAfter, submittedBefore]);

  const handleExport = async (fileType) => {
    setExporting(fileType);
    try {
      await reportsApi.export(filterParams, fileType);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not export the report."));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-after" className="text-xs text-muted-foreground">
            Submitted from
          </Label>
          <Input id="report-after" type="date" value={submittedAfter} onChange={(e) => setSubmittedAfter(e.target.value)} className="w-40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-before" className="text-xs text-muted-foreground">
            Submitted to
          </Label>
          <Input id="report-before" type="date" value={submittedBefore} onChange={(e) => setSubmittedBefore(e.target.value)} className="w-40" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting !== null}>
            {exporting === "csv" ? "Exporting…" : "Export CSV"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")} disabled={exporting !== null}>
            {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
          </Button>
        </div>
      </div>

      {requestState === "loading" && <LoadingState message="Building report…" />}
      {requestState === "error" && <ErrorState onRetry={load} />}

      {requestState === "ready" && report && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Applications" value={report.total_applications} icon={ClipboardList} />
            <StatCard label="Revenue collected" value={Number(report.total_revenue).toFixed(2)} icon={Banknote} />
            <StatCard label="Pending payments" value={Number(report.pending_revenue).toFixed(2)} icon={HandCoins} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By status</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList items={report.status_breakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By payment status</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={report.payment_status_breakdown}
                  valueKey="amount"
                  formatValue={(v) => v.toFixed(2)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By delivery method</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList items={report.delivery_method_breakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By document type (revenue)</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={report.document_type_breakdown}
                  labelKey="document_type"
                  valueKey="revenue"
                  formatValue={(v) => v.toFixed(2)}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
