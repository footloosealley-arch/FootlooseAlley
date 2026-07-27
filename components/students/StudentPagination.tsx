"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface StudentPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function StudentPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: StudentPaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const from =
    total === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const to = Math.min(
    page * pageSize,
    total
  );

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium">
          {from}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {to}
        </span>{" "}
        of{" "}
        <span className="font-medium">
          {total}
        </span>{" "}
        students
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">
            Rows
          </label>

          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(
                Number(e.target.value)
              )
            }
            className="rounded-lg border px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onPageChange(1)
            }
            disabled={page === 1}
            className="rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() =>
              onPageChange(page - 1)
            }
            disabled={page === 1}
            className="rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() =>
              onPageChange(page + 1)
            }
            disabled={page >= totalPages}
            className="rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() =>
              onPageChange(totalPages)
            }
            disabled={page >= totalPages}
            className="rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}