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

        <label
          htmlFor="student-search"
          className="sr-only"
        >
          Search students by name, phone, or student code
        </label>

        <input
          id="student-search"
          type="search"
          placeholder="Search name, phone, or student code..."
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 outline-none transition focus:border-primary lg:h-auto lg:py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        <button
          type="button"
          onClick={onAddStudent}
          className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:col-span-1"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>
    </div>
  );
}
