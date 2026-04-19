"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Package, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useAdminSession } from "@/providers/admin-session-provider";

export function UserMenu() {
  const { userLabel, userEmail, logout } = useCustomerAuth();
  const { isAdminAuthenticated, hydrated } = useAdminSession();
  const adminHref =
    hydrated && isAdminAuthenticated ? "/admin/dashboard" : "/admin/login";
  const initialsSource = userEmail ?? userLabel;
  const initials = initialsSource
    .replace(/[^a-zA-Z0-9@._-]+/g, " ")
    .split(/[\s@]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full border border-border bg-card text-foreground"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
              {initials || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48 border-border bg-popover text-popover-foreground"
      >
        <DropdownMenuLabel className="font-normal">
          <span className="text-sm font-medium text-foreground">{userLabel}</span>
          {userEmail ? (
            <span className="block truncate text-xs text-muted-foreground">{userEmail}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/orders" className="flex items-center gap-2">
            <Package className="size-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={adminHref} className="flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            Admin panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => logout()}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
