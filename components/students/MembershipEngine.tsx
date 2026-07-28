"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, History, RefreshCw, Snowflake, XCircle } from "lucide-react";
import { MEMBERSHIP_PLANS, addPlanDuration, membershipService } from "@/services/membership.service";
import type { Membership, MembershipEvent, MembershipPlan, Student } from "@/types/database";

interface MembershipEngineProps {
  student: Student;
  memberships: Membership[];
  membershipEvents: MembershipEvent[];
  onChanged: () => void | Promise<void>;
}

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function statusClass(status: string | null | undefined) {
  switch (status) {
    case "Active": return "bg-green-100 text-green-700";
    case "Expiring Soon": return "bg-amber-100 text-amber-700";
    case "Expired": return "bg-red-100 text-red-700";
    case "Frozen": return "bg-blue-100 text-blue-700";
    case "Cancelled": return "bg-slate-100 text-slate-700";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function MembershipEngine({ student, memberships, membershipEvents, onChanged }: MembershipEngineProps) {
  const [showRenew, setShowRenew] = useState(false);
  const [plan, setPlan] = useState<MembershipPlan>((student.membership_plan as MembershipPlan) in MEMBERSHIP_PLANS ? student.membership_plan as MembershipPlan : "Monthly");
  const [startDate, setStartDate] = useState(todayString());
  const [discount, setDiscount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const endDate = useMemo(() => addPlanDuration(startDate, plan), [startDate, plan]);
  const planAmount = MEMBERSHIP_PLANS[plan].amount;
  const netAmount = Math.max(0, planAmount - Number(discount || 0));
  const balance = Math.max(0, netAmount - Number(paidAmount || 0));
  const end = student.membership_end_date || student.next_due_date;
  const daysRemaining = end ? Math.ceil((new Date(`${end}T00:00:00`).getTime() - new Date(`${todayString()}T00:00:00`).getTime()) / 86400000) : null;
  const currentStatus = student.membership_status || (student.membership_frozen ? "Frozen" : daysRemaining !== null && daysRemaining < 0 ? "Expired" : "Active");

  async function execute(action: () => Promise<void>, success: string) {
    setBusy(true); setMessage(null);
    try { await action(); setMessage(success); await onChanged(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function submitRenew(event: React.FormEvent) {
    event.preventDefault();
    await execute(async () => {
      await membershipService.renewMembership({ studentId: student.id, plan, startDate, discount: Number(discount || 0), paidAmount: Number(paidAmount || 0), notes });
      setShowRenew(false); setNotes("");
    }, "Membership renewed successfully.");
  }

  return (
    <section className="rounded-2xl border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Membership Engine</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(currentStatus)}`}>{currentStatus}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Manage renewals, freezes and the complete membership timeline.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowRenew((value) => !value)} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"><RefreshCw className="h-4 w-4" />Renew</button>
          {student.membership_frozen ? (
            <button type="button" disabled={busy} onClick={() => execute(() => membershipService.reactivateMembership(student), "Membership reactivated successfully.")} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Reactivate</button>
          ) : (
            <button type="button" disabled={busy} onClick={() => { const reason = window.prompt("Reason for freezing the membership (optional):") ?? undefined; if (reason !== undefined) void execute(() => membershipService.freezeMembership({ studentId: student.id, reason }), "Membership frozen successfully."); }} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-blue-700 disabled:opacity-50"><Snowflake className="h-4 w-4" />Freeze</button>
          )}
          <button type="button" disabled={busy || currentStatus === "Cancelled"} onClick={() => { if (!window.confirm("Cancel this membership?")) return; const reason = window.prompt("Reason for cancellation (optional):") ?? undefined; void execute(() => membershipService.cancelMembership(student.id, reason), "Membership cancelled."); }} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"><XCircle className="h-4 w-4" />Cancel</button>
        </div>
      </div>

      {message && <div className="mt-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm">{message}</div>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Current plan" value={student.membership_plan || "Not selected"} icon={CalendarDays} />
        <Stat label="Start date" value={formatDate(student.membership_start_date || student.join_date)} icon={CalendarDays} />
        <Stat label="End date" value={formatDate(end)} icon={Clock3} />
        <Stat label="Days remaining" value={daysRemaining === null ? "-" : daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`} icon={Clock3} />
      </div>

      {student.membership_frozen && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Frozen since {formatDate(student.membership_freeze_started_at)}{student.membership_freeze_reason ? ` — ${student.membership_freeze_reason}` : ""}. Reactivation extends the expiry date by the number of frozen days.
        </div>
      )}

      {showRenew && (
        <form onSubmit={submitRenew} className="mt-6 rounded-xl border bg-muted/20 p-5">
          <h3 className="font-semibold">New membership / renewal</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium">Plan<select value={plan} onChange={(event) => setPlan(event.target.value as MembershipPlan)} className="mt-2 h-10 w-full rounded-md border bg-background px-3">{Object.keys(MEMBERSHIP_PLANS).map((name) => <option key={name} value={name}>{name} — {money.format(MEMBERSHIP_PLANS[name as MembershipPlan].amount)}</option>)}</select></label>
            <label className="text-sm font-medium">Start date<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3" /></label>
            <label className="text-sm font-medium">Discount<input min="0" max={planAmount} type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3" /></label>
            <label className="text-sm font-medium">Paid now<input min="0" type="number" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3" /></label>
          </div>
          <label className="mt-4 block text-sm font-medium">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-2 w-full rounded-md border bg-background px-3 py-2" placeholder="Optional renewal notes" /></label>
          <div className="mt-4 grid gap-2 rounded-lg border bg-background p-4 text-sm sm:grid-cols-4"><span>Plan: <strong>{money.format(planAmount)}</strong></span><span>Ends: <strong>{formatDate(endDate)}</strong></span><span>Net: <strong>{money.format(netAmount)}</strong></span><span>Balance: <strong>{money.format(balance)}</strong></span></div>
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowRenew(false)} className="rounded-lg border px-4 py-2 text-sm font-medium">Cancel</button><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : "Save membership"}</button></div>
        </form>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4" />Membership history</h3>
          <div className="mt-3 space-y-3">{memberships.length === 0 ? <Empty text="No membership history yet. Use Renew to create the first record." /> : memberships.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.plan}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(item.start_date)} – {formatDate(item.expiry_date)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>{item.status}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground"><span>Amount: {money.format(Number(item.amount || 0))}</span><span>Paid: {money.format(Number(item.paid_amount || 0))}</span><span>Due: {money.format(Number(item.amount_due || 0))}</span><span>{item.payment_status}</span></div></div>)}</div>
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4" />Activity timeline</h3>
          <div className="mt-3 space-y-3">{membershipEvents.length === 0 ? <Empty text="No membership activity recorded yet." /> : membershipEvents.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><p className="font-medium">{item.event_type}</p><span className="text-xs text-muted-foreground">{formatDate(item.event_date)}</span></div>{item.reason && <p className="mt-2 text-sm">{item.reason}</p>}{item.notes && <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>}{(item.previous_status || item.new_status) && <p className="mt-2 text-xs text-muted-foreground">{item.previous_status || "-"} → {item.new_status || "-"}</p>}</div>)}</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return <div className="rounded-xl border p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-muted-foreground" /></div><p className="mt-2 font-semibold">{value}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{text}</div>; }
