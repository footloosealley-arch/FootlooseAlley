"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/useAsync";
import { supabase } from "@/lib/supabase";
import type { Enquiry } from "@/components/enquiries/EnquiryTable";

type EnquiryEditForm = {
  Name: string;
  Phone: string;
  Email: string;
  Program: string;
  Status: string;
  Follow_up_date: string;
  Notes: string;
  source: string;
  assigned_to: string;
  last_contacted: string;
  trial_date: string;
};

const statusOptions = [
  "New",
  "Contacted",
  "Follow Up",
  "Trial Booked",
  "Joined",
  "Closed",
  "Not Interested",
];

function parseEnquiryId(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function dateValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

function mapForm(enquiry: Enquiry): EnquiryEditForm {
  return {
    Name: enquiry.Name ?? "",
    Phone: enquiry.Phone ?? "",
    Email: enquiry.Email ?? "",
    Program: enquiry.Program ?? "",
    Status: enquiry.Status ?? "New",
    Follow_up_date: dateValue(enquiry.Follow_up_date),
    Notes: enquiry.Notes ?? "",
    source: enquiry.source ?? "",
    assigned_to: enquiry.assigned_to ?? "",
    last_contacted: dateValue(enquiry.last_contacted),
    trial_date: dateValue(enquiry.trial_date),
  };
}

export default function EditEnquiryPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = parseEnquiryId(params?.id as string | string[] | undefined);
  const [form, setForm] = useState<EnquiryEditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const { data: enquiry, loading, error, refresh } = useAsync(
    async () => {
      if (!enquiryId) return null;
      const { data, error: loadError } = await supabase
        .from("Enquiries")
        .select("*")
        .eq("id", enquiryId)
        .maybeSingle();

      if (loadError) throw loadError;
      return data as Enquiry | null;
    },
    enquiryId
  );

  const initialForm = useMemo(
    () => (enquiry ? mapForm(enquiry) : null),
    [enquiry]
  );
  const activeForm = form ?? initialForm;

  function updateField<K extends keyof EnquiryEditForm>(
    field: K,
    value: EnquiryEditForm[K]
  ) {
    setForm((current) => ({
      ...(current ?? initialForm ?? mapForm({ id: enquiryId ?? 0 } as Enquiry)),
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enquiryId || !activeForm || submittingRef.current) return;

    if (!activeForm.Name.trim() || !activeForm.Phone.trim()) {
      setSaveError("Name and phone number are required.");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      const { error: updateError } = await supabase
        .from("Enquiries")
        .update({
          Name: activeForm.Name.trim(),
          Phone: activeForm.Phone.trim(),
          Email: activeForm.Email.trim() || null,
          Program: activeForm.Program.trim() || null,
          Status: activeForm.Status || "New",
          Follow_up_date: activeForm.Follow_up_date || null,
          Notes: activeForm.Notes.trim() || null,
          source: activeForm.source.trim() || null,
          assigned_to: activeForm.assigned_to.trim() || null,
          last_contacted: activeForm.last_contacted || null,
          trial_date: activeForm.trial_date || null,
        })
        .eq("id", enquiryId);

      if (updateError) throw updateError;
      toast.success("Enquiry updated successfully.");
      router.push("/enquiries");
      router.refresh();
    } catch (submitError) {
      setSaveError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update the enquiry."
      );
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  if (!enquiryId) {
    return <ErrorCard title="Invalid enquiry" message="This enquiry link is invalid." />;
  }

  if (loading) return <LoadingCard title="Loading enquiry..." />;

  if (error) {
    return (
      <ErrorCard
        title="Unable to load enquiry"
        message={error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!enquiry || !activeForm) {
    return <ErrorCard title="Enquiry not found" message="This enquiry may have been removed." />;
  }

  const fields: Array<{
    key: keyof EnquiryEditForm;
    label: string;
    type?: string;
    required?: boolean;
  }> = [
    { key: "Name", label: "Name", required: true },
    { key: "Phone", label: "Phone", type: "tel", required: true },
    { key: "Email", label: "Email", type: "email" },
    { key: "Program", label: "Program" },
    { key: "Follow_up_date", label: "Follow-up Date", type: "date" },
    { key: "trial_date", label: "Trial Date", type: "date" },
    { key: "source", label: "Source" },
    { key: "assigned_to", label: "Assigned To" },
    { key: "last_contacted", label: "Last Contacted", type: "date" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Edit Enquiry"
        description={`Update ${enquiry.Name || "this enquiry"} without a mobile popup.`}
      />

      {saveError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`enquiry-${field.key}`}>
                {field.label}{field.required ? " *" : ""}
              </Label>
              <Input
                id={`enquiry-${field.key}`}
                type={field.type ?? "text"}
                value={activeForm[field.key]}
                required={field.required}
                onChange={(event) => updateField(field.key, event.target.value)}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="enquiry-status">Status</Label>
            <select
              id="enquiry-status"
              value={activeForm.Status}
              onChange={(event) => updateField("Status", event.target.value)}
              className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="enquiry-notes">Notes</Label>
            <Textarea
              id="enquiry-notes"
              value={activeForm.Notes}
              onChange={(event) => updateField("Notes", event.target.value)}
              rows={5}
            />
          </div>
        </div>

        <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 flex flex-col-reverse gap-2 border-t bg-background/95 p-4 backdrop-blur sm:static sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/enquiries")}
            disabled={saving}
            className="min-h-11"
          >
            <ArrowLeft />
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={saving} className="min-h-11">
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
