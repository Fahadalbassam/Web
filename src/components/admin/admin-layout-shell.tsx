"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, MessageSquare, Package, Plus, Store } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAdminSession } from "@/providers/admin-session-provider";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";

function AdminLogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { logout } = useAdminSession();

  const confirm = async () => {
    await logout();
    onOpenChange(false);
    router.push("/");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of admin?</AlertDialogTitle>
          <AlertDialogDescription>
            Your staff session and linked storefront sign-in for this browser are cleared; the session cart remains
            until you clear it or check out. Sign in again from the storefront if you need access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm}>
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminSidebarNav() {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const dashboardActive = pathname === "/admin/dashboard";
  const supportActive = pathname === "/admin/support";
  const addProductActive = pathname === "/admin/products/new";
  const productsActive =
    pathname === "/admin/products" ||
    /^\/admin\/products\/[^/]+\/edit$/.test(pathname);

  return (
    <>
      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <p className="font-heading text-base font-semibold text-sidebar-foreground">
            Gulf Parts Co
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigate</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={dashboardActive}>
                    <Link href="/admin/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={supportActive}>
                    <Link href="/admin/support">
                      <MessageSquare />
                      <span>Support tickets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={productsActive}>
                    <Link href="/admin/products">
                      <Package />
                      <span>Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={addProductActive}>
                    <Link href="/admin/products/new">
                      <Plus />
                      <span>Add product</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <Store />
                  <span>View storefront</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setLogoutOpen(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AdminLogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-svh bg-background text-foreground">
        <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-10">{children}</div>
      </div>
    );
  }

  return (
    <AdminAccessGate>
      <SidebarProvider defaultOpen>
        <AdminSidebarNav />
        <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Admin · Operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-6 md:px-6">{children}</div>
      </SidebarInset>
      </SidebarProvider>
    </AdminAccessGate>
  );
}
