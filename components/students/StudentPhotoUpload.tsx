"use client";

import {
  ChangeEvent,
  DragEvent,
  useId,
  useRef,
  useState,
} from "react";

import {
  Camera,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StudentPhotoUploadProps = {
  value: string | null;
  onChange: (photoUrl: string | null) => void;
  disabled?: boolean;
  studentId?: number | string | null;
};

const STORAGE_BUCKET = "student-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function createSafeFileName(file: File) {
  const extension =
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg";

  const uniqueName =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  return `${uniqueName}.${extension}`;
}

function getStoragePathFromPublicUrl(
  photoUrl: string
) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

  const markerIndex =
    photoUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    photoUrl.slice(
      markerIndex + marker.length
    )
  );
}

export default function StudentPhotoUpload({
  value,
  onChange,
  disabled = false,
  studentId,
}: StudentPhotoUploadProps) {
  const inputId = useId();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function validateFile(file: File) {
    if (
      !ALLOWED_FILE_TYPES.includes(file.type)
    ) {
      return "Please select a JPG, PNG, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "The photo must be smaller than 5 MB.";
    }

    return null;
  }

  async function uploadPhoto(file: File) {
    if (disabled || uploading) return;

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const folderName = studentId
        ? `students/${studentId}`
        : "temporary";

      const fileName =
        createSafeFileName(file);

      const filePath =
        `${folderName}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error(
          "The photo was uploaded, but its public URL could not be created."
        );
      }

      const previousPhotoUrl = value;

      onChange(data.publicUrl);

      if (
        previousPhotoUrl &&
        previousPhotoUrl !== data.publicUrl
      ) {
        const previousPath =
          getStoragePathFromPublicUrl(
            previousPhotoUrl
          );

        if (previousPath) {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([previousPath]);
        }
      }
    } catch (uploadError) {
      console.error(
        "Student photo upload failed:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload the photo. Please try again."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function removePhoto() {
    if (
      disabled ||
      uploading ||
      !value
    ) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storagePath =
        getStoragePathFromPublicUrl(value);

      if (storagePath) {
        const { error: removeError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([storagePath]);

        if (removeError) {
          throw removeError;
        }
      }

      onChange(null);
    } catch (removeError) {
      console.error(
        "Student photo removal failed:",
        removeError
      );

      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove the photo. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      void uploadPhoto(file);
    }
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    if (!disabled && !uploading) {
      setDragging(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    if (disabled || uploading) return;

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      void uploadPhoto(file);
    }
  }

  function openFilePicker() {
    if (disabled || uploading) return;

    fileInputRef.current?.click();
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Camera className="h-5 w-5 text-primary" />

        <div>
          <h2 className="text-lg font-semibold">
            Student Photo
          </h2>

          <p className="text-sm text-muted-foreground">
            Upload a clear profile photo.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border bg-muted">
          {value ? (
            <img
              src={value}
              alt="Student profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="h-10 w-10" />

              <span className="text-xs">
                No photo
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={
              disabled || uploading
                ? -1
                : 0
            }
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40",
              disabled || uploading
                ? "cursor-not-allowed opacity-60"
                : "",
            ].join(" ")}
          >
            {uploading ? (
              <>
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />

                <p className="font-medium">
                  Uploading photo...
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-3 h-8 w-8 text-primary" />

                <p className="font-medium">
                  Drag and drop a photo here
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse your
                  computer
                </p>
              </>
            )}
          </div>

          <Input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || uploading}
            onChange={handleFileChange}
            className="hidden"
          />

          <Label
            htmlFor={inputId}
            className="sr-only"
          >
            Upload student photo
          </Label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={openFilePicker}
              disabled={disabled || uploading}
            >
              <Upload className="mr-2 h-4 w-4" />

              {value
                ? "Change Photo"
                : "Choose Photo"}
            </Button>

            {value && (
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  void removePhoto()
                }
                disabled={
                  disabled || uploading
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />

                Remove Photo
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Maximum file
            size: 5 MB.
          </p>

          {error && (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}