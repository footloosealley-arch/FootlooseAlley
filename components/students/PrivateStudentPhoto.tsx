"use client";

import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/lib/supabase";

const STUDENT_PHOTOS_BUCKET = "student-photos";
const SIGNED_URL_LIFETIME_SECONDS = 300;

export function getStudentPhotoPath(value: string | null | undefined) {
  const candidate = value?.trim();
  if (!candidate) return null;

  if (!candidate.includes("://")) {
    const path = candidate.replace(/^\/+/, "");
    return path && !path.split("/").includes("..") ? path : null;
  }

  try {
    const url = new URL(candidate);
    const marker = `/storage/v1/object/public/${STUDENT_PHOTOS_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const path = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    return path && !path.split("/").includes("..") ? path : null;
  } catch {
    return null;
  }
}

export function usePrivateStudentPhoto(value: string | null | undefined) {
  const path = getStudentPhotoPath(value);
  const [result, setResult] = useState<{
    value: string | null | undefined;
    signedUrl: string | null;
    error: string | null;
  }>({ value: null, signedUrl: null, error: null });

  useEffect(() => {
    let active = true;

    if (!path) {
      return () => { active = false; };
    }

    void supabase.storage
      .from(STUDENT_PHOTOS_BUCKET)
      .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS)
      .then(({ data, error: signingError }) => {
        if (!active) return;
        if (signingError || !data?.signedUrl) {
          setResult({ value, signedUrl: null, error: "Student photo is unavailable." });
        } else {
          setResult({ value, signedUrl: data.signedUrl, error: null });
        }
      });

    return () => { active = false; };
  }, [path, value]);

  if (!path) {
    return { signedUrl: null, loading: false, error: value ? "Invalid student photo path." : null };
  }

  if (result.value !== value) {
    return { signedUrl: null, loading: true, error: null };
  }

  return { signedUrl: result.signedUrl, loading: false, error: result.error };
}

type PrivateStudentPhotoProps = {
  path: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: ReactNode;
};

export default function PrivateStudentPhoto({
  path,
  alt,
  className,
  fallback = null,
}: PrivateStudentPhotoProps) {
  const { signedUrl, loading } = usePrivateStudentPhoto(path);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (loading) {
    return <div aria-label={`Loading ${alt}`} className={`${className ?? ""} animate-pulse bg-muted`} />;
  }

  if (!signedUrl || failedUrl === signedUrl) return <>{fallback}</>;

  return (
    // Signed URLs are ephemeral display credentials and are never persisted.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={signedUrl} alt={alt} className={className} onError={() => setFailedUrl(signedUrl)} />
  );
}
