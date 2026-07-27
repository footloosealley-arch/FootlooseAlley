"use client";

import { ReactNode } from "react";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <main className="flex-1 p-6 bg-muted/20 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}