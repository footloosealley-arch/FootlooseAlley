import { supabase } from "@/lib/supabase";
import type { StudentNote } from "@/types/student-note";

export async function getStudentNotes(studentId: number) {
  const { data, error } = await supabase
    .from("Student_Notes")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as StudentNote[];
}

export async function addStudentNote(
  studentId: number,
  note: string
) {
  const { data, error } = await supabase
    .from("Student_Notes")
    .insert({
      student_id: studentId,
      note,
    })
    .select()
    .single();

  if (error) throw error;

  return data as StudentNote;
}