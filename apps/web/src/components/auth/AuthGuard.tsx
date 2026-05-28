"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:3002/api/bff";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, setUser } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    fetch(`${BFF_URL}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
            setChecking(false);
            return;
          }
        }
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      })
      .catch(() => {
        if (!cancelled) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pathname, router, setUser]);

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return <>{children}</>;
}
