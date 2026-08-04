"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, IndianRupee, Loader2, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";

import BrandLogo from "@/components/branding/BrandLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicEvent = {
  id: number;
  title: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  spotsLeft: number;
  fee: number;
  description: string | null;
  imageUrl: string | null;
  contactPhone: string | null;
};

type RegistrationResult = {
  ok?: boolean;
  error?: string;
  event?: PublicEvent;
  registrationId?: number;
  phone?: string;
  paymentUrl?: string | null;
  amount?: number;
};

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100";
const labelClass = "block text-sm font-semibold text-slate-800";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const friendlyDate = (date: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`));
const friendlyTime = (time: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(`2000-01-01T${time}:00`));

async function callRegistration(body: Record<string, unknown>): Promise<RegistrationResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("The registration service is not configured.");
  const response = await fetch(`${supabaseUrl}/functions/v1/public-event-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null) as RegistrationResult | null;
  if (!response.ok || !result?.ok) throw new Error(result?.error || "Unable to process your registration. Please try again.");
  return result;
}

export default function PublicEventRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<number | null>(null);
  const [eventItem, setEventItem] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<{ id: number; phone: string; paymentUrl: string | null; amount: number } | null>(null);
  const [reference, setReference] = useState("");
  const [referenceSaved, setReferenceSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void params.then(async ({ id }) => {
      const parsedId = Number(id);
      if (!Number.isInteger(parsedId) || parsedId < 1) {
        if (active) { setError("This event link is invalid."); setLoading(false); }
        return;
      }
      setEventId(parsedId);
      try {
        const result = await callRegistration({ action: "event", eventId: parsedId });
        if (active) setEventItem(result.event ?? null);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load this event.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [params]);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventId) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await callRegistration({
        action: "register",
        eventId,
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (!result.registrationId || !result.phone) throw new Error("Registration was received, but the confirmation could not be displayed.");
      setRegistration({ id: result.registrationId, phone: result.phone, paymentUrl: result.paymentUrl ?? null, amount: result.amount ?? 0 });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventId || !registration) return;
    setSubmitting(true);
    setError("");
    try {
      await callRegistration({ action: "reference", eventId, registrationId: registration.id, phone: registration.phone, paymentReference: reference });
      setReferenceSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the transaction reference.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-rose-50 via-white to-orange-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-100/50">
        <header className="flex items-center justify-between gap-4 border-b border-rose-100 px-5 py-4 sm:px-8">
          <BrandLogo width={150} height={64} />
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">Event registration</span>
        </header>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center gap-2 p-8 text-slate-600"><Loader2 className="size-5 animate-spin" /> Loading event…</div>
        ) : !eventItem ? (
          <div className="p-8 text-center sm:p-12"><Ticket className="mx-auto size-12 text-rose-500" /><h1 className="mt-4 text-2xl font-black text-slate-950">Registration unavailable</h1><p className="mt-2 text-slate-600">{error || "This event is not accepting public registrations."}</p></div>
        ) : registration ? (
          <section className="p-5 sm:p-8">
            <div className="text-center"><CheckCircle2 className="mx-auto size-16 text-emerald-600" /><h1 className="mt-4 text-3xl font-black text-slate-950">You’re registered!</h1><p className="mt-2 text-slate-600">Your place for <strong>{eventItem.title}</strong> has been reserved.</p></div>
            {registration.amount > 0 ? (
              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-lg font-bold text-slate-950">Pay {money.format(registration.amount)} by UPI</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Open any installed UPI app, complete payment, then enter the transaction reference below. Your payment remains pending until Footloose Alley verifies it.</p>
                {registration.paymentUrl ? <a href={registration.paymentUrl} className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full rounded-xl")}><IndianRupee className="size-4" /> Pay with any UPI app</a> : <p className="mt-4 text-sm font-medium text-red-700">Online payment is temporarily unavailable. Please contact the studio.</p>}
                {!referenceSaved ? <form className="mt-5" onSubmit={saveReference}><label className={labelClass}>UPI transaction reference<input className={inputClass} value={reference} onChange={(event) => setReference(event.target.value)} required minLength={4} maxLength={100} placeholder="Enter reference after payment" /></label><Button type="submit" variant="outline" className="mt-3 w-full rounded-xl" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />} Submit payment reference</Button></form> : <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="size-5" /> Reference submitted for verification.</p>}
                <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Footloose Alley will never ask for your UPI PIN. Enter it only inside your trusted UPI app.</p>
              </div>
            ) : <p className="mt-7 rounded-2xl bg-emerald-50 p-4 text-center font-semibold text-emerald-800">This is a free event—no payment is required.</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </section>
        ) : (
          <>
            {eventItem.imageUrl && <div className="relative aspect-[16/8] bg-slate-100"><Image src={eventItem.imageUrl} alt={eventItem.title} fill className="object-cover" sizes="(min-width: 768px) 768px, 100vw" priority /></div>}
            <section className="p-5 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-700">{eventItem.eventType}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{eventItem.title}</h1>
              {eventItem.description && <p className="mt-3 leading-7 text-slate-600">{eventItem.description}</p>}
              <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><CalendarDays className="size-5 text-rose-600" />{friendlyDate(eventItem.eventDate)}</p>
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><Clock3 className="size-5 text-rose-600" />{friendlyTime(eventItem.startTime)}–{friendlyTime(eventItem.endTime)}</p>
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><MapPin className="size-5 text-rose-600" />{eventItem.location}</p>
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><Users className="size-5 text-rose-600" />{eventItem.spotsLeft} places left</p>
              </div>
              <p className="mt-5 text-xl font-black text-slate-950">{eventItem.fee === 0 ? "Free entry" : money.format(eventItem.fee)}</p>
              {eventItem.spotsLeft === 0 ? <p className="mt-6 rounded-xl bg-amber-50 p-4 font-semibold text-amber-900">This event is fully booked.</p> : (
                <form className="mt-7 space-y-5 border-t border-rose-100 pt-7" onSubmit={register}>
                  <h2 className="text-xl font-bold text-slate-950">Reserve your place</h2>
                  <div className="grid gap-5 sm:grid-cols-2"><label className={labelClass}>Full name <span className="text-rose-600">*</span><input className={inputClass} name="name" autoComplete="name" required minLength={2} maxLength={120} /></label><label className={labelClass}>Mobile number <span className="text-rose-600">*</span><input className={inputClass} name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={7} maxLength={20} /></label></div>
                  <label className={labelClass}>Email (optional)<input className={inputClass} name="email" type="email" autoComplete="email" maxLength={200} /></label>
                  <label className="absolute -left-[10000px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                  {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                  <Button type="submit" size="lg" className="w-full rounded-xl" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : <Ticket />} Register{eventItem.fee > 0 ? " and continue to payment" : ""}</Button>
                  <p className="text-center text-xs leading-5 text-slate-500">Your details are used only to manage this event registration.</p>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
