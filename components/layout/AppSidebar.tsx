"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP } from "@/lib/constants";
import { navigation } from "@/config/navigation";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            FA
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

      <SidebarFooter className="border-t">
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