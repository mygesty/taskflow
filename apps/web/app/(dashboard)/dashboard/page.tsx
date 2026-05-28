"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { LayoutGrid, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your workspaces and tasks.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Your Workspaces</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading workspaces...</p>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Card
                  key={ws.id}
                  className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/workspaces/${ws.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutGrid className="size-4 text-primary" />
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base">{ws.name}</CardTitle>
                    {ws.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ws.description}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {ws.members?.length || 0} member{(ws.members?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <LayoutGrid className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No workspaces yet. Create your first workspace to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
