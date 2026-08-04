"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventRegistrationsService, type EventRegistration } from "@/services/event-registrations.service";

export default function EventRefundDialog({ registration, open, onOpenChange, onCompleted }: { registration: EventRegistration | null; open: boolean; onOpenChange: (open: boolean) => void; onCompleted: () => void }) {
  const [amount, setAmount] = useState(0); const [reason, setReason] = useState(""); const [reference, setReference] = useState(""); const [cancelBooking, setCancelBooking] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const refundable = Math.max(0, Number(registration?.amount_paid ?? 0) - Number(registration?.refunded_amount ?? 0));
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(refundable);
    setReason(""); setReference(""); setCancelBooking(true); setError("");
  }, [open, refundable]);
  async function submit(event: FormEvent) { event.preventDefault(); if (!registration) return; setSaving(true); setError(""); try { await eventRegistrationsService.refund(registration.id, amount, reason, reference, cancelBooking); onOpenChange(false); onCompleted(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to record refund."); } finally { setSaving(false); } }
  return <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Refund {registration?.participant_name ?? "registration"}</DialogTitle><DialogDescription>Record a full or partial event refund. The original payment receipt remains unchanged.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="rounded-xl bg-muted/50 p-3 text-sm">Remaining refundable amount: <strong>₹{refundable.toLocaleString("en-IN")}</strong></div><div className="space-y-2"><Label htmlFor="event-refund-amount">Refund amount (₹)</Label><Input id="event-refund-amount" type="number" min={0.01} max={refundable} step="0.01" required value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></div><div className="space-y-2"><Label htmlFor="event-refund-reason">Reason</Label><Textarea id="event-refund-reason" required minLength={3} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="event-refund-reference">Refund reference (optional)</Label><Input id="event-refund-reference" maxLength={100} value={reference} onChange={(event) => setReference(event.target.value)} /></div><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={cancelBooking} onChange={(event) => setCancelBooking(event.target.checked)} /><span><strong className="block">Cancel registration and release capacity</strong>Leave off only when giving a partial goodwill refund while the participant will still attend.</span></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button type="submit" disabled={saving || refundable <= 0}>{saving ? <LoaderCircle className="animate-spin" /> : <RotateCcw />} Record refund</Button></DialogFooter></form></DialogContent></Dialog>;
}
