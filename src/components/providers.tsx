"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { AdminSessionProvider } from "@/providers/admin-session-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AdminSessionProvider>{children}</AdminSessionProvider>
    </ThemeProvider>
  );
}
