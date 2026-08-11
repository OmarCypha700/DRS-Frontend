"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField, LoadingState, ErrorState } from "@/components/shared";
import { profileApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { ROLES, ROLE_LABELS } from "@/lib/constants";

export function ProfileForm() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = async () => {
    setStatus("loading");
    try {
      const { data } = await profileApi.get();
      setProfile(data);
      reset({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        index_number: data.profile?.index_number ?? "",
        program: data.profile?.program ?? "",
        year_started: data.profile?.year_started ?? "",
        year_completed: data.profile?.year_completed ?? "",
        address: data.profile?.address ?? "",
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    // `load` is async and only calls setState after its first `await`; the
    // compiler's static analysis can't see through that boundary and flags
    // it as a synchronous setState-in-effect, but this is the standard
    // fetch-on-mount pattern (also used by the retry button below). Deps are
    // intentionally empty — this should only run once, on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    try {
      const { data } = await profileApi.update(values);
      setProfile(data);
      setUser(data);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update your profile."));
    }
  };

  if (status === "loading") return <LoadingState message="Loading your profile…" />;
  if (status === "error") return <ErrorState onRetry={load} description="Could not load your profile." />;

  const isApplicant = profile.role === ROLES.APPLICANT;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="first_name" error={errors.first_name?.message}>
                <Input id="first_name" {...register("first_name", { required: "Required" })} />
              </FormField>
              <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
                <Input id="last_name" {...register("last_name", { required: "Required" })} />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="email">
              <Input id="email" value={profile.email} disabled />
            </FormField>

            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register("phone", { required: isApplicant && "Required" })} />
            </FormField>

            {isApplicant && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Index number" htmlFor="index_number" error={errors.index_number?.message}>
                    <Input id="index_number" {...register("index_number", { required: "Required" })} />
                  </FormField>
                  <FormField label="Program" htmlFor="program" error={errors.program?.message}>
                    <Input id="program" {...register("program", { required: "Required" })} />
                  </FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Year started" htmlFor="year_started" error={errors.year_started?.message}>
                    <Input id="year_started" type="number" {...register("year_started", { required: "Required" })} />
                  </FormField>
                  <FormField label="Year completed" htmlFor="year_completed" error={errors.year_completed?.message}>
                    <Input id="year_completed" type="number" {...register("year_completed", { required: "Required" })} />
                  </FormField>
                </div>
                <FormField label="Address" htmlFor="address" error={errors.address?.message}>
                  <Input id="address" {...register("address", { required: "Required" })} />
                </FormField>
              </>
            )}

            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Managed by your institution — not editable here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <InfoRow label="Role" value={ROLE_LABELS[profile.role] ?? profile.role} />
          {!isApplicant && (
            <>
              <Separator />
              <InfoRow label="Employee ID" value={profile.profile?.employee_id || "—"} />
              <InfoRow label="Department" value={profile.profile?.department || "—"} />
            </>
          )}
        </CardContent>
      </Card>

      <PushNotificationsCard />
    </div>
  );
}

function PushNotificationsCard() {
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async () => {
    if (subscribed) {
      await unsubscribe();
      toast.success("Push notifications turned off.");
      return;
    }
    const granted = await subscribe();
    if (granted) {
      toast.success("Push notifications enabled.");
    } else if (permission === "denied") {
      toast.error("Notifications are blocked — allow them in your browser's site settings to enable this.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push notifications</CardTitle>
        <CardDescription>Get notified on this device even when the app isn&apos;t open.</CardDescription>
      </CardHeader>
      <CardContent>
        {supported ? (
          <Button variant={subscribed ? "outline" : "default"} onClick={handleToggle} disabled={loading}>
            {loading ? "Please wait…" : subscribed ? "Disable notifications" : "Enable notifications"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Push notifications aren&apos;t supported in this browser.</p>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
