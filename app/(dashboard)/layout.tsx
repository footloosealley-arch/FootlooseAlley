<<<<<<< HEAD
import { ReactNode } from "react";

import AppShell from "@/components/layout/AppShell";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <AppShell>
      {children}
    </AppShell>
=======
import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";


export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (

    <div className="min-h-screen bg-slate-100">

      <Sidebar />


      <main className="ml-72 p-8">

        {children}

      </main>


    </div>

>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
  );
}