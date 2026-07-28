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
}

export interface ActiveInstructor { id: number; name: string }

interface InstructorReference { id: number; name: string }

const fields = "id,created_at,class_name,program,day,start_time,end_time,instructor_id,status,max_capacity";
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
  return { ...input, class_name, program, status: input.status ?? "Active" };
}

async function getAll(): Promise<StudioClass[]> {
  const [classesResult, instructorsResult] = await Promise.all([
    supabase.from("Classes").select(fields),
    supabase.from("Instructors").select("id,name"),
  ]);
  if (classesResult.error) throw new Error(message(classesResult.error, "Unable to load classes."));
  if (instructorsResult.error) throw new Error(message(instructorsResult.error, "Unable to resolve class instructors."));

  const instructorNames = new Map(
    ((instructorsResult.data ?? []) as InstructorReference[]).map(({ id, name }) => [id, name])
  );
  return ((classesResult.data ?? []) as Omit<StudioClass, "instructor">[])
    .map((classItem) => ({
      ...classItem,
      instructor: classItem.instructor_id !== null && instructorNames.has(classItem.instructor_id)
        ? { name: instructorNames.get(classItem.instructor_id)! }
        : null,
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
  const { data, error } = await supabase.from("Classes").insert(normalize(input)).select(fields).single();
  if (error) throw new Error(message(error, "Unable to add class."));
  return { ...(data as Omit<StudioClass, "instructor">), instructor: null };
}

async function update(id: number, input: ClassInput): Promise<StudioClass> {
  const { data, error } = await supabase.from("Classes").update(normalize(input)).eq("id", id).select(fields).single();
  if (error) throw new Error(message(error, "Unable to update class."));
  return { ...(data as Omit<StudioClass, "instructor">), instructor: null };
}

async function setStatus(id: number, status: ClassStatus): Promise<StudioClass> {
  const { data, error } = await supabase.from("Classes").update({ status }).eq("id", id).select(fields).single();
  if (error) throw new Error(message(error, "Unable to change class status."));
  return { ...(data as Omit<StudioClass, "instructor">), instructor: null };
}

export const classesService = { getAll, getActiveInstructors, create, update, setStatus };
