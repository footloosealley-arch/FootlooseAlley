"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "./AuthProvider";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 font-semibold">Securing your studio workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 text-xl font-bold">Account setup incomplete</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your login is valid, but the staff profile could not be loaded. Run the
            v3.6.0 Supabase migration and sign in again.
          </p>
        </div>
      </div>
    );
  }

  if (!profile.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-4 text-xl font-bold">Staff access deactivated</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An administrator has disabled this staff account. Contact the studio
            administrator if access should be restored.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
