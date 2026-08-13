"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormField, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { applicationsApi, documentTypesApi, profileApi, getApiErrorMessage } from "@/lib/api";
import { DELIVERY_METHOD, DELIVERY_METHOD_LABELS } from "@/lib/constants";
import { useAuth } from "@/lib/auth/auth-context";

const REQUEST_FOR = { SELF: "self", OTHER: "other" };

const EMPTY_SUBJECT = {
  full_name: "",
  index_number: "",
  program: "",
  year_started: "",
  year_completed: "",
  phone: "",
  address: "",
};

function shapeProfileSubject(data) {
  return {
    full_name: data.full_name || "",
    index_number: data.profile?.index_number || "",
    program: data.profile?.program || "",
    year_started: data.profile?.year_started || "",
    year_completed: data.profile?.year_completed || "",
    phone: data.phone || "",
    address: data.profile?.address || "",
  };
}

function initialQuantities(items) {
  const map = {};
  for (const item of items ?? []) {
    map[item.document_type] = item.quantity;
  }
  return map;
}

/**
 * @param {{ mode: 'create' | 'edit', application?: object }} props
 */
export function ApplicationForm({ mode = "create", application }) {
  const router = useRouter();
  const { user } = useAuth();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [quantities, setQuantities] = useState(() => initialQuantities(application?.items));
  const [deliveryMethod, setDeliveryMethod] = useState(application?.delivery_method ?? DELIVERY_METHOD.EMAIL);
  const [requestFor, setRequestFor] = useState(
    application && application.is_self_request === false ? REQUEST_FOR.OTHER : REQUEST_FOR.SELF
  );
  const [subject, setSubject] = useState({
    full_name: application?.subject_full_name ?? "",
    index_number: application?.subject_index_number ?? "",
    program: application?.subject_program ?? "",
    year_started: application?.subject_year_started ?? "",
    year_completed: application?.subject_year_completed ?? "",
    phone: application?.subject_phone ?? "",
    address: application?.subject_address ?? "",
  });
  const [profileSubject, setProfileSubject] = useState(null);
  const [subjectErrors, setSubjectErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadDocumentTypes = async () => {
    setLoadState("loading");
    try {
      const { data } = await documentTypesApi.list();
      setDocumentTypes(data.results);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocumentTypes();
  }, []);

  useEffect(() => {
    // New applications pre-fill from the applicant's profile — these are
    // the details needed to actually retrieve the document, so defaulting
    // them here means most applicants never have to type them at all,
    // while still being free to override per application.
    if (mode !== "create") return;
    (async () => {
      try {
        const { data } = await profileApi.get();
        const shaped = shapeProfileSubject(data);
        setProfileSubject(shaped);
        setSubject((prev) => ({
          full_name: prev.full_name || shaped.full_name,
          index_number: prev.index_number || shaped.index_number,
          program: prev.program || shaped.program,
          year_started: prev.year_started || shaped.year_started,
          year_completed: prev.year_completed || shaped.year_completed,
          phone: prev.phone || shaped.phone,
          address: prev.address || shaped.address,
        }));
      } catch {
        // Prefill is a convenience — if it fails the applicant can still
        // fill these in by hand.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleRequestForChange = async (value) => {
    setRequestFor(value);
    setSubjectErrors({});
    if (value === REQUEST_FOR.OTHER) {
      setSubject(EMPTY_SUBJECT);
      return;
    }
    if (profileSubject) {
      setSubject(profileSubject);
      return;
    }
    try {
      const { data } = await profileApi.get();
      const shaped = shapeProfileSubject(data);
      setProfileSubject(shaped);
      setSubject(shaped);
    } catch {
      // Prefill is a convenience — if it fails the applicant can still fill
      // these in by hand.
    }
  };

  useEffect(() => {
    if (mode === "create" && user?.profile_complete === false) {
      toast.error("Complete your profile before starting a new application.");
      router.replace("/profile");
    }
  }, [mode, user, router]);

  const total = useMemo(() => {
    return documentTypes.reduce((sum, docType) => {
      const qty = quantities[docType.id] ?? 0;
      return sum + qty * Number(docType.price);
    }, 0);
  }, [documentTypes, quantities]);

  const setQuantity = (id, qty) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const setSubjectField = (field, value) => {
    setSubject((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const isSelf = requestFor === REQUEST_FOR.SELF;
    return {
      delivery_method: deliveryMethod,
      is_self_request: isSelf,
      subject_full_name: subject.full_name,
      subject_index_number: subject.index_number,
      subject_program: subject.program,
      subject_year_started: subject.year_started || null,
      subject_year_completed: subject.year_completed || null,
      subject_phone: subject.phone,
      subject_address: subject.address,
      items: Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([document_type, quantity]) => ({ document_type, quantity })),
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (payload.items.length === 0) {
      toast.error("Select at least one document before saving.");
      return;
    }

    // These are the details needed to actually retrieve the document —
    // required for every application, self or third-party.
    const errors = {};
    if (!payload.subject_full_name) errors.full_name = "Required.";
    if (!payload.subject_index_number) errors.index_number = "Required.";
    if (!payload.subject_program) errors.program = "Required.";
    if (!payload.subject_year_started) errors.year_started = "Required.";
    if (!payload.subject_year_completed) errors.year_completed = "Required.";
    if (!payload.subject_phone) errors.phone = "Required.";
    if (!payload.subject_address) errors.address = "Required.";
    setSubjectErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Fill in all required fields before saving.");
      return;
    }

    setSaving(true);
    try {
      const { data } =
        mode === "edit"
          ? await applicationsApi.update(application.id, payload)
          : await applicationsApi.create(payload);
      toast.success(mode === "edit" ? "Changes saved." : "Almost there — pay and submit to finish.");
      router.push(`/applications/${data.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save your application."));
    } finally {
      setSaving(false);
    }
  };

  if (mode === "create" && user?.profile_complete === false) {
    return <LoadingState message="Redirecting to your profile…" />;
  }

  if (loadState === "loading") return <LoadingState message="Loading available documents…" />;
  if (loadState === "error") return <ErrorState onRetry={loadDocumentTypes} />;
  if (!documentTypes.length) {
    return <EmptyState title="No documents available" description="Your institution hasn't configured any document types yet." />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Who is this for?</CardTitle>
            <CardDescription>
              These details are needed to retrieve the document — pre-filled from your profile, but you can adjust
              them for this application.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RadioGroup value={requestFor} onValueChange={handleRequestForChange} className="gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value={REQUEST_FOR.SELF} id="request-for-self" />
                <Label htmlFor="request-for-self" className="font-normal">
                  Myself
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={REQUEST_FOR.OTHER} id="request-for-other" />
                <Label htmlFor="request-for-other" className="font-normal">
                  Someone else
                </Label>
              </div>
            </RadioGroup>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="subject_full_name" error={subjectErrors.full_name}>
                <Input
                  id="subject_full_name"
                  value={subject.full_name}
                  onChange={(e) => setSubjectField("full_name", e.target.value)}
                />
              </FormField>
              <FormField label="Index number" htmlFor="subject_index_number" error={subjectErrors.index_number}>
                <Input
                  id="subject_index_number"
                  value={subject.index_number}
                  onChange={(e) => setSubjectField("index_number", e.target.value)}
                />
              </FormField>
              <FormField label="Program" htmlFor="subject_program" error={subjectErrors.program}>
                <Input
                  id="subject_program"
                  value={subject.program}
                  onChange={(e) => setSubjectField("program", e.target.value)}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Year started" htmlFor="subject_year_started" error={subjectErrors.year_started}>
                  <Input
                    id="subject_year_started"
                    type="number"
                    value={subject.year_started}
                    onChange={(e) => setSubjectField("year_started", e.target.value)}
                  />
                </FormField>
                <FormField label="Year completed" htmlFor="subject_year_completed" error={subjectErrors.year_completed}>
                  <Input
                    id="subject_year_completed"
                    type="number"
                    value={subject.year_completed}
                    onChange={(e) => setSubjectField("year_completed", e.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Phone number" htmlFor="subject_phone" error={subjectErrors.phone}>
                <Input
                  id="subject_phone"
                  type="tel"
                  value={subject.phone}
                  onChange={(e) => setSubjectField("phone", e.target.value)}
                />
              </FormField>
              <FormField label="Address / location" htmlFor="subject_address" error={subjectErrors.address}>
                <Input
                  id="subject_address"
                  value={subject.address}
                  onChange={(e) => setSubjectField("address", e.target.value)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select documents</CardTitle>
            <CardDescription>Choose the documents you need and how many of each.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {documentTypes.map((docType) => (
              <div key={docType.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{docType.name}</p>
                  {docType.description && <p className="text-sm text-muted-foreground">{docType.description}</p>}
                  <p className="mt-1 text-sm text-muted-foreground">{Number(docType.price).toFixed(2)} each</p>
                </div>
                <QuantityStepper
                  value={quantities[docType.id] ?? 0}
                  onChange={(qty) => setQuantity(docType.id, qty)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery method</CardTitle>
            <CardDescription>Applies to every document in this application.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="gap-3">
              {Object.values(DELIVERY_METHOD).map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem value={value} id={`delivery-${value}`} />
                  <Label htmlFor={`delivery-${value}`} className="font-normal">
                    {DELIVERY_METHOD_LABELS[value]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">{total.toFixed(2)}</span>
            </div>
            <Separator />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Continue"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {total > 0
                ? "You'll pay and submit from the application page after saving."
                : "This request has no fee — you can submit it directly from the application page."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuantityStepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-6 text-center tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
