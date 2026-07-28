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
  const { data, error } = await supabase.from("Instructors").select("id,created_at,name,phone,specialization,status").order("name");
  if (error) throw error;
  return (data ?? []) as Instructor[];
}

async function create(input: InstructorInput): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").insert(normalize(input)).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return data as Instructor;
}

async function update(id: number, input: InstructorInput): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").update(normalize(input)).eq("id", id).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return data as Instructor;
}

async function setStatus(id: number, status: InstructorStatus): Promise<Instructor> {
  const { data, error } = await supabase.from("Instructors").update({ status }).eq("id", id).select("id,created_at,name,phone,specialization,status").single();
  if (error) throw error;
  return data as Instructor;
}

export const instructorsService = { getAll, create, update, setStatus };
