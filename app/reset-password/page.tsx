"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully.");
      router.replace("/dashboard");
    }
    setSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-background to-orange-50 p-4">
      <div className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use at least eight characters and keep your studio login private.
        </p>

        {!ready ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Open this page using the secure link from your password-reset email.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
