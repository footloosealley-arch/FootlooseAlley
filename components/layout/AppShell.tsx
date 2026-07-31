"use client";

import { ReactNode } from "react";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import MobileBottomNavigation from "./MobileBottomNavigation";
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

          <SidebarInset className="min-w-0 bg-background">
            <AppHeader />

            <main className="relative min-h-[calc(100dvh-64px)] flex-1 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.09),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_30%)] px-3 pb-[calc(7.25rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pt-5 md:min-h-[calc(100dvh-64px)] md:p-6">
              <div className="mx-auto w-full max-w-[1600px]">
                {children}
              </div>
            </main>

            <MobileBottomNavigation />
          </SidebarInset>
        </SidebarProvider>
      </AppErrorBoundary>
    </AuthGuard>
  );
}
