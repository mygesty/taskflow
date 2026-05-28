"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/hooks/useAuth";
import { translateFieldError } from "@/lib/i18n-zod";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[a-z]/, "Need a lowercase letter")
      .regex(/[A-Z]/, "Need an uppercase letter")
      .regex(/[0-9]/, "Need a digit"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(
      { email: data.email, password: data.password, name: data.name },
      {
        onSuccess: (res) => {
          if (res.success) router.push("/dashboard");
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-xl">{t("auth.create_account")}</CardTitle>
        <CardDescription>{t("auth.register_prompt")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</label>
            <Input id="email" placeholder={t("auth.email_placeholder")} type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{translateFieldError(errors.email.message, t)}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">{t("auth.name")}</label>
            <Input id="name" placeholder={t("auth.name_placeholder")} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{translateFieldError(errors.name.message, t)}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</label>
            <Input id="password" type="password" placeholder={t("auth.password_placeholder_short")} {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{translateFieldError(errors.password.message, t)}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">{t("auth.confirm_password")}</label>
            <Input id="confirmPassword" type="password" placeholder={t("auth.confirm_password_placeholder")} {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{translateFieldError(errors.confirmPassword.message, t)}</p>}
          </div>
          {registerMutation.isError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {(registerMutation.error as Error)?.message || t("auth.registration_failed")}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? t("auth.creating_account") : t("auth.create_account")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.already_have_account")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">{t("auth.sign_in_link")}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
