import { supabase } from "@/lib/supabase";
import type { Schedule } from "@/types/schedule";

export async function getSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("Schedule")
    .select("*")
    .order("day")
    .order("start_time");

  if (error) throw error;

  return (data ?? []) as Schedule[];
}

export async function getScheduleById(
  id: number
): Promise<Schedule | null> {
  const { data, error } = await supabase
    .from("Schedule")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return data as Schedule;
}

export async function addSchedule(
  schedule: Omit<Schedule, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("Schedule")
    .insert([schedule])
    .select()
    .single();

  if (error) throw error;

  return data as Schedule;
}

export async function updateSchedule(
  id: number,
  updates: Partial<Schedule>
) {
  const { data, error } = await supabase
    .from("Schedule")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Schedule;
}

export async function deleteSchedule(id: number) {
  const { error } = await supabase
    .from("Schedule")
    .delete()
    .eq("id", id);

  if (error) throw error;
}