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
  /** Called after successful login or register (e.g. checkout resume). */
  onLoginSuccess?: () => void;
};

type Mode = "login" | "register";

export function AuthModal({ open, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { loginWithCredentials, registerAccount } = useCustomerAuth();
  const [mode, setMode] = React.useState<Mode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const resetSensitiveFields = React.useCallback(() => {
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }, []);

  const resetAllFields = React.useCallback(() => {
    setEmail("");
    resetSensitiveFields();
  }, [resetSensitiveFields]);

  React.useEffect(() => {
    if (!open) {
      resetAllFields();
      setMode("login");
    }
  }, [open, resetAllFields]);

  const goToLogin = () => {
    setMode("login");
    resetSensitiveFields();
  };

  const goToRegister = () => {
    setMode("register");
    resetSensitiveFields();
  };

  const finishSuccess = () => {
    resetAllFields();
    setMode("login");
    onOpenChange(false);
    onLoginSuccess?.();
  };

  const handleLogin = async (e: React.FormEvent) => {
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
      finishSuccess();
    } catch {
      setError("Could not reach the sign-in service.");
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const em = email.trim();
    if (!em) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const r = await registerAccount(em, password);
      if (!r.ok) {
        setError(r.error ?? "Could not create account");
        setPending(false);
        return;
      }
      finishSuccess();
    } catch {
      setError("Could not reach the registration service.");
    } finally {
      setPending(false);
    }
  };

  const loginDescription =
    "Use your Gulf Parts Co account. Staff admins use the same credentials as the storefront; after sign-in, open Admin from the account menu if your role is admin.";

  const registerDescription =
    "Create a password-protected account. You will be signed in automatically after registration.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {mode === "login" ? "Sign in" : "Create account"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "login" ? loginDescription : registerDescription}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-3 pt-2">
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
            <p className="text-center text-xs text-muted-foreground">
              New?{" "}
              <button
                type="button"
                onClick={goToRegister}
                className="font-normal underline underline-offset-4 decoration-muted-foreground/70 hover:text-foreground hover:decoration-foreground"
                disabled={pending}
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={(e) => void handleRegister(e)} className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="auth-reg-email">Email</Label>
              <Input
                id="auth-reg-email"
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
              <Label htmlFor="auth-reg-password">Password</Label>
              <Input
                id="auth-reg-password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
                required
                disabled={pending}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-reg-confirm">Confirm password</Label>
              <Input
                id="auth-reg-confirm"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background"
                required
                disabled={pending}
                minLength={8}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={goToLogin}
                className="font-normal underline underline-offset-4 decoration-muted-foreground/70 hover:text-foreground hover:decoration-foreground"
                disabled={pending}
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
