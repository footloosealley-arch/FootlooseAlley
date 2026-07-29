"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP } from "@/lib/constants";
import { navigation } from "@/config/navigation";
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
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/15 bg-gradient-to-b from-rose-50 via-sidebar to-amber-50/60">
      <SidebarHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-transparent to-accent/20">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-white p-1 shadow-md shadow-primary/10">
            <BrandLogo width={40} height={40} className="max-h-full object-contain" />
          </div>

          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">
              {APP.SHORT_NAME}
            </span>

            <span className="truncate text-xs text-muted-foreground">
              Studio Manager
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
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
                        <Link href={item.href} />
                      }
                      className={
                        active
                          ? "bg-gradient-to-r from-primary to-rose-600 font-semibold text-white shadow-md shadow-primary/20 hover:text-white"
                          : "hover:bg-primary/10 hover:text-primary"
                      }
                    >
                      <Icon />

                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
              </SidebarContent>

      <SidebarFooter className="border-t border-primary/15 bg-gradient-to-r from-primary/5 to-accent/10">
        <div className="space-y-1 px-3 py-4">
          <p className="text-sm font-medium">
            {APP.NAME}
          </p>

          <p className="text-xs text-muted-foreground">
            Version {APP.VERSION}
          </p>
        </div>

        {/*
          Future User Section

          ┌────────────────────────────┐
          │  👤 Admin                  │
          │  admin@footloose.com       │
          └────────────────────────────┘

          Will be connected to Supabase Auth.
        */}
      </SidebarFooter>
    </Sidebar>
  );
}
