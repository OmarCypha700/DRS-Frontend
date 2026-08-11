"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

const DISMISS_KEY = "drs:profile-completion-prompt-dismissed";

/**
 * Prompts an applicant to finish their profile (index number, program,
 * phone, address) once per session — those details are required to submit
 * an application, so this catches it right after login instead of only
 * failing later at submission time.
 */
export function ProfileCompletionDialog() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || user.profile_complete !== false) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setOpen(true);
  }, [user]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Add your index number, program, year completed, phone, and address so we can process document requests
            in your name. You&apos;ll need these filled in before you can submit an application.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={dismiss}>
            Later
          </Button>
          <Button
            onClick={() => {
              dismiss();
              router.push("/profile");
            }}
          >
            Update profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
