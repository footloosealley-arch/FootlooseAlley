"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Send,
  ShieldCheck,
} from "lucide-react";

import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";

const programs = [
  "Zumba",
  "Dance Fitness",
  "Hip Hop",
  "Bollywood",
  "Yoga",
  "Kids Dance",
  "Personal Training",
];

const genders = [
  "Female",
  "Male",
  "Other",
  "Prefer not to say",
];

const maximumPhotoBytes = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100";
const labelClass = "block text-sm font-semibold text-slate-800";

type IntakeKind = "enquiry" | "student";

type IntakeResponse = {
  ok?: boolean;
  duplicate?: boolean;
  message?: string;
  error?: string;
};

function RequiredMark() {
  return <span className="text-rose-600"> *</span>;
}

export default function PublicIntakeForm({ kind }: { kind: IntakeKind }) {
  const isStudent = kind === "student";
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photoName, setPhotoName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        fields[key] = value.trim();
      }
    });

    if (isStudent && !fields["WhatsApp Consent"]) {
      fields["WhatsApp Consent"] = "No";
    }

    const photo = formData.get("Student Photo");

    if (isStudent) {
      if (!(photo instanceof File) || photo.size === 0) {
        setErrorMessage("Please upload a clear student photo.");
        return;
      }

      if (!allowedPhotoTypes.includes(photo.type)) {
        setErrorMessage("Student photo must be JPG, PNG, or WebP.");
        return;
      }

      if (photo.size > maximumPhotoBytes) {
        setErrorMessage("Student photo must be 5 MB or smaller.");
        return;
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setErrorMessage("The registration service is not configured.");
      return;
    }

    const metadata = {
      kind,
      responseId: `app-${crypto.randomUUID()}`,
      submittedAt: new Date().toISOString(),
      fields,
    };

    setSubmitting(true);

    try {
      let requestBody: BodyInit;
      const headers: HeadersInit = {};

      if (isStudent && photo instanceof File) {
        const multipartBody = new FormData();
        multipartBody.set("metadata", JSON.stringify(metadata));
        multipartBody.set("photo", photo);
        requestBody = multipartBody;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(metadata);
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/public-intake-webhook`,
        {
          method: "POST",
          headers,
          body: requestBody,
        },
      );

      const result = (await response.json().catch(() => null)) as
        | IntakeResponse
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "We could not submit the form. Please try again.",
        );
      }

      setSuccessMessage(
        result.message ||
          (isStudent
            ? "Registration received! Our team will review it and contact you shortly."
            : "Thank you! Your enquiry has been received and our team will contact you shortly."),
      );
      form.reset();
      setPhotoName("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not submit the form. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <PublicFormFrame>
        <div className="mx-auto max-w-xl py-10 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            Successfully submitted
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {successMessage}
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-7 min-h-11 rounded-xl px-6"
            onClick={() => setSuccessMessage("")}
          >
            Submit another response
          </Button>
        </div>
      </PublicFormFrame>
    );
  }

  return (
    <PublicFormFrame>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-700">
          {isStudent ? "New student onboarding" : "Find your perfect class"}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {isStudent ? "Student Registration Form" : "Enquiry Form"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {isStudent
            ? "Complete your details and upload a clear photo. Your registration will be reviewed by the Footloose Alley team before activation."
            : "Tell us what you are interested in and the Footloose Alley team will contact you with class details."}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Full Name<RequiredMark />
            <input
              className={inputClass}
              name="Full Name"
              autoComplete="name"
              required
              maxLength={120}
              placeholder="Enter full name"
            />
          </label>

          <label className={labelClass}>
            Phone Number<RequiredMark />
            <input
              className={inputClass}
              name="Phone Number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              minLength={10}
              maxLength={16}
              pattern="[0-9+ ()-]{10,16}"
              placeholder="10-digit mobile number"
            />
          </label>

          <label className={labelClass}>
            Email
            <input
              className={inputClass}
              name="Email"
              type="email"
              autoComplete="email"
              maxLength={160}
              placeholder="name@example.com"
            />
          </label>

          <label className={labelClass}>
            Gender{isStudent && <RequiredMark />}
            <select
              className={inputClass}
              name="Gender"
              defaultValue=""
              required={isStudent}
            >
              <option value="">Select gender</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>

          {!isStudent && (
            <label className={labelClass}>
              Age
              <input
                className={inputClass}
                name="Age"
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                placeholder="Age"
              />
            </label>
          )}

          {isStudent && (
            <label className={labelClass}>
              Date of Birth<RequiredMark />
              <input
                className={inputClass}
                name="Date of Birth"
                type="date"
                required
              />
            </label>
          )}

          <label className={labelClass}>
            Program Interested In<RequiredMark />
            <select
              className={inputClass}
              name="Program Interested In"
              defaultValue=""
              required
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </label>

          {isStudent && (
            <label className={labelClass}>
              Emergency Contact<RequiredMark />
              <input
                className={inputClass}
                name="Emergency Contact"
                type="tel"
                inputMode="numeric"
                required
                minLength={10}
                maxLength={16}
                pattern="[0-9+ ()-]{10,16}"
                placeholder="Emergency mobile number"
              />
            </label>
          )}

          {isStudent && (
            <label className={labelClass}>
              Preferred Batch
              <input
                className={inputClass}
                name="Preferred Batch"
                maxLength={100}
                placeholder="Morning, evening, or preferred time"
              />
            </label>
          )}
        </div>

        {isStudent && (
          <label className={labelClass}>
            Address<RequiredMark />
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              name="Address"
              autoComplete="street-address"
              required
              maxLength={500}
              placeholder="Enter complete address"
            />
          </label>
        )}

        {isStudent && (
          <label className={labelClass}>
            Medical Notes
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              name="Medical Notes"
              maxLength={500}
              placeholder="Allergies, injuries, medical conditions, or medications"
            />
          </label>
        )}

        <label className={labelClass}>
          {isStudent ? "Additional Notes" : "Message or Questions"}
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            name={isStudent ? "Additional Notes" : "Message"}
            maxLength={500}
            placeholder={
              isStudent
                ? "Anything else the studio should know"
                : "Tell us about your class preference or questions"
            }
          />
        </label>

        {isStudent && (
          <div>
            <label className={labelClass} htmlFor="student-photo">
              Student Photo<RequiredMark />
            </label>
            <label
              htmlFor="student-photo"
              className="mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-5 transition hover:border-rose-500 hover:bg-rose-50"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm">
                <Camera className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {photoName || "Choose a clear photo"}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  JPG, PNG, or WebP · maximum 5 MB
                </span>
              </span>
            </label>
            <input
              id="student-photo"
              className="sr-only"
              name="Student Photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) =>
                setPhotoName(event.target.files?.[0]?.name || "")
              }
            />
          </div>
        )}

        {isStudent && (
          <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-slate-700">
            <input
              className="mt-0.5 size-4 accent-rose-700"
              type="checkbox"
              name="WhatsApp Consent"
              value="Yes"
              defaultChecked
            />
            I agree to receive class and membership updates from Footloose Alley on WhatsApp.
          </label>
        )}

        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input name="Website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="min-h-12 w-full rounded-xl bg-gradient-to-r from-rose-700 via-red-600 to-orange-500 text-base font-bold shadow-lg shadow-rose-200 hover:opacity-90 sm:w-auto sm:min-w-56"
        >
          <Send className="size-4" />
          {submitting ? "Submitting…" : "Submit Form"}
        </Button>
      </form>
    </PublicFormFrame>
  );
}

function PublicFormFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_35%),linear-gradient(to_bottom_right,#fff1f2,#ffffff,#fffbeb)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-rose-700"
          >
            <ArrowLeft className="size-4" />
            Footloose Alley
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <ShieldCheck className="size-4" />
            Secure form
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-rose-200/80 bg-white/95 shadow-2xl shadow-rose-200/50 backdrop-blur">
          <header className="flex flex-col items-center gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-6 py-5 text-center sm:flex-row sm:text-left">
            <BrandLogo width={112} height={72} />
            <div>
              <p className="text-xl font-black tracking-tight text-slate-950">
                Footloose Alley
              </p>
              <p className="text-sm font-semibold text-rose-700">
                Dance and Fitness Studio
              </p>
            </div>
          </header>

          <div className="p-6 sm:p-9">{children}</div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Your information is used only by Footloose Alley for studio registration and communication.
        </p>
      </div>
    </main>
  );
}
