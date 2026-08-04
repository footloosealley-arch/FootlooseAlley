"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, History, MessageCircle, Pencil, Phone, Plus, RefreshCw, Search, Trash2, UserCheck, UserRoundX, Users } from "lucide-react";
import { toast } from "sonner";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import SafeDeleteDialog from "@/components/common/SafeDeleteDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/ui-foundation/StatCard";
import { instructorsService, type Instructor, type InstructorStatus } from "@/services/instructors.service";
import InstructorFormDialog from "./InstructorFormDialog";

function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export default function InstructorManagement() {
  const [items, setItems] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatusFilter] = useState("All");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState<Instructor | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await instructorsService.getAll());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load instructors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const summary = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => item.status === "Active").length,
    inactive: items.filter((item) => item.status !== "Active").length,
    classes: items.reduce((total, item) => total + item.assigned_classes, 0),
  }), [items]);
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return items.filter((item) =>
      (status === "All" || item.status === status) &&
      `${item.name} ${item.phone} ${item.specialization}`.toLowerCase().includes(query)
    );
  }, [items, search, status]);

  async function changeStatus(item: Instructor) {
    const next: InstructorStatus = item.status === "Active" ? "Inactive" : "Active";
    setSavingId(item.id);
    try {
      await instructorsService.setStatus(item.id, next);
      toast.success(`${item.name} ${next === "Active" ? "activated" : "deactivated"}.`);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update status.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteInstructor() {
    if (!deleting) return;
    setSavingId(deleting.id);
    try {
      await instructorsService.remove(deleting.id);
      toast.success("Unused instructor deleted.");
      setDeleting(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete instructor.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="Instructors" description="Manage your teaching team, assignments and availability." action={<Button type="button" className="w-full sm:w-auto" onClick={() => { setEditing(null); setDialog(true); }}><Plus /> Add instructor</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Total instructors" value={summary.total} icon={Users} />
        <StatCard label="Active" value={summary.active} icon={UserCheck} />
        <StatCard label="Inactive" value={summary.inactive} icon={UserRoundX} />
        <StatCard label="Class assignments" value={summary.classes} icon={BookOpen} />
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-3 border-b p-3 sm:p-4 md:grid-cols-[minmax(16rem,1fr)_12rem_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" type="search" aria-label="Search instructors" placeholder="Search name, phone or specialization" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Select value={status} onValueChange={(value) => setStatusFilter(value ?? "All")}>
            <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
          </Select>
          <Button type="button" className="h-11" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button>
        </div>
        <div className="border-b px-4 py-2 text-xs text-muted-foreground">Showing {filtered.length} of {items.length}</div>

        {loading ? <div className="p-5"><LoadingCard /></div> : error ? <div className="p-5"><ErrorCard message={error} onRetry={() => void load()} /></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">No instructors match your filters.</div> : (
          <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
            {filtered.map((item) => {
              const inUse = item.assigned_classes + item.assigned_students + item.attendance_records > 0;
              return (
                <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><h2 className="font-semibold">{item.name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.specialization}</p></div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span>
                  </div>
                  <a href={`tel:${item.phone}`} className="mt-3 flex min-h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm hover:bg-muted"><Phone className="size-4 text-primary" />{item.phone}</a>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-muted/50 p-2"><BookOpen className="mx-auto mb-1 size-4 text-primary" /><strong className="block text-sm">{item.assigned_classes}</strong>Classes</div>
                    <div className="rounded-xl bg-muted/50 p-2"><Users className="mx-auto mb-1 size-4 text-primary" /><strong className="block text-sm">{item.assigned_students}</strong>Students</div>
                    <div className="rounded-xl bg-muted/50 p-2"><History className="mx-auto mb-1 size-4 text-primary" /><strong className="block text-sm">{item.attendance_records}</strong>Records</div>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:flex sm:flex-wrap">
                    <Button size="sm" variant="outline" render={<a href={`https://wa.me/${formatWhatsAppPhone(item.phone)}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${item.name}`} />}><MessageCircle /> WhatsApp</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(item); setDialog(true); }}><Pencil /> Edit</Button>
                    <Button type="button" size="sm" variant={item.status === "Active" ? "destructive" : "default"} disabled={savingId === item.id} onClick={() => void changeStatus(item)}>{item.status === "Active" ? "Deactivate" : "Activate"}</Button>
                    {item.status === "Inactive" && <Button type="button" size="sm" variant="outline" className="text-destructive hover:text-destructive sm:ml-auto" disabled={inUse || savingId === item.id} title={inUse ? "Linked history prevents deletion" : "Delete this unused instructor"} onClick={() => setDeleting(item)}><Trash2 /> Delete</Button>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <InstructorFormDialog key={editing?.id ?? "new"} open={dialog} instructor={editing} onOpenChange={setDialog} onSaved={() => void load()} />
      <SafeDeleteDialog open={Boolean(deleting)} title={`Delete ${deleting?.name ?? "instructor"}?`} description="Only inactive instructors without class, student or attendance references can be deleted." deleting={savingId === deleting?.id} onOpenChange={(open) => !open && setDeleting(null)} onConfirm={() => void deleteInstructor()} />
    </div>
  );
}
