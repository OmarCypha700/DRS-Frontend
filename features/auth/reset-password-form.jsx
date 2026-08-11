"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared";
import { authApi, getApiErrorMessage } from "@/lib/api";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await authApi.resetPassword({ uid, token, ...values });
      toast.success("Password reset. You can now sign in.");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "This reset link is invalid or has expired."));
    }
  };

  if (!uid || !token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid reset link</CardTitle>
          <CardDescription>
            This password reset link is missing or malformed. Request a new one from the sign-in page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="New password" htmlFor="new_password" error={errors.new_password?.message}>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...register("new_password", {
                required: "Password is required",
                minLength: { value: 8, message: "Must be at least 8 characters" },
              })}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="new_password_confirm"
            error={errors.new_password_confirm?.message}
          >
            <Input
              id="new_password_confirm"
              type="password"
              autoComplete="new-password"
              {...register("new_password_confirm", {
                required: "Please confirm your password",
                validate: (value) => value === watch("new_password") || "Passwords do not match",
              })}
            />
          </FormField>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
