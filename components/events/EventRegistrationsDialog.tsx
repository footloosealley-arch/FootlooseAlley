"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, IndianRupee, LoaderCircle, MessageCircle, Pencil, Plus, Search, Trash2, UserCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

import SafeDeleteDialog from "@/components/common/SafeDeleteDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_ATTENDANCE_STATUSES,
  EVENT_PAYMENT_STATUSES,
  eventRegistrationsService,
  type EventAttendanceStatus,
  type EventPaymentStatus,
  type EventRegistration,
  type EventRegistrationInput,
} from "@/services/event-registrations.service";
import type { StudioEvent } from "@/services/events.service";

interface Props {
  open: boolean;
  eventItem: StudioEvent | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

const emptyForm: EventRegistrationInput = {
  participant_name: "",
  phone: "",
  payment_status: "Pending",
  amount_paid: 0,
  attendance_status: "Registered",
  notes: "",
};

function toForm(item: EventRegistration): EventRegistrationInput {
  return {
    participant_name: item.participant_name,
    phone: item.phone,
    payment_status: item.payment_status,
    amount_paid: Number(item.amount_paid),
    attendance_status: item.attendance_status,
    notes: item.notes ?? "",
    email: item.email ?? "",
    payment_reference: item.payment_reference ?? "",
  };
}

function whatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export default function EventRegistrationsDialog({ open, eventItem, onOpenChange, onChanged }: Props) {
  const [items, setItems] = useState<EventRegistration[]>([]);
  const [form, setForm] = useState<EventRegistrationInput>({ ...emptyForm });
  const [editing, setEditing] = useState<EventRegistration | null>(null);
  const [deleting, setDeleting] = useState<EventRegistration | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!eventItem) return;
    setLoading(true);
    setError("");
    try {
      setItems(await eventRegistrationsService.getByEvent(eventItem.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load participants.");
    } finally {
      setLoading(false);
    }
  }, [eventItem]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [open, load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => `${item.participant_name} ${item.phone} ${item.payment_status} ${item.attendance_status}`.toLowerCase().includes(query));
  }, [items, search]);

  const active = items.filter((item) => item.attendance_status !== "Cancelled");
  const activePeople = active.reduce((sum, item) => sum + Number(item.group_size ?? 1), 0);
  const collected = items.filter((item) => item.payment_status === "Paid").reduce((sum, item) => sum + Number(item.amount_paid), 0);

  function startAdd() {
    setEditing(null);
    setForm({ ...emptyForm, amount_paid: Number(eventItem?.fee ?? 0) });
    setShowForm(true);
    setError("");
  }

  function startEdit(item: EventRegistration) {
    setEditing(item);
    setForm(toForm(item));
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
    setForm({ ...emptyForm });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!eventItem) return;
    setSaving(true);
    setError("");
    try {
      if (editing) await eventRegistrationsService.update(editing.id, form);
      else await eventRegistrationsService.create(eventItem.id, form);
      toast.success(editing ? "Participant updated." : "Participant registered.");
      closeForm();
      await load();
      onChanged();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save participant.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteParticipant() {
    if (!deleting) return;
    setSaving(true);
    try {
      await eventRegistrationsService.remove(deleting.id);
      toast.success("Participant deleted.");
      setDeleting(null);
      await load();
      onChanged();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete participant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{eventItem?.title ?? "Event"} participants</DialogTitle>
            <DialogDescription>Track registrations, payments and attendance without including this information in public event sharing.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-muted/50 p-3 text-sm"><Users className="mb-1 size-4 text-primary" /><strong className="block text-lg">{activePeople}</strong>Registered</div>
            <div className="rounded-xl bg-muted/50 p-3 text-sm"><UserCheck className="mb-1 size-4 text-primary" /><strong className="block text-lg">{items.filter((item) => item.attendance_status === "Attended").length}</strong>Attended</div>
            <div className="rounded-xl bg-muted/50 p-3 text-sm"><CheckCircle2 className="mb-1 size-4 text-primary" /><strong className="block text-lg">{items.filter((item) => item.payment_status === "Paid").length}</strong>Paid</div>
            <div className="rounded-xl bg-muted/50 p-3 text-sm"><IndianRupee className="mb-1 size-4 text-primary" /><strong className="block text-lg">₹{collected.toLocaleString("en-IN")}</strong>Collected</div>
          </div>

          {showForm ? (
            <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-2">
              <div className="flex items-center justify-between sm:col-span-2"><h3 className="font-semibold">{editing ? "Edit participant" : "Register participant"}</h3><Button type="button" size="icon-sm" variant="ghost" onClick={closeForm}><X /><span className="sr-only">Close form</span></Button></div>
              <div className="space-y-2"><Label htmlFor="event-participant-name">Name</Label><Input id="event-participant-name" required value={form.participant_name} onChange={(event) => setForm({ ...form, participant_name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="event-participant-phone">Phone</Label><Input id="event-participant-phone" inputMode="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="event-participant-email">Email</Label><Input id="event-participant-email" type="email" value={form.email ?? ""} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
              <div className="space-y-2"><Label>Payment status</Label><Select value={form.payment_status} onValueChange={(value) => value && setForm({ ...form, payment_status: value as EventPaymentStatus })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{EVENT_PAYMENT_STATUSES.map((value) => <SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="event-amount-paid">Amount paid (₹)</Label><Input id="event-amount-paid" type="number" min={0} step="0.01" value={form.amount_paid} onChange={(event) => setForm({ ...form, amount_paid: Number(event.target.value) })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="event-payment-reference">UPI transaction reference</Label><Input id="event-payment-reference" value={form.payment_reference ?? ""} onChange={(event) => setForm({ ...form, payment_reference: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Attendance</Label><Select value={form.attendance_status} onValueChange={(value) => value && setForm({ ...form, attendance_status: value as EventAttendanceStatus })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{EVENT_ATTENDANCE_STATUSES.map((value) => <SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="event-participant-notes">Notes</Label><Textarea id="event-participant-notes" value={form.notes ?? ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
              {error && <p className="text-sm text-destructive sm:col-span-2" role="alert">{error}</p>}
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:flex sm:justify-end"><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}{editing ? "Save" : "Register"}</Button></div>
            </form>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-9" placeholder="Search participants" value={search} onChange={(event) => setSearch(event.target.value)} /></label><Button type="button" className="h-11" disabled={activePeople >= Number(eventItem?.max_capacity ?? 0)} onClick={startAdd}><Plus /> Register participant</Button></div>
          )}

          {!showForm && (loading ? <div className="py-10 text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 animate-spin" />Loading participants...</div> : error ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : filtered.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No participants match this search.</p> : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.participant_name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.phone}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{item.attendance_status}</span></div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{item.payment_status}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">₹{Number(item.amount_paid).toLocaleString("en-IN")}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{item.registration_source}</span></div>
                  {item.coupon_code && <p className="mt-2 text-xs font-medium text-emerald-700">Coupon {item.coupon_code}: ₹{Number(item.discount_amount).toLocaleString("en-IN")} off · ₹{Number(item.amount_due).toLocaleString("en-IN")} due</p>}
                  {item.group_size > 1 && <div className="mt-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-900"><p className="font-semibold">Group booking · {item.group_size} participants</p><p className="mt-1">Additional: {item.additional_participant_names.join(", ")}</p></div>}
                  {item.payment_reference && <p className="mt-2 text-xs text-muted-foreground">UPI reference: {item.payment_reference}</p>}
                  {item.notes && <p className="mt-3 text-sm text-muted-foreground">{item.notes}</p>}
                  <div className="mt-4 grid grid-cols-3 gap-2"><Button size="sm" variant="outline" render={<a href={`https://wa.me/${whatsappPhone(item.phone)}`} target="_blank" rel="noreferrer" />}><MessageCircle /> Chat</Button><Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil /> Edit</Button><Button type="button" size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleting(item)}><Trash2 /> Delete</Button></div>
                </article>
              ))}
            </div>
          ))}
        </DialogContent>
      </Dialog>
      <SafeDeleteDialog open={Boolean(deleting)} title={`Delete ${deleting?.participant_name ?? "participant"}?`} description="This permanently removes the event registration, payment and attendance record. Administrator access is required." deleting={saving} onOpenChange={(next) => !next && setDeleting(null)} onConfirm={() => void deleteParticipant()} />
    </>
  );
}
