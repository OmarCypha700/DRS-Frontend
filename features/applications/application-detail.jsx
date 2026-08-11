"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, StatusBadge, LoadingState, ErrorState } from "@/components/shared";
import { ApplicationForm } from "./application-form";
import { applicationsApi, paymentsApi, getApiErrorMessage } from "@/lib/api";
import {
  APPLICANT_DELETABLE_STATUSES,
  APPLICATION_STATUS,
  DELIVERY_METHOD_LABELS,
  PAYMENT_STATUS,
} from "@/lib/constants";

// The details needed to actually retrieve the document — same set the
// application form requires before it'll save. Checked here too so "Pay
// and Submit" can't be clicked on a draft that was saved before this
// requirement existed.
const REQUIRED_SUBJECT_FIELDS = [
  "subject_full_name",
  "subject_index_number",
  "subject_program",
  "subject_year_completed",
  "subject_phone",
  "subject_address",
];

export function ApplicationDetail({ id }) {
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoadState("loading");
    try {
      const { data } = await applicationsApi.get(id);
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

  const handleDelete = async () => {
    setCancelling(true);
    try {
      await applicationsApi.remove(id);
      toast.success("Application deleted.");
      router.push("/applications");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this application."));
      setCancelling(false);
    }
  };

  const handlePayAndSubmit = async () => {
    setProcessing(true);
    try {
      if (Number(application.total_amount) === 0) {
        await applicationsApi.submit(id);
        toast.success("Application submitted.");
        await load();
        setProcessing(false);
        return;
      }
      const { data } = await paymentsApi.initialize(id);
      // Full redirect (not router.push) — Paystack's hosted checkout lives
      // on their domain, not ours. The application is auto-submitted
      // server-side once payment is confirmed on return.
      window.location.href = data.authorization_url;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start payment and submission."));
      setProcessing(false);
    }
  };

  if (loadState === "loading") return <LoadingState message="Loading application…" />;
  if (loadState === "error") return <ErrorState onRetry={load} description="Could not load this application." />;

  // A submitted application is always already paid or free, by construction
  // (see backend _apply_paystack_result) — a paid one is no longer
  // self-service deletable, matching ApplicationViewSet.destroy.
  const isDeletable =
    APPLICANT_DELETABLE_STATUSES.includes(application.status) &&
    !(application.status === APPLICATION_STATUS.SUBMITTED && application.payment_status === PAYMENT_STATUS.PAID);
  const isFree = Number(application.total_amount) === 0;
  const hasItems = application.items?.length > 0 || application.item_count > 0;
  const isComplete =
    hasItems && REQUIRED_SUBJECT_FIELDS.every((field) => Boolean(application[field]));

  if (application.status === APPLICATION_STATUS.DRAFT) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pay &amp; submit</CardTitle>
            <CardDescription>
              {isFree
                ? "This request has no fee — submit it whenever you're ready."
                : "Paying submits this application automatically — there's no separate submit step."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">{Number(application.total_amount).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePayAndSubmit} disabled={processing || !isComplete}>
                {processing ? "Processing…" : isFree ? "Submit" : "Pay and Submit"}
              </Button>
              {isDeletable && (
                <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
                  Delete draft
                </Button>
              )}
            </div>
            {!isComplete && (
              <p className="text-xs text-muted-foreground">
                Fill in all required fields below and select at least one document before you can
                {isFree ? " submit." : " pay and submit."}
              </p>
            )}
          </CardContent>
        </Card>

        <ApplicationForm mode="edit" application={application} />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this draft?"
          description="This draft application will be permanently deleted. You can always start a new one."
          confirmLabel="Delete draft"
          destructive
          loading={cancelling}
          onConfirm={handleDelete}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <InfoRow label="Application #" value={application.application_number} />
          <InfoRow label="Requested for" value={application.subject_full_name || "—"} />
          <InfoRow label="Index number" value={application.subject_index_number || "—"} />
          <InfoRow label="Program" value={application.subject_program || "—"} />
          <InfoRow label="Year completed" value={application.subject_year_completed || "—"} />
          <InfoRow label="Phone" value={application.subject_phone || "—"} />
          <InfoRow label="Address" value={application.subject_address || "—"} />
          <Separator />
          <InfoRow label="Payment status" value={<StatusBadge status={application.payment_status} type="payment" />} />
          {application.payment && (
            <InfoRow label="Payment reference" value={application.payment.reference} />
          )}
          {application.payment?.paid_at && (
            <InfoRow label="Paid on" value={new Date(application.payment.paid_at).toLocaleString()} />
          )}
          <Separator />
          <InfoRow label="Delivery method" value={DELIVERY_METHOD_LABELS[application.delivery_method]} />
          <InfoRow label="Submitted" value={application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "—"} />
          <InfoRow
            label="Est. completion"
            value={application.estimated_completion_date ? new Date(application.estimated_completion_date).toLocaleDateString() : "—"}
          />
          {application.remarks && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground">Remarks</p>
                <p className="mt-1">{application.remarks}</p>
              </div>
            </>
          )}
          {isDeletable && (
            <>
              <Separator />
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                Delete application
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this application?"
        description="This cannot be undone. You'll need to submit a new application if you change your mind."
        confirmLabel="Delete application"
        destructive
        loading={cancelling}
        onConfirm={handleDelete}
      />
    </div>
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
