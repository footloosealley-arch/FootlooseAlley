import { supabase } from "./supabase";

export async function uploadStudentPhoto(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("student-photos")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("student-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}