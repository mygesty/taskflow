"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Bell } from "lucide-react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: workspaces, isLoading } = useWorkspaces(isAuthenticated);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 hover:bg-sidebar-accent/50 transition-colors"
      >
        <LayoutGrid className="size-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">TaskFlow</h1>
      </Link>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </span>
          <Button variant="ghost" size="icon-xs" aria-label="Create workspace" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3" />
          </Button>
        </div>

        <nav className="space-y-0.5">
          {isLoading && (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">Loading...</p>
          )}
          {workspaces?.map((ws) => (
            <button
              key={ws.id}
              onClick={() => router.push(`/workspaces/${ws.id}`)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                {ws.name.charAt(0)}
              </div>
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
          {!isLoading && workspaces?.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">
              No workspaces yet. Create one!
            </p>
          )}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={() => router.push("/notifications")}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Bell className="size-4" />
          Notifications
        </button>
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="truncate text-sm font-medium">{user?.name || "User"}</div>
        </div>
      </div>

      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </aside>
  );
}
