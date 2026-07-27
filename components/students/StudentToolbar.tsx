"use client";

import { Search, Plus, RefreshCw, Download } from "lucide-react";

interface StudentToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddStudent: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function StudentToolbar({
  search,
  onSearchChange,
  onAddStudent,
  onRefresh,
  onExport,
}: StudentToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 outline-none transition focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        <button
          onClick={onAddStudent}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>
    </div>
  );
}