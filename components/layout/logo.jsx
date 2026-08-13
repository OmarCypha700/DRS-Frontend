import { cn } from "@/lib/utils";

/**
 * Standalone mark — a geometric "D" built from stacked document lines. Used
 * on its own (small/icon contexts) and inside `Logo` (navbar/auth header).
 */
export function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16,46 V10 H26 Q40,10 40,28 Q40,46 26,46 Z" strokeWidth="3.5" />
      <path d="M22,19 H30 M22,28 H35 M22,37 H30" strokeWidth="3" />
    </svg>
  );
}

export function Logo({ className }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2 font-semibold", className)}>
      <LogoMark className="size-5 shrink-0 text-primary" />
      <span>DRS</span>
    </span>
  );
}
