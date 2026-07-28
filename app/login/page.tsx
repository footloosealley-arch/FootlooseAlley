"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/branding/BrandLogo";

function getSafeNextPath(): string {
  const requestedPath = new URLSearchParams(window.location.search).get("next");

  if (
    requestedPath &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//")
  ) {
    return requestedPath;
  }

  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getSafeNextPath());
    }
  }, [authLoading, router, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back.");
      router.replace(getSafeNextPath());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-background to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-20 w-40 items-center justify-center">
            <BrandLogo width={160} height={80} className="max-h-full object-contain" />
          </div>

          <h1 className="mt-4 text-2xl font-bold">Footloose Alley</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Secure Studio Manager
          </p>
        </div>

        <div className="rounded-3xl border bg-background p-6 shadow-xl sm:p-8">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm">
              Staff-only access protects student, payment, attendance, and
              enquiry data.
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">Sign in to continue</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Use your registered studio email and password.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}

              Secure Sign In
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Staff accounts are managed by the studio administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
