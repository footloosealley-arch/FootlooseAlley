import { supabase } from "@/lib/supabase";

export async function getStudentSchedules(studentId: number) {
  const { data, error } = await supabase
    .from("Student_Schedule")
    .select("schedule_id")
    .eq("student_id", studentId);

  if (error) throw error;

  return data ?? [];
}

export async function saveStudentSchedules(
  studentId: number,
  scheduleIds: number[]
) {
  const { error: deleteError } = await supabase
    .from("Student_Schedule")
    .delete()
    .eq("student_id", studentId);

  if (deleteError) throw deleteError;

  if (scheduleIds.length === 0) return;

  const rows = scheduleIds.map((scheduleId) => ({
    student_id: studentId,
    schedule_id: scheduleId,
  }));

  const { error: insertError } = await supabase
    .from("Student_Schedule")
    .insert(rows);

  if (insertError) throw insertError;
}