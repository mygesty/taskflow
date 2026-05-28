"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/useNotifications";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.pageSize || 20));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} notification{total !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="mr-1.5 size-4" />Mark All Read
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-3 size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    markRead.mutate(n.id);
                    if (n.taskId) {
                      // Navigate to the board — simplified
                      router.push("/dashboard");
                    }
                  }}
                >
                  {!n.read && <div className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>}
                    {n.task?.title && <p className="text-xs text-primary mt-0.5">Task: {n.task.title}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
