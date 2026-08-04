"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASS_DAYS, classesService, type ActiveInstructor, type ClassInput, type StudioClass } from "@/services/classes.service";

interface Props { open: boolean; classItem: StudioClass | null; instructors: ActiveInstructor[]; onOpenChange: (open: boolean) => void; onSaved: () => void }
const empty: ClassInput = { class_name: "", program: "Fitness", day: "Monday", start_time: "06:00", end_time: "07:00", instructor_id: null, max_capacity: 20, public_booking_enabled: false };

function initialForm(classItem: StudioClass | null): ClassInput {
  return classItem ? {
    class_name: classItem.class_name,
    program: classItem.program,
    day: classItem.day,
    start_time: classItem.start_time,
    end_time: classItem.end_time,
    instructor_id: classItem.instructor ? classItem.instructor_id : null,
    max_capacity: classItem.max_capacity,
    status: classItem.status,
    public_booking_enabled: classItem.public_booking_enabled,
  } : { ...empty };
}

export default function ClassFormDialog({ open, classItem, instructors, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<ClassInput>(() => initialForm(classItem)), [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    // Every open starts from persisted data (edit) or clean defaults (add).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialForm(classItem));
    setError("");
  }, [open, classItem]);
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError("");
      setForm(initialForm(classItem));
    }
    onOpenChange(nextOpen);
  }
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { if (classItem) await classesService.update(classItem.id, form); else await classesService.create(form); toast.success(classItem ? "Class updated." : "Class added."); handleOpenChange(false); onSaved(); } catch (caught) { const text = caught instanceof Error ? caught.message : "Unable to save class."; setError(text); toast.error(text); } finally { setSaving(false); } }
  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{classItem ? "Edit class" : "Add class"}</DialogTitle><DialogDescription>Set the schedule, capacity, and optional active instructor.</DialogDescription></DialogHeader>
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="class-name">Class name</Label><Input id="class-name" required value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="class-program">Program</Label><Input id="class-program" required value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
      <div className="space-y-2"><Label>Day</Label><Select value={form.day} onValueChange={value => value && setForm({ ...form, day: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CLASS_DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="class-start">Start time</Label><Input id="class-start" type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="class-end">End time</Label><Input id="class-end" type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></div>
      <div className="space-y-2"><Label>Instructor</Label><Select value={form.instructor_id?.toString() ?? "unassigned"} onValueChange={value => setForm({ ...form, instructor_id: value === "unassigned" || !value ? null : Number(value) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{classItem?.instructor && classItem.instructor_id !== null && !instructors.some(i => i.id === classItem.instructor_id) && <SelectItem value={String(classItem.instructor_id)} disabled>{classItem.instructor.name} (Inactive)</SelectItem>}{instructors.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="class-capacity">Capacity</Label><Input id="class-capacity" type="number" min={1} max={1000} required value={form.max_capacity} onChange={e => setForm({ ...form, max_capacity: Number(e.target.value) })} /></div>
      <label className="flex items-start gap-3 rounded-xl border p-3 sm:col-span-2"><input type="checkbox" className="mt-1" checked={form.public_booking_enabled ?? false} onChange={e => setForm({ ...form, public_booking_enabled: e.target.checked })}/><span className="text-sm"><strong className="block">Offer this as a trial class</strong><span className="text-muted-foreground">This class appears in the public enquiry form when someone selects “Book a trial class”. Full sessions automatically use a waitlist.</span></span></label>
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}{classItem ? "Save changes" : "Add class"}</Button></div>
    </form></DialogContent></Dialog>;
}
