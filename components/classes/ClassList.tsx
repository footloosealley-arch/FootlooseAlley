"use client";

import { CalendarClock, History, Pencil, Trash2, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudioClass } from "@/services/classes.service";

interface Props {
  items: StudioClass[];
  savingId: number | null;
  onEdit: (item: StudioClass) => void;
  onStatus: (item: StudioClass) => void;
  onDelete: (item: StudioClass) => void;
}

function displayTime(value: string): string {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}

export default function ClassList({ items, savingId, onEdit, onStatus, onDelete }: Props) {
  if (!items.length) {
    return <p className="p-12 text-center text-sm text-muted-foreground">No classes match your filters.</p>;
  }

  return (
    <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
      {items.map((item) => {
        const inUse = item.enrolled_count > 0 || item.attendance_count > 0;
        return (
          <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold leading-tight">{item.class_name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.program}</p>
              </div>
              <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Capacity {item.max_capacity}</span>
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><CalendarClock className="size-4 text-primary" />{item.day}, {displayTime(item.start_time)}–{displayTime(item.end_time)}</p>
              <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><UserRound className="size-4 text-primary" />{item.instructor?.name ?? "Instructor unassigned"}</p>
              <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><Users className="size-4 text-primary" />{item.enrolled_count} linked student{item.enrolled_count === 1 ? "" : "s"}</p>
              <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5"><History className="size-4 text-primary" />{item.attendance_count} attendance record{item.attendance_count === 1 ? "" : "s"}</p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:flex sm:flex-wrap">
              <Button type="button" size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil /> Edit</Button>
              <Button type="button" size="sm" variant={item.status === "Active" ? "destructive" : "default"} disabled={savingId === item.id} onClick={() => onStatus(item)}>
                {item.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
              {item.status === "Inactive" && (
                <Button type="button" size="sm" variant="outline" className="col-span-2 text-destructive hover:text-destructive sm:ml-auto" disabled={inUse || savingId === item.id} title={inUse ? "Linked history prevents deletion" : "Delete this unused class"} onClick={() => onDelete(item)}>
                  <Trash2 /> Delete
                </Button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
