import { supabase } from "@/lib/supabase";

export const CLASS_STATUSES = ["Active", "Inactive"] as const;
export const CLASS_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export interface StudioClass {
  id: number;
  created_at: string;
  class_name: string;
  program: string;
  day: string;
  start_time: string;
  end_time: string;
  instructor_id: number | null;
  status: ClassStatus;
  max_capacity: number;
  instructor: { name: string } | null;
  enrolled_count: number;
  attendance_count: number;
  public_booking_enabled: boolean;
}

export interface ClassInput {
  class_name: string;
  program: string;
  day: string;
  start_time: string;
  end_time: string;
  instructor_id: number | null;
  max_capacity: number;
  status?: ClassStatus;
  public_booking_enabled?: boolean;
}

export interface ActiveInstructor { id: number; name: string }

interface InstructorReference { id: number; name: string }
interface ClassReference { class_id: number | null }

const fields = "id,created_at,class_name,program,day,start_time,end_time,instructor_id,status,max_capacity,public_booking_enabled";
const dayOrder = new Map<string, number>(CLASS_DAYS.map((day, index) => [day, index]));

function message(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return `${fallback} ${error.message}`;
  return fallback;
}

function normalize(input: ClassInput) {
  const class_name = input.class_name.trim(), program = input.program.trim();
  if (class_name.length < 2) throw new Error("Class name must be at least 2 characters.");
  if (!program) throw new Error("Program is required.");
  if (!CLASS_DAYS.includes(input.day as (typeof CLASS_DAYS)[number])) throw new Error("Select a valid day.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end_time)) throw new Error("Enter valid start and end times.");
  if (input.start_time >= input.end_time) throw new Error("End time must be after start time.");
  if (!Number.isInteger(input.max_capacity) || input.max_capacity < 1 || input.max_capacity > 1000) throw new Error("Capacity must be between 1 and 1000.");
  return { ...input, class_name, program, status: input.status ?? "Active", public_booking_enabled: input.public_booking_enabled ?? false };
}

async function ensureScheduleAvailable(input: ClassInput, currentId?: number): Promise<void> {
  let duplicateQuery = supabase
    .from("Classes")
    .select("id")
    .eq("class_name", input.class_name.trim())
    .eq("day", input.day)
    .eq("start_time", input.start_time)
    .eq("end_time", input.end_time)
    .limit(1);
  if (currentId) duplicateQuery = duplicateQuery.neq("id", currentId);
  const { data: duplicate, error: duplicateError } = await duplicateQuery;
  if (duplicateError) throw new Error(message(duplicateError, "Unable to validate the class schedule."));
  if ((duplicate ?? []).length > 0) throw new Error("This class already exists at the selected day and time.");

  if (input.instructor_id === null || input.status === "Inactive") return;
  let conflictQuery = supabase
    .from("Classes")
    .select("id,class_name,start_time,end_time")
    .eq("day", input.day)
    .eq("instructor_id", input.instructor_id)
    .eq("status", "Active")
    .lt("start_time", input.end_time)
    .gt("end_time", input.start_time)
    .limit(1);
  if (currentId) conflictQuery = conflictQuery.neq("id", currentId);
  const { data: conflict, error: conflictError } = await conflictQuery;
  if (conflictError) throw new Error(message(conflictError, "Unable to validate instructor availability."));
  if ((conflict ?? []).length > 0) throw new Error("The selected instructor already has an overlapping active class.");
}

async function getAll(): Promise<StudioClass[]> {
  const [classesResult, instructorsResult, studentsResult, attendanceResult] = await Promise.all([
    supabase.from("Classes").select(fields),
    supabase.from("Instructors").select("id,name"),
    supabase.from("Students").select("class_id"),
    supabase.from("Attendance").select("class_id"),
  ]);
  if (classesResult.error) throw new Error(message(classesResult.error, "Unable to load classes."));
  if (instructorsResult.error) throw new Error(message(instructorsResult.error, "Unable to resolve class instructors."));
  if (studentsResult.error) throw new Error(message(studentsResult.error, "Unable to load class enrolment totals."));
  if (attendanceResult.error) throw new Error(message(attendanceResult.error, "Unable to load class attendance totals."));

  const instructorNames = new Map(
    ((instructorsResult.data ?? []) as InstructorReference[]).map(({ id, name }) => [id, name])
  );
  const countReferences = (rows: ClassReference[]) => {
    const counts = new Map<number, number>();
    for (const row of rows) {
      if (row.class_id === null) continue;
      counts.set(row.class_id, (counts.get(row.class_id) ?? 0) + 1);
    }
    return counts;
  };
  const enrolmentCounts = countReferences((studentsResult.data ?? []) as ClassReference[]);
  const attendanceCounts = countReferences((attendanceResult.data ?? []) as ClassReference[]);
  return ((classesResult.data ?? []) as Omit<StudioClass, "instructor" | "enrolled_count" | "attendance_count">[])
    .map((classItem) => ({
      ...classItem,
      instructor: classItem.instructor_id !== null && instructorNames.has(classItem.instructor_id)
        ? { name: instructorNames.get(classItem.instructor_id)! }
        : null,
      enrolled_count: enrolmentCounts.get(classItem.id) ?? 0,
      attendance_count: attendanceCounts.get(classItem.id) ?? 0,
    }))
    .sort((left, right) =>
      (dayOrder.get(left.day) ?? CLASS_DAYS.length) - (dayOrder.get(right.day) ?? CLASS_DAYS.length)
      || left.start_time.localeCompare(right.start_time)
      || left.class_name.localeCompare(right.class_name)
    );
}

async function getActiveInstructors(): Promise<ActiveInstructor[]> {
  const { data, error } = await supabase.from("Instructors").select("id,name").eq("status", "Active").order("name");
  if (error) throw new Error(message(error, "Unable to load active instructors."));
  return (data ?? []) as ActiveInstructor[];
}

async function create(input: ClassInput): Promise<StudioClass> {
  const normalized = normalize(input);
  await ensureScheduleAvailable(normalized);
  const { data, error } = await supabase.from("Classes").insert(normalized).select(fields).single();
  if (error) throw new Error(message(error, "Unable to add class."));
  return { ...(data as Omit<StudioClass, "instructor" | "enrolled_count" | "attendance_count">), instructor: null, enrolled_count: 0, attendance_count: 0 };
}

async function update(id: number, input: ClassInput): Promise<StudioClass> {
  const normalized = normalize(input);
  await ensureScheduleAvailable(normalized, id);
  const { data, error } = await supabase.from("Classes").update(normalized).eq("id", id).select(fields).single();
  if (error) throw new Error(message(error, "Unable to update class."));
  return { ...(data as Omit<StudioClass, "instructor" | "enrolled_count" | "attendance_count">), instructor: null, enrolled_count: 0, attendance_count: 0 };
}

async function setStatus(id: number, status: ClassStatus): Promise<StudioClass> {
  const { data, error } = await supabase.from("Classes").update({ status }).eq("id", id).select(fields).single();
  if (error) throw new Error(message(error, "Unable to change class status."));
  return { ...(data as Omit<StudioClass, "instructor" | "enrolled_count" | "attendance_count">), instructor: null, enrolled_count: 0, attendance_count: 0 };
}

async function remove(id: number): Promise<void> {
  const [{ count: students, error: studentError }, { count: attendance, error: attendanceError }] = await Promise.all([
    supabase.from("Students").select("id", { count: "exact", head: true }).eq("class_id", id),
    supabase.from("Attendance").select("id", { count: "exact", head: true }).eq("class_id", id),
  ]);
  if (studentError) throw new Error(message(studentError, "Unable to check linked students."));
  if (attendanceError) throw new Error(message(attendanceError, "Unable to check attendance history."));
  if ((students ?? 0) > 0 || (attendance ?? 0) > 0) {
    throw new Error("This class is in use. Deactivate it to preserve student and attendance history.");
  }
  const { error } = await supabase.from("Classes").delete().eq("id", id);
  if (error) throw new Error(message(error, "Unable to delete class."));
}

export const classesService = { getAll, getActiveInstructors, create, update, setStatus, remove };
