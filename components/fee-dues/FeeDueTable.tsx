"use client";

import Link from "next/link";
import {
  FeeDueWithStudent,
  feeDuesService,
} from "@/services/fee-dues.service";

interface FeeDueTableProps {
  feeDues: FeeDueWithStudent[];
  loading?: boolean;
  onEdit: (feeDue: FeeDueWithStudent) => void;
  onMarkPaid: (feeDue: FeeDueWithStudent) => void;
  onSendReminder: (feeDue: FeeDueWithStudent) => void;
  onCallStudent: (feeDue: FeeDueWithStudent) => void;
  onWaive: (feeDue: FeeDueWithStudent) => void;
  onCancel: (feeDue: FeeDueWithStudent) => void;
  onReopen: (feeDue: FeeDueWithStudent) => void;
  onDelete: (feeDue: FeeDueWithStudent) => void;
}

type Priority = "Overdue" | "Due Today" | "Due This Week" | "Upcoming" | "Closed";

function getPriority(feeDue: FeeDueWithStudent): Priority {
  if (["Paid", "Waived", "Cancelled"].includes(feeDue.status)) return "Closed";
  const days = feeDuesService.getDaysUntilDue(feeDue.due_date);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due Today";
  if (days <= 7) return "Due This Week";
  return "Upcoming";
}

function priorityRank(priority: Priority) {
  return { Overdue: 0, "Due Today": 1, "Due This Week": 2, Upcoming: 3, Closed: 4 }[priority];
}

function PriorityBadge({ priority, days }: { priority: Priority; days: number }) {
  const styles = {
    Overdue: "bg-red-50 text-red-700 ring-red-200",
    "Due Today": "bg-orange-50 text-orange-700 ring-orange-200",
    "Due This Week": "bg-amber-50 text-amber-700 ring-amber-200",
    Upcoming: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Closed: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const detail = priority === "Overdue"
    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
    : priority === "Due Today"
      ? "Payment due today"
      : priority === "Closed"
        ? "No action needed"
        : `${days} day${days === 1 ? "" : "s"} remaining`;

  return (
    <div>
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset ${styles[priority]}`}>
        {priority}
      </span>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{detail}</p>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ST";
}

export default function FeeDueTable({
  feeDues,
  loading = false,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onCallStudent,
  onWaive,
  onCancel,
  onReopen,
  onDelete,
}: FeeDueTableProps) {
  const sorted = [...feeDues].sort((first, second) => {
    const rankDifference = priorityRank(getPriority(first)) - priorityRank(getPriority(second));
    if (rankDifference !== 0) return rankDifference;
    const dateDifference = first.due_date.localeCompare(second.due_date);
    if (dateDifference !== 0) return dateDifference;
    return Number(second.amount_due) - Number(first.amount_due);
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Loading fee dues…
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="text-base font-black text-slate-900">No fee dues found</h2>
        <p className="mt-2 text-sm text-slate-500">Try clearing the filters or add a new fee-due record.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-950">Collection priority list</h2>
            <p className="mt-1 text-xs text-slate-500">Automatically sorted by urgency, due date, and amount.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{sorted.length} records</span>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Membership</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((feeDue) => {
              const priority = getPriority(feeDue);
              const days = feeDuesService.getDaysUntilDue(feeDue.due_date);
              const active = priority !== "Closed";
              return (
                <tr key={feeDue.id} className="align-top transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
                        {initials(feeDue.student_name || `Student ${feeDue.student_id}`)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/students/${feeDue.student_id}`} className="font-black text-slate-900 hover:text-violet-700">
                          {feeDue.student_name || `Student #${feeDue.student_id}`}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">{feeDue.student_phone || "No phone number"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><PriorityBadge priority={priority} days={days} /></td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      {feeDue.membership_plan || "Not specified"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{feeDuesService.formatDate(feeDue.due_date)}</td>
                  <td className="px-4 py-4 text-right text-sm font-black text-slate-950">{feeDuesService.formatCurrency(feeDue.amount_due)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {active ? (
                        <>
                          <button onClick={() => onSendReminder(feeDue)} className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">WhatsApp</button>
                          <button onClick={() => onCallStudent(feeDue)} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">Call</button>
                          <button onClick={() => onMarkPaid(feeDue)} className="rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700">Record payment</button>
                        </>
                      ) : (
                        <button onClick={() => onReopen(feeDue)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Reopen</button>
                      )}
                      <details className="relative">
                        <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50">•••</summary>
                        <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                          <button onClick={() => onEdit(feeDue)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">Edit</button>
                          {active ? <button onClick={() => onWaive(feeDue)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-violet-700 hover:bg-violet-50">Waive</button> : null}
                          {active ? <button onClick={() => onCancel(feeDue)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-700 hover:bg-amber-50">Cancel</button> : null}
                          <button onClick={() => onDelete(feeDue)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-red-700 hover:bg-red-50">Delete</button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {sorted.map((feeDue) => {
          const priority = getPriority(feeDue);
          const days = feeDuesService.getDaysUntilDue(feeDue.due_date);
          const active = priority !== "Closed";
          return (
            <article key={feeDue.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/students/${feeDue.student_id}`} className="font-black text-slate-950">{feeDue.student_name || `Student #${feeDue.student_id}`}</Link>
                  <p className="mt-1 text-xs text-slate-500">{feeDue.membership_plan || "Membership not specified"}</p>
                </div>
                <p className="text-sm font-black text-slate-950">{feeDuesService.formatCurrency(feeDue.amount_due)}</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <PriorityBadge priority={priority} days={days} />
                <p className="text-xs font-bold text-slate-600">{feeDuesService.formatDate(feeDue.due_date)}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {active ? <button onClick={() => onSendReminder(feeDue)} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700">WhatsApp</button> : null}
                {active ? <button onClick={() => onCallStudent(feeDue)} className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700">Call</button> : null}
                {active ? <button onClick={() => onMarkPaid(feeDue)} className="col-span-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-bold text-white">Record payment</button> : <button onClick={() => onReopen(feeDue)} className="col-span-2 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700">Reopen</button>}
                <button onClick={() => onEdit(feeDue)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Edit</button>
                <button onClick={() => onDelete(feeDue)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Delete</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
