"use client";

import { ReactNode } from "react";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <AuthGuard>
      <AppErrorBoundary>
        <SidebarProvider defaultOpen>
          <AppSidebar />

          <SidebarInset>
            <AppHeader />

            <main className="min-h-[calc(100vh-64px)] flex-1 bg-muted/20 p-4 sm:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AppErrorBoundary>
    </AuthGuard>
  );
}
