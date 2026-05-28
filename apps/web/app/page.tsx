import { AppShell } from "@/components/layout/AppShell";
import { LayoutGrid, Users, CheckSquare } from "lucide-react";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutGrid className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to TaskFlow</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A lightweight task collaboration platform for teams of 5–20 people.
            Organize work with kanban boards, drag-and-drop tasks, and real-time notifications.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Team workspaces</span>
            </div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-primary" />
              <span>Kanban boards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              <span>Task tracking</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
