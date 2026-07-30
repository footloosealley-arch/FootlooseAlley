"use client";

import Link from "next/link";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  RefreshCw,
  Save,
  UserCheck,
  UserMinus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui-foundation/SearchInput";
import PrivateStudentPhoto from "@/components/students/PrivateStudentPhoto";
import {
  attendanceService,
  type AttendanceInstructor,
  type AttendanceStatus,
  type AttendanceStudent,
} from "@/services/attendance.service";

type StatusMap = Record<
  number,
  AttendanceStatus | ""
>;

type RemarksMap = Record<number, string>;

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export default function AttendanceRegister() {
  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [
    selectedInstructorId,
    setSelectedInstructorId,
  ] = useState("");

  const [batches, setBatches] = useState<
    string[]
  >([]);

  const [instructors, setInstructors] =
    useState<AttendanceInstructor[]>([]);

  const [students, setStudents] = useState<
    AttendanceStudent[]
  >([]);

  const [statuses, setStatuses] =
    useState<StatusMap>({});

  const [remarks, setRemarks] =
    useState<RemarksMap>({});

  const [loadingPage, setLoadingPage] =
    useState(true);

  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [studentSearch, setStudentSearch] =
    useState("");

  const presentCount = useMemo(() => {
    return Object.values(statuses).filter(
      (status) => status === "Present"
    ).length;
  }, [statuses]);

  const absentCount = useMemo(() => {
    return Object.values(statuses).filter(
      (status) => status === "Absent"
    ).length;
  }, [statuses]);

  const leaveCount = useMemo(() => {
    return Object.values(statuses).filter(
      (status) => status === "Leave"
    ).length;
  }, [statuses]);

  const markedCount = useMemo(() => {
    return Object.values(statuses).filter(
      Boolean
    ).length;
  }, [statuses]);

  const unmarkedCount = Math.max(
    students.length - markedCount,
    0
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.Name,
        student.Phone,
        student.student_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [studentSearch, students]);

  const loadReferenceData =
    useCallback(async () => {
      try {
        setLoadingPage(true);
        setError(null);

        const [
          batchList,
          instructorList,
        ] = await Promise.all([
          attendanceService.getBatches(),
          attendanceService.getInstructors(),
        ]);

        setBatches(batchList);
        setInstructors(instructorList);

        if (batchList.length > 0) {
          setSelectedBatch((current) =>
            current || batchList[0]
          );
        }
      } catch (loadError) {
        console.error(
          "Attendance setup failed:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load attendance setup."
        );
      } finally {
        setLoadingPage(false);
      }
    }, []);

  const loadAttendance =
    useCallback(async () => {
      if (
        !selectedDate ||
        !selectedBatch
      ) {
        setStudents([]);
        setStatuses({});
        setRemarks({});
        return;
      }

      try {
        setLoadingAttendance(true);
        setError(null);
        setSuccess(null);

        const [
          studentList,
          attendanceList,
        ] = await Promise.all([
          attendanceService.getStudentsForBatch(
            selectedBatch
          ),
          attendanceService.getAttendance(
            selectedDate,
            selectedBatch
          ),
        ]);

        setStudents(studentList);

        const studentIds = new Set(
          studentList.map((student) => student.id)
        );
        const nextStatuses: StatusMap = {};
        const nextRemarks: RemarksMap = {};

        for (const student of studentList) {
          nextStatuses[student.id] = "";
          nextRemarks[student.id] = "";
        }

        for (const record of attendanceList) {
          if (record.student_id === null) {
            continue;
          }

          if (!studentIds.has(record.student_id)) {
            continue;
          }

          const normalizedStatus =
            attendanceService.normalizeStatus(
              record.status
            );

          if (normalizedStatus) {
            nextStatuses[
              record.student_id
            ] = normalizedStatus;
          }

          nextRemarks[record.student_id] =
            record.remarks ?? "";

          if (
            record.instructor_id &&
            !selectedInstructorId
          ) {
            setSelectedInstructorId(
              String(record.instructor_id)
            );
          }

        }

        setStatuses(nextStatuses);
        setRemarks(nextRemarks);
      } catch (loadError) {
        console.error(
          "Attendance loading failed:",
          loadError
        );

        setStudents([]);
        setStatuses({});
        setRemarks({});

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load attendance."
        );
      } finally {
        setLoadingAttendance(false);
      }
    }, [
      selectedBatch,
      selectedDate,
      selectedInstructorId,
    ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDate(
      getLocalDateString()
    );

    void loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAttendance();
  }, [loadAttendance]);

  function updateStatus(
    studentId: number,
    status: AttendanceStatus
  ) {
    setStatuses((previous) => ({
      ...previous,
      [studentId]:
        previous[studentId] === status
          ? ""
          : status,
    }));

    setSuccess(null);
  }

  function updateRemarks(
    studentId: number,
    value: string
  ) {
    setRemarks((previous) => ({
      ...previous,
      [studentId]: value,
    }));

    setSuccess(null);
  }

  function markAll(
    status: AttendanceStatus
  ) {
    const nextStatuses: StatusMap = {};

    for (const student of students) {
      nextStatuses[student.id] = status;
    }

    setStatuses(nextStatuses);
    setSuccess(null);
  }

  function clearAttendance() {
    const nextStatuses: StatusMap = {};

    for (const student of students) {
      nextStatuses[student.id] = "";
    }

    setStatuses(nextStatuses);
    setSuccess(null);
  }

  async function handleSave() {
    if (!selectedDate) {
      setError(
        "Please select an attendance date."
      );
      return;
    }

    if (!selectedBatch) {
      setError(
        "Please select a batch."
      );
      return;
    }

    const markedStudents =
      students.filter(
        (student) =>
          statuses[student.id] !== ""
      );

    if (markedStudents.length === 0) {
      setError(
        "Mark attendance for at least one student."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const markedAt =
        new Date().toISOString();

      await attendanceService.saveAttendance(
        markedStudents.map((student) => ({
          student_id: student.id,
          date: selectedDate,
          status:
            statuses[
              student.id
            ] as AttendanceStatus,
          class_id: null,
          batch: selectedBatch,
          instructor_id:
            selectedInstructorId
              ? Number(
                  selectedInstructorId
                )
              : null,
          remarks:
            remarks[student.id]?.trim() ||
            null,
          marked_by: "Manual",
          session_name: selectedBatch,
          marked_at: markedAt,
          attendance_mode: "Batch",
        }))
      );

      setSuccess(
        `Attendance saved for ${markedStudents.length} student${
          markedStudents.length === 1
            ? ""
            : "s"
        }.`
      );

      await loadAttendance();
    } catch (saveError) {
      console.error(
        "Attendance save failed:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>
            Loading attendance module...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Daily Attendance
              </h1>

              <p className="text-sm text-muted-foreground">
                Mark and manage daily
                student attendance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void loadAttendance()
            }
            disabled={
              loadingAttendance || saving
            }
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loadingAttendance
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          <Link
            href="/attendance/history"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <History className="mr-2 h-4 w-4" />

            Attendance History
          </Link>
        </div>
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

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />

          <h2 className="font-semibold">
            Attendance Session
          </h2>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Select a batch timing to load all active
          students assigned to that session.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="attendanceDate"
              className="text-sm font-medium"
            >
              Attendance Date
            </label>

            <input
              id="attendanceDate"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(
                  event.target.value
                )
              }
              disabled={saving}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="attendanceBatch"
              className="text-sm font-medium"
            >
              Batch
            </label>

            <select
              id="attendanceBatch"
              value={selectedBatch}
              onChange={(event) => {
                setSelectedBatch(
                  event.target.value
                );
                setStudentSearch("");
                setSuccess(null);
                setError(null);
              }}
              disabled={saving}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">
                Select batch
              </option>

              {batches.map((batch) => (
                <option
                  key={batch}
                  value={batch}
                >
                  {batch}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="attendanceInstructor"
              className="text-sm font-medium"
            >
              Instructor
            </label>

            <select
              id="attendanceInstructor"
              value={
                selectedInstructorId
              }
              onChange={(event) =>
                setSelectedInstructorId(
                  event.target.value
                )
              }
              disabled={saving}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">
                No instructor selected
              </option>

              {instructors.map(
                (instructor) => (
                  <option
                    key={instructor.id}
                    value={String(
                      instructor.id
                    )}
                  >
                    {instructor.name ||
                      `Instructor ${instructor.id}`}
                  </option>
                )
              )}
            </select>
          </div>

        </div>

        {selectedBatch && (
          <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Selected batch:
            </span>{" "}
            <span className="font-semibold">
              {selectedBatch}
            </span>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total Students"
          value={students.length}
          icon={
            <Users className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Present"
          value={presentCount}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Absent"
          value={absentCount}
          icon={
            <XCircle className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Leave"
          value={leaveCount}
          icon={
            <Clock3 className="h-5 w-5" />
          }
        />

        <SummaryCard
          label="Unmarked"
          value={unmarkedCount}
          icon={
            <UserMinus className="h-5 w-5" />
          }
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Student Attendance
            </h2>

            <p className="text-sm text-muted-foreground">
              {students.length === 0
                ? "No students loaded."
                : studentSearch.trim()
                  ? `Showing ${filteredStudents.length} of ${students.length} students. ${markedCount} marked.`
                  : `${markedCount} of ${students.length} students marked.`}
            </p>
          </div>

          {students.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-11 w-full sm:h-7 sm:w-auto"
                onClick={() =>
                  markAll("Present")
                }
                disabled={
                  saving ||
                  loadingAttendance
                }
              >
                <Check className="mr-1 h-4 w-4" />

                Mark Whole Batch Present
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-11 w-full sm:h-7 sm:w-auto"
                onClick={
                  clearAttendance
                }
                disabled={
                  saving ||
                  loadingAttendance
                }
              >
                <X className="mr-1 h-4 w-4" />

                Clear Whole Batch
              </Button>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="border-b p-3 sm:p-4">
            <SearchInput
              value={studentSearch}
              onChange={(event) =>
                setStudentSearch(event.target.value)
              }
              onClear={() => setStudentSearch("")}
              aria-label="Find a student in this batch"
              placeholder="Find student by name, phone, or code"
              className="h-11"
              containerClassName="w-full sm:max-w-md"
            />
            {studentSearch.trim() && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students. Batch-wide actions still apply to all students.
              </p>
            )}
          </div>
        )}

        {loadingAttendance ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span>
                Loading students and
                attendance...
              </span>
            </div>
          </div>
        ) : !selectedBatch ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />

            <h3 className="font-medium">
              Select a batch
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose a batch to load its
              active students.
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />

            <h3 className="font-medium">
              No students found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              No active students are assigned
              to this batch. Add or update the
              student batch from the Students
              module first.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />

            <h3 className="font-medium">
              No matching students
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Try a different name, phone number, or student code.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 h-11"
              onClick={() => setStudentSearch("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
          <div className="grid gap-3 p-3 md:hidden">
            {filteredStudents.map((student) => {
              const status =
                statuses[student.id] || "";

              return (
                <article
                  key={student.id}
                  className="rounded-2xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {student.photo_url ? (
                      <PrivateStudentPhoto
                        path={student.photo_url}
                        alt={student.Name || "Student"}
                        className="h-12 w-12 rounded-2xl border object-cover"
                        fallback={
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted text-sm font-semibold">
                            {getInitials(student.Name)}
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted text-sm font-semibold">
                        {getInitials(student.Name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {student.Name ||
                          `Student ${student.id}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {student.student_code ||
                          student.Phone ||
                          "No student code"}
                      </p>
                    </div>

                    {status ? (
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          status === "Present"
                            ? "bg-emerald-100 text-emerald-700"
                            : status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {status}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        Unmarked
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <StatusButton
                      label="Present"
                      active={status === "Present"}
                      onClick={() =>
                        updateStatus(
                          student.id,
                          "Present"
                        )
                      }
                      disabled={saving}
                    />

                    <StatusButton
                      label="Absent"
                      active={status === "Absent"}
                      onClick={() =>
                        updateStatus(
                          student.id,
                          "Absent"
                        )
                      }
                      disabled={saving}
                    />

                    <StatusButton
                      label="Leave"
                      active={status === "Leave"}
                      onClick={() =>
                        updateStatus(
                          student.id,
                          "Leave"
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  <input
                    type="text"
                    value={remarks[student.id] || ""}
                    onChange={(event) =>
                      updateRemarks(
                        student.id,
                        event.target.value
                      )
                    }
                    placeholder="Optional remarks"
                    disabled={saving}
                    className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                  />
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/40">
                <tr className="border-b text-left text-sm">
                  <th className="px-4 py-3 font-medium">
                    Student
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Program
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Attendance
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (student) => {
                    const status =
                      statuses[
                        student.id
                      ] || "";

                    return (
                      <tr
                        key={student.id}
                        className="border-b last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {student.photo_url ? (
                              <PrivateStudentPhoto
                                path={student.photo_url}
                                alt={
                                  student.Name ||
                                  "Student"
                                }
                                className="h-10 w-10 rounded-full border object-cover"
                                fallback={<div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold">{getInitials(student.Name)}</div>}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                                {getInitials(
                                  student.Name
                                )}
                              </div>
                            )}

                            <div>
                              <p className="font-medium">
                                {student.Name ||
                                  `Student ${student.id}`}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {student.student_code ||
                                  student.Phone ||
                                  "No student code"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm">
                            {student.Program ||
                              "Not specified"}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {selectedBatch}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <StatusButton
                              label="Present"
                              active={
                                status ===
                                "Present"
                              }
                              onClick={() =>
                                updateStatus(
                                  student.id,
                                  "Present"
                                )
                              }
                              disabled={saving}
                            />

                            <StatusButton
                              label="Absent"
                              active={
                                status ===
                                "Absent"
                              }
                              onClick={() =>
                                updateStatus(
                                  student.id,
                                  "Absent"
                                )
                              }
                              disabled={saving}
                            />

                            <StatusButton
                              label="Leave"
                              active={
                                status ===
                                "Leave"
                              }
                              onClick={() =>
                                updateStatus(
                                  student.id,
                                  "Leave"
                                )
                              }
                              disabled={saving}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={
                              remarks[
                                student.id
                              ] || ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateRemarks(
                                student.id,
                                event.target
                                  .value
                              )
                            }
                            placeholder="Optional remarks"
                            disabled={saving}
                            className="h-9 w-full min-w-48 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                          />
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {students.length > 0 && (
          <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 flex flex-col gap-3 border-t bg-background/95 p-4 shadow-[0_-12px_30px_-25px_rgba(0,0,0,0.65)] backdrop-blur sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-muted/20 sm:shadow-none">
            <p className="text-sm text-muted-foreground">
              {unmarkedCount > 0
                ? `${unmarkedCount} student${
                    unmarkedCount === 1
                      ? ""
                      : "s"
                  } still unmarked.`
                : "All students have been marked."}
            </p>

            <Button
              type="button"
              className="h-11 w-full sm:h-8 sm:w-auto"
              onClick={() =>
                void handleSave()
              }
              disabled={
                saving ||
                loadingAttendance ||
                markedCount === 0
              }
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : "Save Attendance"}
            </Button>
          </div>
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

type StatusButtonProps = {
  label: AttendanceStatus;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
};

function StatusButton({
  label,
  active,
  disabled,
  onClick,
}: StatusButtonProps) {
  const activeClass =
    label === "Present"
      ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600"
      : label === "Absent"
        ? "border-red-600 bg-red-600 text-white hover:bg-red-600"
        : "border-amber-500 bg-amber-500 text-white hover:bg-amber-500";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "inline-flex h-11 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors sm:h-9 sm:px-3 sm:text-sm",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? activeClass
          : "border-input bg-background hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
