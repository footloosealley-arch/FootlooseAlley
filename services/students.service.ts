import { supabase } from "@/lib/supabase";

import type {
  Attendance,
  Membership,
  MembershipEvent,
  Payment,
  Student,
} from "@/types/database";

export interface StudentFilters {
  search?: string;
  status?: string;
  classId?: number;
  instructorId?: number;
  sortBy?:
    | "Name"
    | "join_date"
    | "created_at"
    | "Fees_due";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface StudentListResponse {
  data: Student[];
  total: number;
}

export interface StudentNote {
  id: number;
  created_at: string;
  student_id: number;
  note: string | null;
  title?: string | null;
  created_by?: string | null;
}

export interface StudentClassDetails {
  id: number;
  class_name: string | null;
  program: string | null;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface StudentInstructorDetails {
  id: number;
  name: string | null;
  phone: string | null;
  specialization: string | null;
}

export interface StudentWithRelations
  extends Student {
  Classes?: StudentClassDetails | null;
  Instructors?:
    | StudentInstructorDetails
    | null;
}

export interface StudentAttendanceRecord
  extends Attendance {
  Classes?: {
    id: number;
    class_name: string | null;
  } | null;

  Instructors?: {
    id: number;
    name: string | null;
  } | null;
}

export interface StudentProfileData {
  student: StudentWithRelations;
  attendance: StudentAttendanceRecord[];
  payments: Payment[];
  notes: StudentNote[];
  memberships: Membership[];
  membershipEvents: MembershipEvent[];
}

class StudentsService {
  private validateStudentId(
    id: number
  ): void {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Invalid student ID."
      );
    }
  }

  async getStudents(
    filters: StudentFilters = {}
  ): Promise<StudentListResponse> {
    const {
      search = "",
      status,
      classId,
      instructorId,
      sortBy = "Name",
      sortOrder = "asc",
      page = 1,
      pageSize = 20,
    } = filters;

    let query = supabase
      .from("Students")
      .select(
        `
          *,
          Classes (
            id,
            class_name,
            program
          ),
          Instructors (
            id,
            name
          )
        `,
        {
          count: "exact",
        }
      );

    const normalizedSearch =
      search.trim();

    if (normalizedSearch) {
      query = query.or(
        `"Name".ilike.%${normalizedSearch}%,"Phone".ilike.%${normalizedSearch}%,student_code.ilike.%${normalizedSearch}%`
      );
    }

    if (
      status &&
      status !== "All"
    ) {
      query = query.eq(
        "Status",
        status
      );
    }

    if (classId) {
      query = query.eq(
        "class_id",
        classId
      );
    }

    if (instructorId) {
      query = query.eq(
        "instructor_id",
        instructorId
      );
    }

    query = query.order(sortBy, {
      ascending:
        sortOrder === "asc",
    });

    const safePage =
      Math.max(1, page);

    const safePageSize =
      Math.max(1, pageSize);

    const from =
      (safePage - 1) *
      safePageSize;

    const to =
      from +
      safePageSize -
      1;

    query = query.range(
      from,
      to
    );

    const {
      data,
      error,
      count,
    } = await query;

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load students."
      );
    }

    return {
      data:
        (data ??
          []) as Student[],
      total: count ?? 0,
    };
  }

  async getStudent(
    id: number
  ): Promise<StudentWithRelations> {
    this.validateStudentId(id);

    const { data, error } =
      await supabase
        .from("Students")
        .select(
          `
            *,
            Classes (
              id,
              class_name,
              program,
              day,
              start_time,
              end_time
            ),
            Instructors (
              id,
              name,
              phone,
              specialization
            )
          `
        )
        .eq("id", id)
        .single();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load student."
      );
    }

    return data as StudentWithRelations;
  }

  async getStudentById(
    id: number
  ): Promise<StudentWithRelations | null> {
    this.validateStudentId(id);

    const { data, error } =
      await supabase
        .from("Students")
        .select(
          `
            *,
            Classes (
              id,
              class_name,
              program,
              day,
              start_time,
              end_time
            ),
            Instructors (
              id,
              name,
              phone,
              specialization
            )
          `
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load student."
      );
    }

    if (!data) {
      return null;
    }

    return data as StudentWithRelations;
  }

  async getStudentProfile(
    id: number
  ): Promise<StudentProfileData | null> {
    this.validateStudentId(id);

    const student =
      await this.getStudentById(id);

    if (!student) {
      return null;
    }

    const [
      attendance,
      payments,
      notes,
      memberships,
      membershipEvents,
    ] = await Promise.all([
      this.getStudentAttendance(id),
      this.getStudentPayments(id),
      this.getStudentNotes(id),
      this.getStudentMemberships(id),
      this.getStudentMembershipEvents(id),
    ]);

    return {
      student,
      attendance,
      payments,
      notes,
      memberships,
      membershipEvents,
    };
  }

  async createStudent(
    student: Partial<Student>
  ): Promise<Student> {
    const { data, error } =
      await supabase
        .from("Students")
        .insert(student)
        .select()
        .single();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to create student."
      );
    }

    return data as Student;
  }

  async updateStudent(
    id: number,
    student: Partial<Student>
  ): Promise<Student> {
    this.validateStudentId(id);

    const { data, error } =
      await supabase
        .from("Students")
        .update(student)
        .eq("id", id)
        .select()
        .single();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to update student."
      );
    }

    return data as Student;
  }

  async deleteStudent(
    id: number
  ): Promise<void> {
    this.validateStudentId(id);

    const { error } =
      await supabase
        .from("Students")
        .delete()
        .eq("id", id);

    if (error) {
      throw new Error(
        error.message ||
          "Unable to delete student."
      );
    }
  }

  async freezeMembership(
    studentId: number
  ): Promise<void> {
    this.validateStudentId(
      studentId
    );

    const { error } =
      await supabase
        .from("Students")
        .update({
          membership_frozen: true,
        })
        .eq("id", studentId);

    if (error) {
      throw new Error(
        error.message ||
          "Unable to freeze membership."
      );
    }
  }

  async activateMembership(
    studentId: number
  ): Promise<void> {
    this.validateStudentId(
      studentId
    );

    const { error } =
      await supabase
        .from("Students")
        .update({
          membership_frozen: false,
        })
        .eq("id", studentId);

    if (error) {
      throw new Error(
        error.message ||
          "Unable to activate membership."
      );
    }
  }

  async getStudentAttendance(
    studentId: number
  ): Promise<
    StudentAttendanceRecord[]
  > {
    this.validateStudentId(
      studentId
    );

    const { data, error } =
      await supabase
        .from("Attendance")
        .select(
          `
            *,
            Classes (
              id,
              class_name
            ),
            Instructors (
              id,
              name
            )
          `
        )
        .eq(
          "student_id",
          studentId
        )
        .order("date", {
          ascending: false,
        });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load attendance."
      );
    }

    return (
      data ?? []
    ) as StudentAttendanceRecord[];
  }

  async getStudentPayments(
    studentId: number
  ): Promise<Payment[]> {
    this.validateStudentId(
      studentId
    );

    const { data, error } =
      await supabase
        .from("Payments")
        .select("*")
        .eq(
          "student_id",
          studentId
        )
        .order(
          "payment_date",
          {
            ascending: false,
          }
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load payments."
      );
    }

    return (
      data ?? []
    ) as Payment[];
  }

  async getStudentNotes(
    studentId: number
  ): Promise<StudentNote[]> {
    this.validateStudentId(
      studentId
    );

    const { data, error } =
      await supabase
        .from("Student_Notes")
        .select("*")
        .eq(
          "student_id",
          studentId
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      const missingTable =
        error.code === "42P01" ||
        error.message
          .toLowerCase()
          .includes(
            "student_notes"
          );

      if (missingTable) {
        return [];
      }

      throw new Error(
        error.message ||
          "Unable to load notes."
      );
    }

    return (
      data ?? []
    ) as StudentNote[];
  }

  async getStudentMemberships(studentId: number): Promise<Membership[]> {
    this.validateStudentId(studentId);
    const { data, error } = await supabase
      .from("Memberships")
      .select("*")
      .eq("student_id", studentId)
      .order("start_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message || "Unable to load membership history.");
    return (data ?? []) as Membership[];
  }

  async getStudentMembershipEvents(studentId: number): Promise<MembershipEvent[]> {
    this.validateStudentId(studentId);
    const { data, error } = await supabase
      .from("Membership_Events")
      .select("*")
      .eq("student_id", studentId)
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message || "Unable to load membership timeline.");
    return (data ?? []) as MembershipEvent[];
  }

  async getClasses() {
    const { data, error } =
      await supabase
        .from("Classes")
        .select("*")
        .eq(
          "status",
          "Active"
        )
        .order("class_name");

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load classes."
      );
    }

    return data ?? [];
  }

  async getInstructors() {
    const { data, error } =
      await supabase
        .from("Instructors")
        .select("*")
        .eq(
          "status",
          "Active"
        )
        .order("name");

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load instructors."
      );
    }

    return data ?? [];
  }

  async studentExists(
    phone: string,
    excludeStudentId?: number
  ): Promise<boolean> {
    const normalizedPhone =
      phone.trim();

    if (!normalizedPhone) {
      return false;
    }

    let query = supabase
      .from("Students")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "Phone",
        normalizedPhone
      );

    if (excludeStudentId) {
      query = query.neq(
        "id",
        excludeStudentId
      );
    }

    const { count, error } =
      await query;

    if (error) {
      throw new Error(
        error.message ||
          "Unable to check student."
      );
    }

    return (count ?? 0) > 0;
  }
}

export const studentsService =
  new StudentsService();
