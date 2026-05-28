"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";
import { translateFieldError } from "@/lib/i18n-zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.success) router.push(redirectTo);
      },
    });
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-xl">{t("auth.welcome_back")}</CardTitle>
        <CardDescription>{t("auth.sign_in_prompt")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</label>
            <Input id="email" placeholder={t("auth.email_placeholder")} type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{translateFieldError(errors.email.message, t)}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</label>
            <Input id="password" type="password" placeholder={t("auth.password_placeholder")} {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{translateFieldError(errors.password.message, t)}</p>}
          </div>
          {loginMutation.isError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {(loginMutation.error as Error)?.message || t("auth.invalid_credentials")}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? t("auth.signing_in") : t("auth.sign_in")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.no_account")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">{t("auth.create_one")}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
