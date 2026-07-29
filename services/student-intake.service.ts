import { supabase } from "@/lib/supabase";

import type {
  StudentIntakeSubmission,
} from "@/types/student-intake";

class StudentIntakeService {
  async getPending(): Promise<
    StudentIntakeSubmission[]
  > {
    const { data, error } =
      await supabase
        .from(
          "Student_Intake_Submissions"
        )
        .select("*")
        .eq("status", "Pending")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load pending registrations."
      );
    }

    return (
      data ?? []
    ) as StudentIntakeSubmission[];
  }

  async approve(
    submissionId: number
  ): Promise<number> {
    const { data, error } =
      await supabase.rpc(
        "approve_student_intake",
        {
          submission_id:
            submissionId,
        }
      );

    if (error) {
      throw new Error(
        error.message ||
          "Unable to approve this registration."
      );
    }

    const studentId = Number(data);

    if (
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      throw new Error(
        "The student was created without a valid ID."
      );
    }

    return studentId;
  }

  async reject(
    submissionId: number,
    reason?: string
  ): Promise<void> {
    const { error } =
      await supabase.rpc(
        "reject_student_intake",
        {
          submission_id:
            submissionId,
          reason:
            reason?.trim() ||
            null,
        }
      );

    if (error) {
      throw new Error(
        error.message ||
          "Unable to reject this registration."
      );
    }
  }
}

export const studentIntakeService =
  new StudentIntakeService();
