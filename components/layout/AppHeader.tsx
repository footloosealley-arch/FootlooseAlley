"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { APP } from "@/lib/constants";

export default function AppHeader() {
  const pathname = usePathname();

  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return "Dashboard";
    }

    const page = segments[segments.length - 1];

    return page
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="h-6"
        />

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">
            {title}
          </h1>

          <p className="text-xs text-muted-foreground">
            {APP.SHORT_NAME}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          FA
        </div>
      </div>
    </header>
  );
}