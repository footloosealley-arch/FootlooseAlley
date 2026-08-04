"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleCheck, CircleOff, Plus, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import SafeDeleteDialog from "@/components/common/SafeDeleteDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui-foundation/StatCard";
import { classesService, type ActiveInstructor, type ClassStatus, type StudioClass } from "@/services/classes.service";
import ClassFilters from "./ClassFilters";
import ClassFormDialog from "./ClassFormDialog";
import ClassList from "./ClassList";

export default function ClassesManagement() {
  const [items, setItems] = useState<StudioClass[]>([]);
  const [instructors, setInstructors] = useState<ActiveInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("All");
  const [program, setProgram] = useState("All");
  const [status, setStatus] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudioClass | null>(null);
  const [deleting, setDeleting] = useState<StudioClass | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [classes, activeInstructors] = await Promise.all([
        classesService.getAll(),
        classesService.getActiveInstructors(),
      ]);
      setItems(classes);
      setInstructors(activeInstructors);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load classes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const programs = useMemo(() => [...new Set(items.map((item) => item.program))].sort(), [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (day === "All" || item.day === day) &&
      (program === "All" || item.program === program) &&
      (status === "All" || item.status === status) &&
      `${item.class_name} ${item.program} ${item.instructor?.name ?? "unassigned"}`.toLowerCase().includes(query)
    );
  }, [items, day, program, status, search]);

  async function changeStatus(item: StudioClass) {
    const next: ClassStatus = item.status === "Active" ? "Inactive" : "Active";
    setSavingId(item.id);
    try {
      await classesService.setStatus(item.id, next);
      toast.success(`Class ${next.toLowerCase()}.`);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to change class status.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteClass() {
    if (!deleting) return;
    setSavingId(deleting.id);
    try {
      await classesService.remove(deleting.id);
      toast.success("Unused class deleted.");
      setDeleting(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete class.");
    } finally {
      setSavingId(null);
    }
  }

  const linkedStudents = items.reduce((total, item) => total + item.enrolled_count, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="Classes" description="Manage the studio schedule, capacity, instructors and availability." action={<Button type="button" className="w-full sm:w-auto" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> Add class</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Total classes" value={items.length} icon={CalendarDays} />
        <StatCard label="Active" value={items.filter((item) => item.status === "Active").length} icon={CircleCheck} />
        <StatCard label="Inactive" value={items.filter((item) => item.status !== "Active").length} icon={CircleOff} />
        <StatCard label="Linked students" value={linkedStudents} icon={Users} />
      </div>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <ClassFilters search={search} day={day} program={program} status={status} programs={programs} onSearch={setSearch} onDay={setDay} onProgram={setProgram} onStatus={setStatus} />
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {items.length}</span>
          <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={() => void load()}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button>
        </div>
        {loading ? <div className="p-5"><LoadingCard /></div> : error ? <div className="p-5"><ErrorCard message={error} onRetry={() => void load()} /></div> : <ClassList items={filtered} savingId={savingId} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onStatus={(item) => void changeStatus(item)} onDelete={setDeleting} />}
      </section>
      <ClassFormDialog open={formOpen} classItem={editing} instructors={instructors} onOpenChange={setFormOpen} onSaved={() => void load()} />
      <SafeDeleteDialog open={Boolean(deleting)} title={`Delete ${deleting?.class_name ?? "class"}?`} description="Only inactive classes without linked students or attendance history can be deleted." deleting={savingId === deleting?.id} onOpenChange={(open) => !open && setDeleting(null)} onConfirm={() => void deleteClass()} />
    </div>
  );
}
