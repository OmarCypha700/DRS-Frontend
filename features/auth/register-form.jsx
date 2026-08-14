"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/shared";
import { useAuth } from "@/lib/auth/auth-context";
import { getApiErrorMessage } from "@/lib/api";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      // No redirect here — see the matching comment in login-form.jsx.
      // GuestGuard (wrapping this page) owns the post-auth redirect.
      await registerUser(values);
      toast.success("Account created — welcome!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create your account."));
    }
  };

  return (
    <Card>
      <div className="flex justify-center mt-4">
        <Image src="/tanoso.webp" alt="Logo" width={100} height={100} />
      </div>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Request official documents online in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First name"
              htmlFor="first_name"
              error={errors.first_name?.message}
            >
              <Input
                id="first_name"
                autoComplete="given-name"
                {...register("first_name", { required: "Required" })}
              />
            </FormField>
            <FormField
              label="Last name"
              htmlFor="last_name"
              error={errors.last_name?.message}
            >
              <Input
                id="last_name"
                autoComplete="family-name"
                {...register("last_name", { required: "Required" })}
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", { required: "Email is required" })}
              placeholder="example@gmail.com"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Must be at least 8 characters",
                },
              })}
              placeholder="********"
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="password_confirm"
            error={errors.password_confirm?.message}
          >
            <Input
              id="password_confirm"
              type="password"
              autoComplete="new-password"
              {...register("password_confirm", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              placeholder="********"
            />
          </FormField>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
