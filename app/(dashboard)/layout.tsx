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

  );
}