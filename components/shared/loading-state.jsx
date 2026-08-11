import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/** Row-shaped skeleton for tables/lists while data is loading. */
export function LoadingRows({ count = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
