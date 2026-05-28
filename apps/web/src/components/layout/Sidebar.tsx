"use client";

import { Button } from "@/components/ui/button";
import { Plus, Hash } from "lucide-react";

const placeholderWorkspaces = [
  { id: "1", name: "TaskFlow Team" },
  { id: "2", name: "Personal" },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-lg font-semibold">TaskFlow</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Workspaces
          </span>
          <Button variant="ghost" size="xs" aria-label="Create workspace">
            <Plus className="size-3" />
          </Button>
        </div>

        <nav className="space-y-0.5">
          {placeholderWorkspaces.map((ws) => (
            <button
              key={ws.id}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Hash className="size-4 shrink-0" />
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            U
          </div>
          <div className="flex-1 truncate text-sm">User</div>
        </div>
      </div>
    </aside>
  );
}
