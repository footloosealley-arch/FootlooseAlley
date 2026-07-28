"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { instructorsService, type Instructor } from "@/services/instructors.service";

interface Props { open: boolean; instructor: Instructor | null; onOpenChange: (open: boolean) => void; onSaved: () => void; }

export default function InstructorFormDialog({ open, instructor, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState({ name: instructor?.name ?? "", phone: instructor?.phone ?? "", specialization: instructor?.specialization ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter at least 2 characters.";
    if (!/^\+?[0-9][0-9\s()-]{6,19}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    if (form.specialization.trim().length < 2) next.specialization = "Enter at least 2 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      if (instructor) await instructorsService.update(instructor.id, { ...form, status: instructor.status });
      else await instructorsService.create(form);
      toast.success(instructor ? "Instructor updated." : "Instructor added.");
      onOpenChange(false); onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save instructor."); }
    finally { setSaving(false); }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>{instructor ? "Edit instructor" : "Add instructor"}</DialogTitle><DialogDescription>Enter the instructor&apos;s contact and teaching details.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={submit} noValidate>
      {([ ["name", "Name", "e.g. Ananya Shah"], ["phone", "Phone", "+91 98765 43210"], ["specialization", "Specialization", "e.g. Contemporary"] ] as const).map(([key, label, placeholder]) => <div className="space-y-2" key={key}>
        <Label htmlFor={`instructor-${key}`}>{label}</Label><Input id={`instructor-${key}`} value={form[key]} placeholder={placeholder} aria-invalid={Boolean(errors[key])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
      </div>)}
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}{instructor ? "Save changes" : "Add instructor"}</Button></div>
    </form>
  </DialogContent></Dialog>;
}
