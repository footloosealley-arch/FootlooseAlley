import { supabase } from "@/lib/supabase";

export const INSTRUCTOR_STATUSES = ["Active", "Inactive"] as const;
export type InstructorStatus = (typeof INSTRUCTOR_STATUSES)[number];

export interface Instructor {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  specialization: string;
  status: InstructorStatus;
  assigned_classes: number;
  assigned_students: number;
  attendance_records: number;
}

export interface InstructorInput {
  name: string;
  phone: string;
  specialization: string;
  status?: InstructorStatus;
}

function normalize(input: InstructorInput): Required<InstructorInput> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const specialization = input.specialization.trim();
  if (name.length < 2) throw new Error("Name must be at least 2 characters.");
  if (!/^\+?[0-9][0-9\s()-]{6,19}$/.test(phone)) throw new Error("Enter a valid phone number.");
  if (specialization.length < 2) throw new Error("Specialization must be at least 2 characters.");
  return { name, phone, specialization, status: input.status ?? "Active" };
}

async function getAll(): Promise<Instructor[]> {
  const [instructors, classes, students, attendance] = await Promise.all([
    supabase.from("Instructors").select("id,created_at,name,phone,specialization,status").order("name"),
    supabase.from("Classes").select("instructor_id"),
    supabase.from("Students").select("instructor_id"),
    supabase.from("Attendance").select("instructor_id"),
  ]);
  for (const result of [instructors, classes, students, attendance]) {
    if (result.error) throw result.error;
  }
  const counts = (rows: Array<{ instructor_id: number | null }>) => {
    const result = new Map<number, number>();
    for (const row of rows) {
      if (row.instructor_id === null) continue;
      result.set(row.instructor_id, (result.get(row.instructor_id) ?? 0) + 1);
    }
    return result;
  };
  const classCounts = counts((classes.data ?? []) as Array<{ instructor_id: number | null }>);
  const studentCounts = counts((students.data ?? []) as Array<{ instructor_id: number | null }>);
  const attendanceCounts = counts((attendance.data ?? []) as Array<{ instructor_id: number | null }>);
  return ((instructors.data ?? []) as Omit<Instructor, "assigned_classes" | "assigned_students" | "attendance_records">[]).map((item) => ({
    ...item,
    assigned_classes: classCounts.get(item.id) ?? 0,
    assigned_students: studentCounts.get(item.id) ?? 0,
    attendance_records: attendanceCounts.get(item.id) ?? 0,
  }));
}

async function create(input: InstructorInput): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").insert(normalize(input)).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return { ...(data as Omit<Instructor, "assigned_classes" | "assigned_students" | "attendance_records">), assigned_classes: 0, assigned_students: 0, attendance_records: 0 };
}

async function update(id: number, input: InstructorInput): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").update(normalize(input)).eq("id", id).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return { ...(data as Omit<Instructor, "assigned_classes" | "assigned_students" | "attendance_records">), assigned_classes: 0, assigned_students: 0, attendance_records: 0 };
}

async function setStatus(id: number, status: InstructorStatus): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").update({ status }).eq("id", id).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return { ...(data as Omit<Instructor, "assigned_classes" | "assigned_students" | "attendance_records">), assigned_classes: 0, assigned_students: 0, attendance_records: 0 };
}

async function remove(id: number): Promise<void> {
  const [classes, students, attendance] = await Promise.all([
    supabase.from("Classes").select("id", { count: "exact", head: true }).eq("instructor_id", id),
    supabase.from("Students").select("id", { count: "exact", head: true }).eq("instructor_id", id),
    supabase.from("Attendance").select("id", { count: "exact", head: true }).eq("instructor_id", id),
  ]);
  for (const result of [classes, students, attendance]) {
    if (result.error) throw result.error;
  }
  if ((classes.count ?? 0) + (students.count ?? 0) + (attendance.count ?? 0) > 0) {
    throw new Error("This instructor is in use. Deactivate them to preserve class, student, and attendance history.");
  }
  const { error } = await supabase.from("Instructors").delete().eq("id", id);
  if (error) throw error;
}

export const instructorsService = { getAll, create, update, setStatus, remove };
