"use client";

import * as React from "react";
import { Globe } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { useCustomerAuth } from "@/providers/customer-auth-provider";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login } = useCustomerAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleGoogle = () => {
    login();
    onOpenChange(false);
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Sign in</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customer account — separate from admin access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-border bg-card hover:bg-accent"
            onClick={handleGoogle}
          >
            <Globe className="size-4" />
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1 bg-border" />
            or email
            <Separator className="flex-1 bg-border" />
          </div>
          <form onSubmit={handleEmail} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full">
              Continue with email
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
