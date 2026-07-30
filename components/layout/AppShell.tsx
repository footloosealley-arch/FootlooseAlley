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

          <SidebarInset>
            <AppHeader />

            <main className="relative min-h-[calc(100dvh-56px)] flex-1 overflow-hidden bg-gradient-to-br from-rose-50/65 via-background to-amber-50/55 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pt-5 md:min-h-[calc(100dvh-64px)] md:p-6">
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
