import { supabase } from "@/lib/supabase";

export type AttendanceHistoryStatus =
  | "Present"
  | "Absent"
  | "Leave";

export type AttendanceHistoryRecord = {
  id: number;
  created_at: string;
  student_id: number | null;
  date: string | null;
  status: string | null;
  class_id: number | null;
  instructor_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  marked_by: string | null;
  session_name: string | null;
  marked_at: string | null;
  attendance_mode: string | null;

  student: {
    id: number;
    Name: string | null;
    Phone: string | null;
    Program: string | null;
    student_code: string | null;
    photo_url: string | null;
  } | null;

  studio_class: {
    id: number;
    class_name: string | null;
    program: string | null;
    start_time: string | null;
    end_time: string | null;
  } | null;

  instructor: {
    id: number;
    name: string | null;
  } | null;
};

export type AttendanceHistoryClass = {
  id: number;
  class_name: string | null;
  program: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
};

export type AttendanceHistoryFilters = {
  startDate?: string;
  endDate?: string;
  classId?: number | null;
  status?: AttendanceHistoryStatus | "";
  search?: string;
};

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function isActiveStatus(status: string | null) {
  if (!status) {
    return true;
  }

  const normalizedStatus = status
    .trim()
    .toLowerCase();

  return ![
    "inactive",
    "cancelled",
    "canceled",
    "deleted",
  ].includes(normalizedStatus);
}

export const attendanceHistoryService = {
  async getClasses(): Promise<
    AttendanceHistoryClass[]
  > {
    const { data, error } = await supabase
      .from("Classes")
      .select(
        `
          id,
          class_name,
          program,
          start_time,
          end_time,
          status
        `
      )
      .order("class_name", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load classes."
        )
      );
    }

    const classes =
      (data ??
        []) as AttendanceHistoryClass[];

    return classes.filter((item) =>
      isActiveStatus(item.status)
    );
  },

  async getHistory(
    filters: AttendanceHistoryFilters
  ): Promise<AttendanceHistoryRecord[]> {
    let query = supabase
      .from("Attendance")
      .select(
        `
          id,
          created_at,
          student_id,
          date,
          status,
          class_id,
          instructor_id,
          check_in_time,
          check_out_time,
          remarks,
          marked_by,
          session_name,
          marked_at,
          attendance_mode,
          student:Students (
            id,
            Name,
            Phone,
            Program,
            student_code,
            photo_url
          ),
          studio_class:Classes (
            id,
            class_name,
            program,
            start_time,
            end_time
          ),
          instructor:Instructors (
            id,
            name
          )
        `
      )
      .order("date", {
        ascending: false,
      })
      .order("marked_at", {
        ascending: false,
      })
      .limit(1000);

    if (filters.startDate) {
      query = query.gte(
        "date",
        filters.startDate
      );
    }

    if (filters.endDate) {
      query = query.lte(
        "date",
        filters.endDate
      );
    }

    if (filters.classId) {
      query = query.eq(
        "class_id",
        filters.classId
      );
    }

    if (filters.status) {
      query = query.eq(
        "status",
        filters.status
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load attendance history."
        )
      );
    }

    let records =
      (data ??
        []) as unknown as AttendanceHistoryRecord[];

    const searchText =
      filters.search?.trim().toLowerCase();

    if (searchText) {
      records = records.filter((record) => {
        const studentName =
          record.student?.Name?.toLowerCase() ??
          "";

        const phone =
          record.student?.Phone?.toLowerCase() ??
          "";

        const studentCode =
          record.student?.student_code?.toLowerCase() ??
          "";

        const program =
          record.student?.Program?.toLowerCase() ??
          "";

        const session =
          record.session_name?.toLowerCase() ??
          "";

        return (
          studentName.includes(searchText) ||
          phone.includes(searchText) ||
          studentCode.includes(searchText) ||
          program.includes(searchText) ||
          session.includes(searchText)
        );
      });
    }

    return records;
  },
};