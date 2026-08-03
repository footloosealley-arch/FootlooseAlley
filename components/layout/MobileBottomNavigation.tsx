"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Users,
} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mobileNavigation = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    icon: MessageCircle,
  },
] as const;

export default function MobileBottomNavigation() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <nav
      aria-label="Mobile navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 items-end rounded-[1.65rem] border border-primary/15 bg-background/95 p-1.5 shadow-[0_18px_55px_-18px_rgba(80,16,28,0.45)] backdrop-blur-2xl">
        {mobileNavigation.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:scale-95 active:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.title}</span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Open all menu items"
          aria-expanded={openMobile}
          onClick={() => setOpenMobile(!openMobile)}
          className="relative -mt-5 flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-primary via-rose-600 to-amber-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-primary/30 transition active:scale-95"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Menu className="h-5 w-5" />
          </span>
          <span>All Menu</span>
        </button>

        {mobileNavigation.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:scale-95 active:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
