"use client";

import {
  CalendarDays,
  Loader2,
  Save,
  UserPlus,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ENQUIRY_GENDERS,
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  enquiriesService,
  type CreateEnquiryInput,
  type Enquiry,
  type EnquiryGender,
  type EnquirySource,
  type EnquiryStatus,
} from "@/services/enquiries.service";

interface EnquiryFormDialogProps {
  open: boolean;
  enquiry?: Enquiry | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

interface EnquiryFormState {
  name: string;
  phone: string;
  email: string;
  gender: EnquiryGender | "";
  age: string;
  interested_in: string;
  source: EnquirySource;
  status: EnquiryStatus;
  enquiry_date: string;
  follow_up_date: string;
  trial_date: string;
  assigned_to: string;
  notes: string;
}

const INTEREST_OPTIONS = [
  "Zumba",
  "Dance Fitness",
  "Aerobics",
  "Yoga",
  "Strength Training",
  "Personal Training",
  "Kids Dance",
  "Hip Hop",
  "Bollywood Dance",
  "Contemporary Dance",
  "Classical Dance",
  "Other",
] as const;

function getTodayDate(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyForm(): EnquiryFormState {
  return {
    name: "",
    phone: "",
    email: "",
    gender: "",
    age: "",
    interested_in: "",
    source: "Other",
    status: "New",
    enquiry_date: getTodayDate(),
    follow_up_date: "",
    trial_date: "",
    assigned_to: "",
    notes: "",
  };
}

function createFormFromEnquiry(
  enquiry: Enquiry
): EnquiryFormState {
  return {
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email ?? "",
    gender: enquiry.gender ?? "",
    age:
      enquiry.age !== null
        ? String(enquiry.age)
        : "",
    interested_in: enquiry.interested_in,
    source: enquiry.source,
    status: enquiry.status,
    enquiry_date: enquiry.enquiry_date,
    follow_up_date:
      enquiry.follow_up_date ?? "",
    trial_date: enquiry.trial_date ?? "",
    assigned_to: enquiry.assigned_to ?? "",
    notes: enquiry.notes ?? "",
  };
}

export default function EnquiryFormDialog({
  open,
  enquiry,
  onClose,
  onSaved,
}: EnquiryFormDialogProps) {
  const [form, setForm] =
    useState<EnquiryFormState>(
      createEmptyForm()
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const isEditing = Boolean(enquiry);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (enquiry) {
      setForm(
        createFormFromEnquiry(enquiry)
      );
    } else {
      setForm(createEmptyForm());
    }

    setError(null);
  }, [open, enquiry]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, saving, onClose]);

  function updateField<
    Key extends keyof EnquiryFormState
  >(
    field: Key,
    value: EnquiryFormState[Key]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "Name is required.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    const phoneDigits =
      form.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      return "Enter a valid phone number.";
    }

    if (!form.interested_in.trim()) {
      return "Please select or enter the interested class.";
    }

    if (form.age.trim()) {
      const age = Number(form.age);

      if (
        !Number.isInteger(age) ||
        age < 1 ||
        age > 120
      ) {
        return "Age must be between 1 and 120.";
      }
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Enter a valid email address.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const payload: CreateEnquiryInput = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      gender: form.gender || null,
      age: form.age
        ? Number(form.age)
        : null,
      interested_in:
        form.interested_in,
      source: form.source,
      status: form.status,
      enquiry_date:
        form.enquiry_date,
      follow_up_date:
        form.follow_up_date || null,
      trial_date:
        form.trial_date || null,
      assigned_to:
        form.assigned_to || null,
      notes: form.notes || null,
    };

    try {
      if (enquiry) {
        await enquiriesService.updateEnquiry(
          enquiry.id,
          payload
        );
      } else {
        await enquiriesService.createEnquiry(
          payload
        );
      }

      await onSaved();
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save enquiry."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close enquiry form"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                {isEditing
                  ? "Edit Enquiry"
                  : "Add Enquiry"}
              </h2>

              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Update the enquiry and follow-up details."
                  : "Add a new lead to the studio CRM."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <section className="space-y-4">
              <div>
                <h3 className="font-semibold">
                  Basic Details
                </h3>

                <p className="text-sm text-muted-foreground">
                  Enter the lead&apos;s contact information.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter full name"
                    autoComplete="name"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Phone Number
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter mobile number"
                    autoComplete="tel"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Email
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter email address"
                    autoComplete="email"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Gender
                  </span>

                  <select
                    value={form.gender}
                    onChange={(event) =>
                      updateField(
                        "gender",
                        event.target
                          .value as EnquiryGender | ""
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select gender
                    </option>

                    {ENQUIRY_GENDERS.map(
                      (gender) => (
                        <option
                          key={gender}
                          value={gender}
                        >
                          {gender}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Age
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={(event) =>
                      updateField(
                        "age",
                        event.target.value
                      )
                    }
                    placeholder="Enter age"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <div>
                <h3 className="font-semibold">
                  Enquiry Information
                </h3>

                <p className="text-sm text-muted-foreground">
                  Record what they are interested in and how they found the studio.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Interested In
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </span>

                  <select
                    value={
  form.interested_in === ""
    ? ""
    : INTEREST_OPTIONS.some(
        (interest) =>
          interest === form.interested_in
      )
      ? form.interested_in
      : "Other"
}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      updateField(
                        "interested_in",
                        value === "Other"
                          ? "Other"
                          : value
                      );
                    }}
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select class
                    </option>

                    {INTEREST_OPTIONS.map(
                      (interest) => (
                        <option
                          key={interest}
                          value={interest}
                        >
                          {interest}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Lead Source
                  </span>

                  <select
                    value={form.source}
                    onChange={(event) =>
                      updateField(
                        "source",
                        event.target
                          .value as EnquirySource
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {ENQUIRY_SOURCES.map(
                      (source) => (
                        <option
                          key={source}
                          value={source}
                        >
                          {source}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Status
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target
                          .value as EnquiryStatus
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {ENQUIRY_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Assigned To
                  </span>

                  <input
                    type="text"
                    value={form.assigned_to}
                    onChange={(event) =>
                      updateField(
                        "assigned_to",
                        event.target.value
                      )
                    }
                    placeholder="Staff member name"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    Important Dates
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Schedule follow-ups and trial classes.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Enquiry Date
                  </span>

                  <input
                    type="date"
                    value={form.enquiry_date}
                    onChange={(event) =>
                      updateField(
                        "enquiry_date",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Next Follow-up
                  </span>

                  <input
                    type="date"
                    value={form.follow_up_date}
                    onChange={(event) =>
                      updateField(
                        "follow_up_date",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Trial Date
                  </span>

                  <input
                    type="date"
                    value={form.trial_date}
                    onChange={(event) =>
                      updateField(
                        "trial_date",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <div>
                <h3 className="font-semibold">
                  Notes
                </h3>

                <p className="text-sm text-muted-foreground">
                  Add preferences, conversation details, or follow-up information.
                </p>
              </div>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Enter enquiry notes..."
                rows={5}
                className="w-full resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing
                    ? "Save Changes"
                    : "Add Enquiry"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}