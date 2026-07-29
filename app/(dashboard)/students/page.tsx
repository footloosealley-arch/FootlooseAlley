"use client";

import {
  useMemo,
  useState,
} from "react";

import { Activity, BadgeIndianRupee, UserCheck, Users } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import AddStudentDialog from "@/components/students/AddStudentDialog";
import StudentFilters, {
  type StudentFilterValues,
} from "@/components/students/StudentFilters";
import StudentPagination from "@/components/students/StudentPagination";
import StudentIntakePanel from "@/components/students/StudentIntakePanel";
import StudentTable from "@/components/students/StudentTable";
import StudentToolbar from "@/components/students/StudentToolbar";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";

import { useAsync } from "@/hooks/useAsync";
import { studentsService } from "@/services/students.service";

type StudentSortField =
  | "created_at"
  | "Name"
  | "Fees_due"
  | "join_date";

type StudentSortOrder =
  | "asc"
  | "desc";

const VALID_SORT_FIELDS: StudentSortField[] = [
  "created_at",
  "Name",
  "Fees_due",
  "join_date",
];

function normalizeSortField(
  value: string
): StudentSortField {
  if (
    VALID_SORT_FIELDS.includes(
      value as StudentSortField
    )
  ) {
    return value as StudentSortField;
  }

  return "Name";
}

function normalizeSortOrder(
  value: string
): StudentSortOrder {
  return value === "desc"
    ? "desc"
    : "asc";
}

export default function StudentsPage() {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const [
    addStudentOpen,
    setAddStudentOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<StudentFilterValues>({
      status: "",
      classId: "",
      instructorId: "",
      sortBy: "Name",
      sortOrder: "asc",
    });

  const status =
    filters.status;

  const classId =
    filters.classId;

  const instructorId =
    filters.instructorId;

  const sortBy =
    normalizeSortField(
      filters.sortBy
    );

  const sortOrder =
    normalizeSortOrder(
      filters.sortOrder
    );

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsync(
    async () => {
      const [
        students,
        classes,
        instructors,
      ] = await Promise.all([
        studentsService.getStudents({
          page,
          pageSize,
          search:
            search.trim(),

          status:
            status ||
            undefined,

          classId:
            classId
              ? Number(classId)
              : undefined,

          instructorId:
            instructorId
              ? Number(
                  instructorId
                )
              : undefined,

          sortBy,
          sortOrder,
        }),

        studentsService.getClasses(),

        studentsService.getInstructors(),
      ]);

      return {
        students,
        classes,
        instructors,
      };
    },
    [page, pageSize, search, status, classId, instructorId, sortBy, sortOrder]
      .map((value) => `${String(value).length}:${String(value)}`)
      .join("|")
  );

  const total =
    data?.students.total ?? 0;

  const students =
    data?.students.data ?? [];

  const classes =
    data?.classes ?? [];

  const instructors =
    data?.instructors ?? [];

  const pageCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        total / pageSize
      )
    );
  }, [
    total,
    pageSize,
  ]);

  function handleFilterChange(
    key: keyof StudentFilterValues,
    value: string
  ) {
    setPage(1);

    setFilters(
      (previousFilters) => ({
        ...previousFilters,
        [key]: value,
      })
    );
  }

  function handleSearchChange(
    value: string
  ) {
    setPage(1);
    setSearch(value);
  }

  function handleRefresh() {
    void refresh();
  }

  function handleExport() {
    alert(
      "Excel export will be added later."
    );
  }

  function handleAddStudent() {
    setAddStudentOpen(true);
  }

  async function handleStudentAdded() {
    setPage(1);

    await refresh();
  }

  async function handleIntakeApproved() {
    setPage(1);

    await refresh();
  }

  function handlePageChange(
    newPage: number
  ) {
    if (
      newPage < 1 ||
      newPage > pageCount
    ) {
      return;
    }

    setPage(newPage);
  }

  function handlePageSizeChange(
    size: number
  ) {
    setPage(1);
    setPageSize(size);
  }

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage all studio students"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total students</span><Users className="h-4 w-4 text-primary" /></div>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Active on page</span><UserCheck className="h-4 w-4 text-emerald-600" /></div>
          <p className="mt-2 text-2xl font-bold">{students.filter((student) => (student.Status ?? "").toLowerCase() === "active").length}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Fees due on page</span><BadgeIndianRupee className="h-4 w-4 text-rose-600" /></div>
          <p className="mt-2 text-2xl font-bold">₹{students.reduce((sum, student) => sum + Number(student.Fees_due ?? 0), 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Average attendance</span><Activity className="h-4 w-4 text-amber-600" /></div>
          <p className="mt-2 text-2xl font-bold">{students.length ? Math.round(students.reduce((sum, student) => sum + Number(student.attendance_percentage ?? 0), 0) / students.length) : 0}%</p>
        </div>
      </div>

      <StudentIntakePanel
        onStudentCreated={
          handleIntakeApproved
        }
      />

      <StudentToolbar
        search={search}
        onSearchChange={
          handleSearchChange
        }
        onRefresh={
          handleRefresh
        }
        onExport={
          handleExport
        }
        onAddStudent={
          handleAddStudent
        }
      />

      <StudentFilters
        filters={filters}
        classes={classes}
        instructors={
          instructors
        }
        onChange={
          handleFilterChange
        }
      />

      {loading && (
        <LoadingCard title="Loading Students..." />
      )}

      {!loading &&
        error && (
          <ErrorCard
            title="Unable to load students"
            message={
              error.message
            }
            onRetry={
              handleRefresh
            }
          />
        )}

      {!loading &&
        !error &&
        data && (
          <>
            <StudentTable
              students={
                students
              }
            />

            <StudentPagination
              page={page}
              pageSize={
                pageSize
              }
              total={total}
              onPageChange={
                handlePageChange
              }
              onPageSizeChange={
                handlePageSizeChange
              }
            />
          </>
        )}

      <AddStudentDialog
        open={
          addStudentOpen
        }
        onOpenChange={
          setAddStudentOpen
        }
        onStudentAdded={
          handleStudentAdded
        }
      />
    </>
  );
}
