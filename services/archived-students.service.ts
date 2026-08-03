import { supabase } from "@/lib/supabase";
import type { Student } from "@/types/database";

export interface ArchivedStudentListResponse {
  data: Student[];
  total: number;
}

class ArchivedStudentsService {
  private validateStudentId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid student ID.");
    }
  }

  async getArchivedStudents(): Promise<ArchivedStudentListResponse> {
    const { data, error, count } = await supabase
      .from("Students")
      .select("*", { count: "exact" })
      .eq("Status", "Archived")
      .order("Name", { ascending: true });

    if (error) {
      throw new Error(error.message || "Unable to load archived students.");
    }

    return {
      data: (data ?? []) as Student[],
      total: count ?? 0,
    };
  }

  async restoreStudent(id: number): Promise<void> {
    this.validateStudentId(id);

    const { error } = await supabase
      .from("Students")
      .update({
        Status: "Active",
        membership_frozen: false,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message || "Unable to restore student.");
    }
  }

  async permanentlyDeleteStudent(id: number): Promise<void> {
    this.validateStudentId(id);

    const relatedTables = [
      "Membership_Events",
      "Memberships",
      "Attendance",
      "Student_Notes",
      "Payments",
    ] as const;

    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq("student_id", id);

      if (error) {
        const missingOptionalTable =
          error.code === "42P01" ||
          error.code === "PGRST205" ||
          error.message.toLowerCase().includes("could not find the table");

        if (!missingOptionalTable) {
          throw new Error(
            error.message || `Unable to delete linked records from ${table}.`
          );
        }
      }
    }

    const { error } = await supabase.from("Students").delete().eq("id", id);

    if (error) {
      throw new Error(
        error.message ||
          "Unable to permanently delete this student because another linked record still exists."
      );
    }
  }
}

export const archivedStudentsService = new ArchivedStudentsService();
