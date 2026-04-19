"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/providers/customer-auth-provider";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
};

export function AuthModal({ open, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { loginWithCredentials } = useCustomerAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  React.useEffect(() => {
    if (!open) resetFields();
  }, [open]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const r = await loginWithCredentials(email, password);
      if (!r.ok) {
        setError(r.error ?? "Could not sign in");
        setPending(false);
        return;
      }
      resetFields();
      onOpenChange(false);
      onLoginSuccess?.();
    } catch {
      setError("Could not reach the sign-in service.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Sign in</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in with your Gulf Parts Co account to complete checkout. Same credentials as staff admin accounts
            for this beta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleEmail(e)} className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background"
              required
              disabled={pending}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
