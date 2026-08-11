import { Suspense } from "react";
import { PaymentCallback } from "@/features/payments/payment-callback";
import { LoadingState } from "@/components/shared";

export const metadata = { title: "Payment — Document Request System" };

export default function PaymentCallbackPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoadingState message="Loading…" />}>
          <PaymentCallback />
        </Suspense>
      </div>
    </div>
  );
}
