import { supabase } from "@/lib/supabase";
import type { Attendance } from "@/types/attendance";


export async function getAttendanceByStudent(
  studentId: number
) {

  const { data, error } =
    await supabase
      .from("Attendance")
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "date",
        {
          ascending: false,
        }
      );


  if (error) {

    console.error(
      "Attendance fetch error:",
      error
    );

    throw error;

  }


  return (data ?? []) as Attendance[];

}




export async function markAttendance(
  attendance: Omit<
    Attendance,
    "id" | "created_at"
  >
) {


  const { data, error } =
    await supabase
      .from("Attendance")
      .insert(attendance)
      .select()
      .single();



  if (error) {

    console.error(
      "Attendance insert error:",
      error
    );

    throw error;

  }


  return data as Attendance;

}





export async function saveAttendance(
  rows: Omit<
    Attendance,
    "id" | "created_at"
  >[]
) {


  const { error } =
    await supabase
      .from("Attendance")
      .upsert(
        rows,
        {
          onConflict:
            "student_id,date",
        }
      );



  if (error) {

    console.error(
      "Attendance save error:",
      error
    );

    throw error;

  }

}