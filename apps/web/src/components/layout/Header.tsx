"use client";

import { useState } from "react";
import { Bell, LogOut, ChevronRight, CheckCheck, Sun, Moon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/useAuth";
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/useNotifications";
import { useTheme } from "@/components/providers/ThemeProvider";

const breadcrumbs: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/register": "Register",
  "/login": "Login",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const { theme, toggle: toggleTheme } = useTheme();
  const { data: unreadCount } = useUnreadCount(isAuthenticated);
  const { data: notificationsData } = useNotifications(1, isAuthenticated);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = breadcrumbs[pathname] || "TaskFlow";

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => router.push("/login") });
  };

  const notifications = notificationsData?.items?.slice(0, 10) || [];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>TaskFlow</span>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {/* Notification Bell */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger className="relative flex size-8 items-center justify-center rounded hover:bg-muted">
            <Bell className="size-4" />
            {unreadCount ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount ? (
                <button onClick={() => markAllRead.mutate()} className="text-xs text-primary hover:underline">
                  <CheckCheck className="mr-1 inline size-3" />Mark all read
                </button>
              ) : null}
            </div>
            <div className="-mx-1 my-1 h-px bg-border" />
            {notifications.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((n: any) => (
                <DropdownMenuItem
                  key={n.id}
                  className={`flex flex-col items-start gap-0.5 ${!n.read ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    markRead.mutate(n.id);
                    setNotifOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {!n.read && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {n.task?.title && (
                    <span className="text-xs text-muted-foreground pl-4">Task: {n.task.title}</span>
                  )}
                </DropdownMenuItem>
              ))
            )}
            <div className="-mx-1 my-1 h-px bg-border" />
            <DropdownMenuItem onClick={() => { router.push("/notifications"); setNotifOpen(false); }}>
              <span className="text-xs text-primary">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary hover:ring-2 hover:ring-primary/30 transition-all">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5 text-sm font-medium">{user?.name || "User"}</div>
            <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user?.email}</div>
            <div className="-mx-1 my-1 h-px bg-border" />
            <DropdownMenuItem onClick={() => router.push("/notifications")}>
              <Bell className="mr-2 size-4" />Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
