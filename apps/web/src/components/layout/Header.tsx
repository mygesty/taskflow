"use client";

import { Bell, LogOut, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/useAuth";

const breadcrumbs: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/register": "Register",
  "/login": "Login",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const pageTitle = breadcrumbs[pathname] || "TaskFlow";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>TaskFlow</span>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary hover:ring-2 hover:ring-primary/30 transition-all">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5 text-sm font-medium">{user?.name || "User"}</div>
            <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user?.email}</div>
            <div className="-mx-1 my-1 h-px bg-border" />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
