import { supabase } from "@/lib/supabase";
import {
  parseBatchAssignments,
  STUDIO_BATCH_OPTIONS,
} from "@/lib/studio-batches";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Leave";

export type AttendanceStudent = {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  photo_url: string | null;
  student_code: string | null;
  batch: string | null;
  class_id: number | null;
  instructor_id: number | null;
};

export type AttendanceInstructor = {
  id: number;
  name: string | null;
  phone: string | null;
  specialization: string | null;
  status: string | null;
};

export type AttendanceRecord = {
  id: number;
  created_at: string;
  student_id: number | null;
  date: string | null;
  status: string | null;
  class_id: number | null;
  batch: string | null;
  instructor_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  marked_by: string | null;
  session_name: string | null;
  marked_at: string | null;
  attendance_mode: string | null;
};

export type SaveAttendanceItem = {
  student_id: number;
  date: string;
  status: AttendanceStatus;
  class_id: number | null;
  batch: string;
  instructor_id: number | null;
  remarks: string | null;
  marked_by: string;
  session_name: string | null;
  marked_at: string;
  attendance_mode: string;
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

  const normalizedStatus =
    status.trim().toLowerCase();

  return ![
    "inactive",
    "cancelled",
    "canceled",
    "deleted",
  ].includes(normalizedStatus);
}

function normalizeAttendanceStatus(
  status: string | null
): AttendanceStatus | null {
  if (!status) {
    return null;
  }

  const normalizedStatus =
    status.trim().toLowerCase();

  if (normalizedStatus === "present") {
    return "Present";
  }

  if (normalizedStatus === "absent") {
    return "Absent";
  }

  if (
    normalizedStatus === "leave" ||
    normalizedStatus === "on leave"
  ) {
    return "Leave";
  }

  return null;
}

export const attendanceService = {
  async getBatches(): Promise<string[]> {
    return STUDIO_BATCH_OPTIONS.map(
      (option) => option.batch
    );
  },

  async getInstructors(): Promise<
    AttendanceInstructor[]
  > {
    const { data, error } = await supabase
      .from("Instructors")
      .select(
        `
          id,
          name,
          phone,
          specialization,
          status
        `
      )
      .order("name", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load instructors."
        )
      );
    }

    const instructors =
      (data ?? []) as AttendanceInstructor[];

    return instructors.filter((item) =>
      isActiveStatus(item.status)
    );
  },

  async getStudentsForBatch(
    batch: string
  ): Promise<AttendanceStudent[]> {
    const { data, error } = await supabase
      .from("Students")
      .select(
        `
          id,
          Name,
          Phone,
          Program,
          Status,
          photo_url,
          student_code,
          batch,
          class_id,
          instructor_id
        `
      )
      .order("Name", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load students for this batch."
        )
      );
    }

    const students =
      (data ?? []) as AttendanceStudent[];

    return students.filter(
      (student) =>
        isActiveStatus(student.Status) &&
        parseBatchAssignments(
          student.batch
        ).includes(batch)
    );
  },

  async getAttendance(
    date: string,
    batch: string
  ): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("Attendance")
      .select("*")
      .eq("date", date)
      .eq("batch", batch)
      .order("student_id", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load attendance."
        )
      );
    }

    return (data ??
      []) as AttendanceRecord[];
  },

  async saveAttendance(
    items: SaveAttendanceItem[]
  ): Promise<AttendanceRecord[]> {
    if (items.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("Attendance")
      .upsert(items, {
        onConflict:
          "student_id,date,batch",
      })
      .select("*");

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to save attendance."
        )
      );
    }

    return (data ??
      []) as AttendanceRecord[];
  },

  normalizeStatus:
    normalizeAttendanceStatus,
};
