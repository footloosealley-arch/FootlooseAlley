"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react";

import BrandLogo from "@/components/branding/BrandLogo";
import { APP } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments[segments.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname]);

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (name) {
      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }
    return profile?.email?.[0]?.toUpperCase() || "FA";
  }, [profile]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/90 shadow-[0_10px_35px_-30px_rgba(180,35,58,0.85)] backdrop-blur-xl">
      <div className="flex h-16 items-center px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent p-0.5 transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <BrandLogo width={38} height={38} className="max-h-full object-contain" />
          </Link>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            <p className="hidden truncate text-xs text-muted-foreground md:block">
              {APP.SHORT_NAME}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted md:hidden"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex min-h-10 items-center gap-2 rounded-xl border bg-background p-1 pr-1.5 transition hover:bg-muted sm:p-1.5 sm:pr-2"
              aria-expanded={menuOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-rose-600 to-amber-500 text-xs font-semibold text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden max-w-40 text-left md:block">
                <p className="truncate text-xs font-semibold">
                  {profile?.full_name || "Studio Staff"}
                </p>
                <p className="truncate text-[11px] capitalize text-muted-foreground">
                  {profile?.role || "staff"}
                </p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border bg-background p-2 shadow-xl">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <p className="truncate text-sm font-semibold">
                        {profile?.full_name || "Studio Staff"}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {profile?.email}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium capitalize text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {profile?.role} access
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out securely
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
