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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <label htmlFor="student-page-size" className="text-sm">
            Rows
          </label>

          <select
            id="student-page-size"
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(
                Number(e.target.value)
              )
            }
            className="h-11 rounded-lg border px-3 sm:h-8 sm:px-2 sm:py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-1">
          <button
            type="button"
            onClick={() =>
              onPageChange(1)
            }
            disabled={page === 1}
            aria-label="First page"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted sm:h-8 sm:w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onPageChange(page - 1)
            }
            disabled={page === 1}
            aria-label="Previous page"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted sm:h-8 sm:w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 px-2 text-center text-sm font-medium">
            Page {page} of {totalPages}
          </div>

          <button
            type="button"
            onClick={() =>
              onPageChange(page + 1)
            }
            disabled={page >= totalPages}
            aria-label="Next page"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onPageChange(totalPages)
            }
            disabled={page >= totalPages}
            aria-label="Last page"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted sm:h-8 sm:w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}