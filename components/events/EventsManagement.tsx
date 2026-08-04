"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Copy, IndianRupee, Link2, MapPin, MessageCircle, Pencil, Plus, RefreshCw, Search, Tag, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import BrandLogo from "@/components/branding/BrandLogo";
import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import SafeDeleteDialog from "@/components/common/SafeDeleteDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/ui-foundation/StatCard";
import { eventRegistrationsService, type EventRegistrationSummary } from "@/services/event-registrations.service";
import { EVENT_STATUSES, EVENT_TYPES, eventsService, type EventStatus, type StudioEvent } from "@/services/events.service";
import EventFormDialog from "./EventFormDialog";
import EventCouponsDialog from "./EventCouponsDialog";
import EventCheckInDialog from "./EventCheckInDialog";
import EventRegistrationsDialog from "./EventRegistrationsDialog";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const friendlyDate = (date: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`));
const friendlyTime = (time: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(`2000-01-01T${time}:00`));

function localCalendarDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusTone(status: EventStatus): string {
  if (status === "Upcoming") return "bg-emerald-100 text-emerald-700";
  if (status === "Completed") return "bg-blue-100 text-blue-700";
  if (status === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function EventsManagement() {
  const [items, setItems] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [scope, setScope] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudioEvent | null>(null);
  const [deleting, setDeleting] = useState<StudioEvent | null>(null);
  const [registrationsEvent, setRegistrationsEvent] = useState<StudioEvent | null>(null);
  const [couponsEvent, setCouponsEvent] = useState<StudioEvent | null>(null);
  const [checkInEvent, setCheckInEvent] = useState<StudioEvent | null>(null);
  const [summaries, setSummaries] = useState<EventRegistrationSummary[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [events, registrationSummaries] = await Promise.all([
        eventsService.getAll(),
        eventRegistrationsService.getSummaries(),
      ]);
      setItems(events);
      setSummaries(registrationSummaries);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const today = localCalendarDate();
  const month = today.slice(0, 7);
  const filtered = (() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (!query || `${item.title} ${item.event_type} ${item.location} ${item.description ?? ""}`.toLowerCase().includes(query)) &&
      (status === "All" || item.status === status) &&
      (type === "All" || item.event_type === type) &&
      (scope === "All" || (scope === "Upcoming" ? item.event_date >= today : item.event_date < today))
    );
  })();

  async function changeStatus(item: StudioEvent, next: EventStatus) {
    setSavingId(item.id);
    try {
      await eventsService.setStatus(item.id, next);
      toast.success(`Event marked ${next.toLowerCase()}.`);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to change event status.");
    } finally {
      setSavingId(null);
    }
  }

  async function duplicateEvent(item: StudioEvent) {
    setSavingId(item.id);
    try {
      await eventsService.duplicate(item);
      toast.success("Draft event copy created.");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to duplicate event.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteEvent() {
    if (!deleting) return;
    setSavingId(deleting.id);
    try {
      await eventsService.remove(deleting);
      toast.success("Event permanently deleted.");
      setDeleting(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete event.");
    } finally {
      setSavingId(null);
    }
  }

  function share(item: StudioEvent) {
    const fee = Number(item.fee) === 0 ? "Free" : money.format(Number(item.fee));
    const contact = item.contact_phone || "8884978589";
    const studioContact = contact !== "8884978589" ? "\nFootloose Alley: 8884978589" : "";
    const photo = item.image_url ? `\nEvent photo: ${item.image_url}` : "";
    const description = item.description ? `\n${item.description}` : "";
    const registrationLink = item.public_registration_enabled ? `\nRegister and pay: ${window.location.origin}/forms/events/${item.id}` : "";
    const text = `${item.title}\nDate: ${friendlyDate(item.event_date)}\nTime: ${friendlyTime(item.start_time)} – ${friendlyTime(item.end_time)}\nLocation: ${item.location}\nFee: ${fee}\nContact: ${contact}${description}${studioContact}${photo}${registrationLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function copyRegistrationLink(item: StudioEvent) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/forms/events/${item.id}`);
      toast.success("Registration and payment link copied.");
    } catch {
      toast.error("Unable to copy the registration link.");
    }
  }

  const summaryByEvent = new Map(summaries.map((summary) => [summary.event_id, summary]));
  const totalCollected = summaries.reduce((sum, summary) => sum + summary.collected, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="Events Management" description="Plan, publish and manage every Footloose Alley event." action={<Button type="button" className="w-full sm:w-auto" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Add event</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Upcoming" value={items.filter((item) => item.status === "Upcoming" && item.event_date >= today).length} icon={CalendarDays} />
        <StatCard label="This month" value={items.filter((item) => item.event_date.startsWith(month)).length} icon={Clock3} />
        <StatCard label="Completed" value={items.filter((item) => item.status === "Completed").length} icon={CheckCircle2} />
        <StatCard label="Collected" value={money.format(totalCollected)} icon={IndianRupee} />
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-3 border-b p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(3,12rem)]">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-9" aria-label="Search events" placeholder="Search title, location or description" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <Select value={status} onValueChange={(value) => setStatus(value ?? "All")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem>{EVENT_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
          <Select value={type} onValueChange={(value) => setType(value ?? "All")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All types</SelectItem>{EVENT_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
          <Select value={scope} onValueChange={(value) => setScope(value ?? "All")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All dates</SelectItem><SelectItem value="Upcoming">Upcoming dates</SelectItem><SelectItem value="Past">Past dates</SelectItem></SelectContent></Select>
        </div>
        <div className="flex items-center justify-between border-b px-4 py-2"><span className="text-xs text-muted-foreground">Showing {filtered.length} of {items.length}</span><Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button></div>
      </section>

      {loading ? <LoadingCard /> : error ? <ErrorCard message={error} onRetry={() => void load()} /> : filtered.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No events match these filters.</CardContent></Card> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => {
            const registration = summaryByEvent.get(item.id);
            const registrationCount = registration?.registrations ?? 0;
            const spotsLeft = Math.max(0, item.max_capacity - registrationCount);
            return (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/8] bg-muted">{item.image_url ? <Image src={item.image_url} alt={`${item.title} event`} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 to-orange-50 p-8"><BrandLogo width={240} height={120} className="max-h-full object-contain opacity-80" /></div>}</div>
              <CardContent className="flex h-full flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-lg font-semibold leading-tight">{item.title}</h2><p className="mt-1 text-sm font-medium text-primary">{item.event_type}</p></div><Badge className={statusTone(item.status)}>{item.status}</Badge></div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><CalendarDays className="size-4 text-primary" />{friendlyDate(item.event_date)}</p>
                  <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><Clock3 className="size-4 text-primary" />{friendlyTime(item.start_time)}–{friendlyTime(item.end_time)}</p>
                  <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><MapPin className="size-4 text-primary" />{item.location}</p>
                  <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><Users className="size-4 text-primary" />{registrationCount}/{item.max_capacity} registered · {spotsLeft} left</p>
                </div>
                {item.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>}
                <p className="mt-3 text-sm font-semibold">{Number(item.fee) === 0 ? "Free entry" : money.format(Number(item.fee))}</p>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:flex sm:flex-wrap">
                  <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(item); setOpen(true); }}><Pencil /> Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => share(item)}><MessageCircle /> WhatsApp</Button>
                  {item.public_registration_enabled && <Button type="button" size="sm" variant="outline" onClick={() => void copyRegistrationLink(item)}><Link2 /> Copy link</Button>}
                  {item.public_registration_enabled && Number(item.fee) > 0 && <Button type="button" size="sm" variant="outline" onClick={() => setCouponsEvent(item)}><Tag /> Coupons</Button>}
                  <Button type="button" size="sm" variant="outline" onClick={() => setRegistrationsEvent(item)}><Users /> Participants</Button>
                  {item.status !== "Draft" && <Button type="button" size="sm" variant="outline" onClick={() => setCheckInEvent(item)}><ClipboardCheck /> Check-in</Button>}
                  <Button type="button" size="sm" variant="outline" disabled={savingId === item.id} onClick={() => void duplicateEvent(item)}><Copy /> Duplicate</Button>
                  {item.status === "Draft" && <Button type="button" size="sm" disabled={savingId === item.id} onClick={() => void changeStatus(item, "Upcoming")}>Publish</Button>}
                  {item.status === "Upcoming" && <><Button type="button" size="sm" disabled={savingId === item.id} onClick={() => void changeStatus(item, "Completed")}>Complete</Button><Button type="button" size="sm" variant="destructive" disabled={savingId === item.id} onClick={() => void changeStatus(item, "Cancelled")}>Cancel</Button></>}
                  {(item.status === "Completed" || item.status === "Cancelled") && <Button type="button" size="sm" disabled={savingId === item.id} onClick={() => void changeStatus(item, "Upcoming")}>Reopen</Button>}
                  {(item.status === "Draft" || item.status === "Cancelled") && <Button type="button" size="sm" variant="outline" className="text-destructive hover:text-destructive sm:ml-auto" disabled={savingId === item.id} onClick={() => setDeleting(item)}><Trash2 /> Delete</Button>}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <EventFormDialog open={open} eventItem={editing} onOpenChange={(next) => { setOpen(next); if (!next) setEditing(null); }} onSaved={() => void load()} />
      <EventCouponsDialog open={Boolean(couponsEvent)} eventItem={couponsEvent} onOpenChange={(next) => !next && setCouponsEvent(null)} />
      <EventCheckInDialog open={Boolean(checkInEvent)} eventItem={checkInEvent} onOpenChange={(next) => !next && setCheckInEvent(null)} />
      <EventRegistrationsDialog open={Boolean(registrationsEvent)} eventItem={registrationsEvent} onOpenChange={(next) => !next && setRegistrationsEvent(null)} onChanged={() => void load()} />
      <SafeDeleteDialog open={Boolean(deleting)} title={`Delete ${deleting?.title ?? "event"}?`} description="Only draft or cancelled events can be permanently deleted. The event photo will also be removed." deleting={savingId === deleting?.id} onOpenChange={(next) => !next && setDeleting(null)} onConfirm={() => void deleteEvent()} />
    </div>
  );
}
