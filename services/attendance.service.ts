import { supabase } from "@/lib/supabase";

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

export type AttendanceClass = {
  id: number;
  class_name: string | null;
  program: string | null;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
  instructor_id: number | null;
  status: string | null;
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
  class_id: number;
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
    const { data, error } = await supabase
      .from("Students")
      .select("batch,Status")
      .not("batch", "is", null)
      .order("batch", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load student batches."
        )
      );
    }

    const batchRows = (data ?? []) as unknown as {
      batch: string | null;
      Status: string | null;
    }[];
    const uniqueBatches = new Map<string, string>();

    for (const row of batchRows) {
      const batch = row.batch?.trim();

      if (!batch || !isActiveStatus(row.Status)) {
        continue;
      }

      const normalizedBatch = batch.toLowerCase();

      if (!uniqueBatches.has(normalizedBatch)) {
        uniqueBatches.set(normalizedBatch, batch);
      }
    }

    return [...uniqueBatches.values()].sort((left, right) =>
      left.localeCompare(right)
    );
  },

  async getClasses(): Promise<
    AttendanceClass[]
  > {
    const { data, error } = await supabase
      .from("Classes")
      .select(
        `
          id,
          class_name,
          program,
          day,
          start_time,
          end_time,
          instructor_id,
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
      (data ?? []) as AttendanceClass[];

    return classes.filter((item) =>
      isActiveStatus(item.status)
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

  async getStudentsForClass(
    classId: number
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
      .eq("class_id", classId)
      .order("Name", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load students."
        )
      );
    }

    const students =
      (data ?? []) as AttendanceStudent[];

    return students.filter((student) =>
      isActiveStatus(student.Status)
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
      .eq("batch", batch)
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

    return students.filter((student) =>
      isActiveStatus(student.Status)
    );
  },

  async getAttendance(
    date: string,
    classId: number
  ): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("Attendance")
      .select("*")
      .eq("date", date)
      .eq("class_id", classId)
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
          "student_id,class_id,date",
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
