"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";

import { APP } from "@/lib/constants";
import { navigation, type NavigationItem } from "@/config/navigation";
import BrandLogo from "@/components/branding/BrandLogo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationGroups: Array<{
  label: string;
  hrefs: string[];
}> = [
  {
    label: "Overview",
    hrefs: ["/dashboard", "/follow-ups", "/whatsapp", "/assistant"],
  },
  {
    label: "People",
    hrefs: [
      "/students",
      "/birthdays",
      "/enquiries",
      "/trials",
      "/instructors",
    ],
  },
  {
    label: "Studio Operations",
    hrefs: ["/attendance", "/classes", "/events"],
  },
  {
    label: "Finance & Insights",
    hrefs: ["/payments", "/expenses", "/memberships", "/reports", "/audit-log", "/settings"],
  },
];

function itemsForGroup(hrefs: string[]): NavigationItem[] {
  return hrefs
    .map((href) => navigation.find((item) => item.href === href))
    .filter((item): item is NavigationItem => Boolean(item));
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-primary/15 bg-gradient-to-b from-rose-50 via-white to-amber-50/80"
    >
      <SidebarHeader className="border-b border-primary/15 p-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-rose-600 to-amber-500 p-[1px] shadow-lg shadow-primary/15">
          <div className="relative flex items-center gap-3 overflow-hidden rounded-[15px] bg-white/95 px-3 py-3 backdrop-blur">
            <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-amber-200/45 blur-2xl" />
            <div className="absolute -bottom-10 left-12 h-20 w-20 rounded-full bg-rose-200/50 blur-2xl" />

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-white p-1 shadow-md shadow-primary/15">
              <BrandLogo
                width={44}
                height={44}
                className="max-h-full object-contain"
              />
            </div>

            <div className="relative min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-extrabold tracking-tight text-foreground">
                  {APP.SHORT_NAME}
                </span>
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              </div>
              <span className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Studio Manager
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {navigationGroups.map((group) => {
          const items = itemsForGroup(group.hrefs);

          return (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80 group-data-[collapsible=icon]:sr-only">
                {group.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.title}
                          render={
                            <Link
                              href={item.href}
                              onClick={() => setOpenMobile(false)}
                            />
                          }
                          className={
                            active
                              ? "h-11 rounded-xl bg-gradient-to-r from-primary via-rose-600 to-rose-500 font-semibold text-white shadow-md shadow-primary/20 hover:text-white data-[active=true]:bg-primary"
                              : "h-11 rounded-xl text-foreground/75 transition-all hover:translate-x-0.5 hover:bg-primary/10 hover:text-primary"
                          }
                        >
                          <span
                            className={
                              active
                                ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"
                                : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground transition-colors group-hover/menu-button:bg-primary/10 group-hover/menu-button:text-primary"
                            }
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="truncate">{item.title}</span>

                          <ChevronRight
                            className={
                              active
                                ? "ml-auto h-4 w-4 text-white/80 group-data-[collapsible=icon]:hidden"
                                : "ml-auto h-4 w-4 text-muted-foreground/40 opacity-0 transition-opacity group-hover/menu-button:opacity-100 group-data-[collapsible=icon]:hidden"
                            }
                          />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/10 p-3">
        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-amber-100/60 p-3 shadow-sm group-data-[collapsible=icon]:p-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-rose-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-semibold">{APP.NAME}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Version {APP.VERSION}
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
