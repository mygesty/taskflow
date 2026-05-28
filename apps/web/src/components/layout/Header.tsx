"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          U
        </div>
      </div>
    </header>
  );
}
