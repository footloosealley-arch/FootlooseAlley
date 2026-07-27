"use client";

import { Bell, Moon, Search, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 mb-8 flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to Footloose Alley
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <Input
            placeholder="Search students..."
            className="w-72 pl-10"
          />
        </div>

        <button className="rounded-xl border p-3 transition hover:bg-slate-100">
          <Bell size={18} />
        </button>

        <button className="rounded-xl border p-3 transition hover:bg-slate-100">
          <Moon size={18} />
        </button>

        <button className="flex items-center gap-2 rounded-xl border px-4 py-2 transition hover:bg-slate-100">
          <UserCircle2 size={22} />
          <span className="font-medium">Admin</span>
        </button>
      </div>
    </header>
  );
}