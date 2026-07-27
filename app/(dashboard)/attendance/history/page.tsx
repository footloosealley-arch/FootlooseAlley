"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FilterX,
  History,
  Loader2,
  RefreshCw,
  Search,
  UserMinus,
  Users,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  attendanceHistoryService,
  type AttendanceHistoryClass,
  type AttendanceHistoryRecord,
  type AttendanceHistoryStatus,
} from "@/services/attendance-history.service";

const PAGE_SIZE = 20;

function getLocalDateString(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultStartDate() {
  const date = new Date();

  date.setDate(date.getDate() - 30);

  return getLocalDateString(date);
}

function getDefaultEndDate() {
  return getLocalDateString(new Date());
}

function formatDisplayDate(
  value: string | null
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  const timeParts = value.split(":");

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function formatClassTime(
  startTime: string | null,
  endTime: string | null
) {
  if (!startTime && !endTime) {
    return "";
  }

  if (startTime && endTime) {
    return `${formatTime(
      startTime
    )} - ${formatTime(endTime)}`;
  }

  return formatTime(
    startTime || endTime
  );
}

function getInitials(name: string | null) {
  if (!name?.trim()) {
    return "S";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatusClasses(
  status: string | null
) {
  const normalizedStatus =
    status?.trim().toLowerCase();

  if (normalizedStatus === "present") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }

  if (normalizedStatus === "absent") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400";
  }

  if (
    normalizedStatus === "leave" ||
    normalizedStatus === "on leave"
  ) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }

  return "border-border bg-muted text-muted-foreground";
}

export default function AttendanceHistoryPage() {
  const [classes, setClasses] = useState<
    AttendanceHistoryClass[]
  >([]);

  const [records, setRecords] = useState<
    AttendanceHistoryRecord[]
  >([]);

  const [startDate, setStartDate] =
    useState(getDefaultStartDate);

  const [endDate, setEndDate] =
    useState(getDefaultEndDate);

  const [selectedClassId, setSelectedClassId] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceHistoryStatus | "">(
      ""
    );

  const [searchText, setSearchText] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const history =
        await attendanceHistoryService.getHistory(
          {
            startDate,
            endDate,
            classId: selectedClassId
              ? Number(selectedClassId)
              : null,
            status: selectedStatus,
            search: appliedSearch,
          }
        );

      setRecords(history);
      setCurrentPage(1);
    } catch (loadError) {
      console.error(
        "Attendance history loading failed:",
        loadError
      );

      setRecords([]);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load attendance history."
      );
    } finally {
      setLoading(false);
    }
  }, [
    appliedSearch,
    endDate,
    selectedClassId,
    selectedStatus,
    startDate,
  ]);

  const loadClasses = useCallback(async () => {
    try {
      const classList =
        await attendanceHistoryService.getClasses();

      setClasses(classList);
    } catch (loadError) {
      console.error(
        "Class loading failed:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load classes."
      );
    }
  }, []);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const presentCount = useMemo(() => {
    return records.filter(
      (record) =>
        record.status?.toLowerCase() ===
        "present"
    ).length;
  }, [records]);

  const absentCount = useMemo(() => {
    return records.filter(
      (record) =>
        record.status?.toLowerCase() ===
        "absent"
    ).length;
  }, [records]);

  const leaveCount = useMemo(() => {
    return records.filter((record) => {
      const status =
        record.status?.toLowerCase();

      return (
        status === "leave" ||
        status === "on leave"
      );
    }).length;
  }, [records]);

  const uniqueStudentCount = useMemo(() => {
    return new Set(
      records
        .map((record) => record.student_id)
        .filter(
          (studentId): studentId is number =>
            studentId !== null
        )
    ).size;
  }, [records]);

  const totalPages = Math.max(
    Math.ceil(records.length / PAGE_SIZE),
    1
  );

  const paginatedRecords = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_SIZE;

    return records.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [currentPage, records]);

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setAppliedSearch(searchText.trim());
  }

  function handleClearFilters() {
    setStartDate(getDefaultStartDate());
    setEndDate(getDefaultEndDate());
    setSelectedClassId("");
    setSelectedStatus("");
    setSearchText("");
    setAppliedSearch("");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <History className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Attendance History
            </h1>

            <p className="text-sm text-muted-foreground">
              Review previous student
              attendance records.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void loadHistory()
          }
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />

          <h2 className="font-semibold">
            Filters
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="historyStartDate"
              className="text-sm font-medium"
            >
              Start Date
            </label>

            <input
              id="historyStartDate"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="historyEndDate"
              className="text-sm font-medium"
            >
              End Date
            </label>

            <input
              id="historyEndDate"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="historyClass"
              className="text-sm font-medium"
            >
              Class
            </label>

            <select
              id="historyClass"
              value={selectedClassId}
              onChange={(event) =>
                setSelectedClassId(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">
                All classes
              </option>

              {classes.map((item) => (
                <option
                  key={item.id}
                  value={String(item.id)}
                >
                  {item.class_name ||
                    item.program ||
                    `Class ${item.id}`}
                  {formatClassTime(
                    item.start_time,
                    item.end_time
                  )
                    ? ` — ${formatClassTime(
                        item.start_time,
                        item.end_time
                      )}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="historyStatus"
              className="text-sm font-medium"
            >
              Status
            </label>

            <select
              id="historyStatus"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target
                    .value as
                    | AttendanceHistoryStatus
                    | ""
                )
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">
                All statuses
              </option>

              <option value="Present">
                Present
              </option>

              <option value="Absent">
                Absent
              </option>

              <option value="Leave">
                Leave
              </option>
            </select>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search by student name, phone, code, program or session"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />

            Search
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
          >
            <FilterX className="mr-2 h-4 w-4" />

            Clear Filters
          </Button>
        </form>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Students"
          value={uniqueStudentCount}
          icon={<Users className="h-5 w-5" />}
        />

        <SummaryCard
          label="Present Records"
          value={presentCount}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Absent Records"
          value={absentCount}
          icon={
            <XCircle className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Leave Records"
          value={leaveCount}
          icon={
            <Clock3 className="h-5 w-5" />
          }
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Attendance Records
            </h2>

            <p className="text-sm text-muted-foreground">
              {records.length} record
              {records.length === 1
                ? ""
                : "s"}{" "}
              found.
            </p>
          </div>

          {records.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of{" "}
              {totalPages}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span>
                Loading attendance
                history...
              </span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <UserMinus className="mb-3 h-10 w-10 text-muted-foreground/50" />

            <h3 className="font-medium">
              No attendance records found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Try changing the selected
              dates, class, status or search
              text.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-muted/40">
                  <tr className="border-b text-left text-sm">
                    <th className="px-4 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Student
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Class
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Session
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Instructor
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRecords.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="border-b last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                          {formatDisplayDate(
                            record.date
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {record.student
                              ?.photo_url ? (
                              <img
                                src={
                                  record.student
                                    .photo_url
                                }
                                alt={
                                  record.student
                                    .Name ||
                                  "Student"
                                }
                                className="h-10 w-10 rounded-full border object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                                {getInitials(
                                  record.student
                                    ?.Name ??
                                    null
                                )}
                              </div>
                            )}

                            <div>
                              <p className="font-medium">
                                {record.student
                                  ?.Name ||
                                  `Student ${
                                    record.student_id ??
                                    ""
                                  }`}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {record.student
                                  ?.student_code ||
                                  record.student
                                    ?.Phone ||
                                  "No student code"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-medium">
                            {record
                              .studio_class
                              ?.class_name ||
                              record
                                .studio_class
                                ?.program ||
                              "Not specified"}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatClassTime(
                              record
                                .studio_class
                                ?.start_time ??
                                null,
                              record
                                .studio_class
                                ?.end_time ??
                                null
                            ) ||
                              record.student
                                ?.Program ||
                              ""}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {record.session_name ||
                            "Not specified"}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {record.instructor
                            ?.name ||
                            "Not assigned"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              record.status
                            )}`}
                          >
                            {record.status ||
                              "Unknown"}
                          </span>
                        </td>

                        <td className="max-w-xs px-4 py-4 text-sm text-muted-foreground">
                          {record.remarks ||
                            "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {(currentPage - 1) *
                  PAGE_SIZE +
                  1}{" "}
                to{" "}
                {Math.min(
                  currentPage * PAGE_SIZE,
                  records.length
                )}{" "}
                of {records.length}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.max(
                          previous - 1,
                          1
                        )
                    )
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />

                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.min(
                          previous + 1,
                          totalPages
                        )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                >
                  Next

                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

function SummaryCard({
  label,
  value,
  icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
