"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared";
import { paymentsApi, getApiErrorMessage } from "@/lib/api";
import { PAYMENT_STATUS } from "@/lib/constants";

export function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [state, setState] = useState("verifying"); // verifying | success | failed | error
  const [payment, setPayment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const verify = async () => {
    if (!reference) {
      setState("error");
      setErrorMessage("No payment reference was provided.");
      return;
    }
    try {
      const { data } = await paymentsApi.verify(reference);
      setPayment(data);
      setState(data.status === PAYMENT_STATUS.PAID ? "success" : "failed");
    } catch (error) {
      setState("error");
      setErrorMessage(getApiErrorMessage(error, "Could not verify your payment."));
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  if (state === "verifying") {
    return <LoadingState message="Confirming your payment…" />;
  }

  const applicationHref = payment ? `/applications/${payment.application}` : "/applications";

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <div>
          <h1 className="text-xl font-semibold">Payment successful</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your application has been paid for and submitted.</p>
        </div>
        <Button asChild>
          <Link href={applicationHref}>View application</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <XCircle className="size-12 text-destructive" />
      <div>
        <h1 className="text-xl font-semibold">
          {state === "failed" ? "Payment unsuccessful" : "Payment could not be confirmed"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {state === "failed" ? "Your payment wasn't completed. You can try again from the application." : errorMessage}
        </p>
      </div>
      <Button asChild>
        <Link href={applicationHref}>Back to application</Link>
      </Button>
    </div>
  );
}
