export const APPLICATION_STATUS = {
  // Internal-only pre-payment state — never a status filter option, never
  // shown to registry. See apps/applications/constants.py on the backend.
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  READY: "ready",
  REJECTED: "rejected",
};

// The four applicant/registry-facing lifecycle stages — excludes DRAFT,
// which is only ever an implementation detail of the pay-and-submit flow.
export const VISIBLE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.READY,
  APPLICATION_STATUS.REJECTED,
];

export const APPLICATION_STATUS_META = {
  [APPLICATION_STATUS.DRAFT]: { label: "Draft", className: "bg-muted text-muted-foreground" },
  [APPLICATION_STATUS.SUBMITTED]: { label: "Submitted", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  [APPLICATION_STATUS.UNDER_REVIEW]: { label: "Under Review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  [APPLICATION_STATUS.READY]: { label: "Ready", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  [APPLICATION_STATUS.REJECTED]: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
};

// Mirrors backend APPLICANT_DELETABLE_STATUSES — once registry starts
// working an application, only registry can change it further. Cancelling
// hard-deletes the application (see applicationsApi.remove), it's not a
// status of its own.
export const APPLICANT_DELETABLE_STATUSES = [APPLICATION_STATUS.DRAFT, APPLICATION_STATUS.SUBMITTED];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS_META = {
  [PAYMENT_STATUS.PENDING]: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  [PAYMENT_STATUS.PAID]: { label: "Paid", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  [PAYMENT_STATUS.FAILED]: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  [PAYMENT_STATUS.REFUNDED]: { label: "Refunded", className: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
};

export const DELIVERY_METHOD = {
  EMAIL: "email",
  PHYSICAL_COLLECTION: "physical_collection",
};

export const DELIVERY_METHOD_LABELS = {
  [DELIVERY_METHOD.EMAIL]: "Email",
  [DELIVERY_METHOD.PHYSICAL_COLLECTION]: "Physical Collection",
};
