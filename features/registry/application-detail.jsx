"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, StatusBadge, LoadingState, ErrorState } from "@/components/shared";
import { registryApplicationsApi, getApiErrorMessage } from "@/lib/api";
import { APPLICATION_STATUS, APPLICATION_STATUS_META, DELIVERY_METHOD_LABELS, VISIBLE_APPLICATION_STATUSES } from "@/lib/constants";

// READY is now the terminal successful stage — documents ready for
// delivery/collection, nothing after it. There's no PAYMENT_REQUIRED_STATUSES
// check anymore: a submitted application is always already paid or free, by
// construction (see backend _apply_paystack_result).
const TERMINAL_STATUSES = [APPLICATION_STATUS.READY, APPLICATION_STATUS.REJECTED];
const SETTABLE_STATUSES = VISIBLE_APPLICATION_STATUSES;

export function RegistryApplicationDetail({ id }) {
  const [application, setApplication] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error

  const load = async () => {
    setLoadState("loading");
    try {
      const { data } = await registryApplicationsApi.get(id);
      setApplication(data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loadState === "loading") return <LoadingState message="Loading application…" />;
  if (loadState === "error") return <ErrorState onRetry={load} description="Could not load this application." />;

  const isTerminal = TERMINAL_STATUSES.includes(application.status);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Requested documents</CardTitle>
            <StatusBadge status={application.status} type="application" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {application.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.document_type_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>{Number(item.subtotal).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{Number(application.total_amount).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {application.status_history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {application.status_history.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 text-sm">
                    <StatusBadge status={entry.to_status} type="application" />
                    <div>
                      <p className="text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                        {entry.changed_by && ` — ${entry.changed_by}`}
                      </p>
                      {entry.remarks && <p className="mt-0.5">{entry.remarks}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {!isTerminal && <StatusUpdateForm application={application} onUpdated={setApplication} />}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Requested for</CardTitle>
            <Badge variant="outline">{application.is_self_request ? "Self" : "Third party"}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <InfoRow label="Name" value={application.subject_full_name || "—"} />
            <InfoRow label="Index / student number" value={application.subject_index_number || "—"} />
            <InfoRow label="Program" value={application.subject_program || "—"} />
            <InfoRow label="Year started" value={application.subject_year_started || "—"} />
            <InfoRow label="Year completed" value={application.subject_year_completed || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicant account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <InfoRow label="Name" value={application.applicant.full_name} />
            <InfoRow label="Email" value={application.applicant.email} />
            <InfoRow label="Phone" value={application.applicant.phone || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <InfoRow label="Application #" value={application.application_number} />
            <InfoRow label="Payment status" value={<StatusBadge status={application.payment_status} type="payment" />} />
            {application.payment && <InfoRow label="Payment reference" value={application.payment.reference} />}
            {application.payment?.paid_at && (
              <InfoRow label="Paid on" value={new Date(application.payment.paid_at).toLocaleString()} />
            )}
            <InfoRow label="Delivery method" value={DELIVERY_METHOD_LABELS[application.delivery_method]} />
            <InfoRow
              label="Submitted"
              value={application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "—"}
            />
            <InfoRow
              label="Est. completion"
              value={
                application.estimated_completion_date
                  ? new Date(application.estimated_completion_date).toLocaleDateString()
                  : "—"
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusUpdateForm({ application, onUpdated }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      status: application.status,
      remarks: "",
      estimated_completion_date: application.estimated_completion_date ?? "",
    },
  });
  const [selectedStatus, setSelectedStatus] = useState(application.status);

  const onSubmit = async (values) => {
    try {
      const { data } = await registryApplicationsApi.updateStatus(application.id, {
        status: selectedStatus,
        remarks: values.remarks,
        estimated_completion_date: values.estimated_completion_date || null,
      });
      onUpdated(data);
      toast.success("Application updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this application."));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="New status" htmlFor="status">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SETTABLE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {APPLICATION_STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Estimated completion date (optional)" htmlFor="estimated_completion_date">
            <Input id="estimated_completion_date" type="date" {...register("estimated_completion_date")} />
          </FormField>

          <FormField label="Remarks" htmlFor="remarks">
            <Textarea
              id="remarks"
              placeholder="Notes visible to the applicant, e.g. reason for rejection or pickup instructions."
              {...register("remarks")}
            />
          </FormField>

          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
