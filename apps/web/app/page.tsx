"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { LayoutGrid, Users, CheckSquare } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutGrid className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("home.welcome")}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {t("home.description")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>{t("home.team_workspaces")}</span>
            </div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-primary" />
              <span>{t("home.kanban_boards")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              <span>{t("home.task_tracking")}</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
