"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Pencil, Phone, Plus, RefreshCw, UserCheck, UserRoundX, Users } from "lucide-react";
import { toast } from "sonner";
import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui-foundation/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InstructorFormDialog from "./InstructorFormDialog";
import { instructorsService, type Instructor, type InstructorStatus } from "@/services/instructors.service";

export default function InstructorManagement() {
  const [items, setItems] = useState<Instructor[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [search, setSearch] = useState(""), [status, setStatusFilter] = useState("All"), [dialog, setDialog] = useState(false), [editing, setEditing] = useState<Instructor | null>(null), [savingId, setSavingId] = useState<number | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await instructorsService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load instructors."); } finally { setLoading(false); } }, []);
  useEffect(() => {
    // Initial remote-data synchronization; state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const summary = useMemo(() => ({ total: items.length, active: items.filter(x => x.status === "Active").length, inactive: items.filter(x => x.status !== "Active").length }), [items]);
  const filtered = useMemo(() => items.filter(x => (status === "All" || x.status === status) && `${x.name} ${x.phone} ${x.specialization}`.toLowerCase().includes(search.toLowerCase().trim())), [items, search, status]);
  async function changeStatus(item: Instructor) { const next: InstructorStatus = item.status === "Active" ? "Inactive" : "Active"; setSavingId(item.id); try { await instructorsService.setStatus(item.id, next); toast.success(`${item.name} ${next === "Active" ? "activated" : "deactivated"}.`); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to update status."); } finally { setSavingId(null); } }
  const formatWhatsAppPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("91")) return digits;
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;

    return digits;
  };

  return <div className="space-y-6">
    <PageHeader title="Instructors" description="Manage your teaching team, specialties, and availability." action={<Button onClick={() => { setEditing(null); setDialog(true); }}><Plus /> Add instructor</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Total instructors" value={summary.total} icon={Users} /><StatCard label="Active" value={summary.active} icon={UserCheck} /><StatCard label="Inactive" value={summary.inactive} icon={UserRoundX} /></div>
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row"><Input className="sm:max-w-sm" type="search" aria-label="Search instructors" placeholder="Search name, phone, or specialization" value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={status} onValueChange={v => setStatusFilter(v ?? "All")}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
        <Button className="sm:ml-auto" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button></div>
      {loading ? <div className="p-5"><LoadingCard /></div> : error ? <div className="p-5"><ErrorCard message={error} onRetry={() => void load()} /></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">No instructors match your filters.</div> : <div className="divide-y">{filtered.map(item => <article key={item.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-semibold">{item.name}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.specialization} · {item.phone}</p></div>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" render={<a href={`tel:${item.phone}`} aria-label={`Call ${item.name}`} />}><Phone /> Call</Button><Button size="sm" variant="outline" render={<a href={`https://wa.me/${formatWhatsAppPhone(item.phone)}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${item.name}`} />}><MessageCircle /> WhatsApp</Button><Button size="sm" variant="outline" onClick={() => { setEditing(item); setDialog(true); }}><Pencil /> Edit</Button><Button size="sm" variant={item.status === "Active" ? "destructive" : "default"} disabled={savingId === item.id} onClick={() => void changeStatus(item)}>{item.status === "Active" ? "Deactivate" : "Activate"}</Button></div>
      </article>)}</div>}
    </section>{dialog && <InstructorFormDialog key={editing?.id ?? "new"} open instructor={editing} onOpenChange={setDialog} onSaved={() => void load()} />}
  </div>;
}
