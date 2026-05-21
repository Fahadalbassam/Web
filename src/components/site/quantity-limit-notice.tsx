"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function QuantityLimitNotice({
  message,
  className,
  onDismiss,
}: {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
}) {
  React.useEffect(() => {
    if (!message || !onDismiss) return;
    const id = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "text-sm text-amber-600 dark:text-amber-400",
        className,
      )}
    >
      {message}
    </p>
  );
}
