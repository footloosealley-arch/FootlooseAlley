"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateStudent } from "@/lib/students";

type Props = {
  studentId: number;
  photoUrl?: string;
};

export default function PhotoUploader({
  studentId,
  photoUrl,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(photoUrl || "");
  const [uploading, setUploading] = useState(false);

  async function uploadPhoto(file: File) {
    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();

      const fileName = `${studentId}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("student-photos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("student-photos")
        .getPublicUrl(fileName);

      await updateStudent(studentId, {
        photo_url: data.publicUrl,
      });

      setImage(data.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Unable to upload photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-40 w-40 cursor-pointer overflow-hidden rounded-full border-4 border-indigo-100"
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <Image
            src={image}
            alt="Student"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <Camera className="h-10 w-10 text-slate-400" />
          </div>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </span>
        ) : (
          "Change Photo"
        )}
      </button>

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadPhoto(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}