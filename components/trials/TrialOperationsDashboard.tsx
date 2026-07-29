"use client";

import Link from "next/link";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import { useCallback, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

type TrialStatus =
  | "Scheduled"
  | "Attended"
  | "Missed"
  | "Rescheduled"
  | "Cancelled";

type TrialOutcome =
  | "Pending"
  | "Interested"
  | "Joined"
  | "Follow-up Required"
  | "Not Interested";

type TrialEnquiry = {
  id: number;
  Name: string | null;
  Phone: string | null;
  Email: string | null;
  Program: string | null;
  Status: string | null;
  Follow_up_date: string | null;
  Notes: string | null;
  assigned_to: string | null;
  trial_date: string | null;
  trial_status: TrialStatus | null;
  trial_outcome: TrialOutcome | null;
  trial_notes: string | null;
  converted_student_id: number | null;
  created_at: string;
};

type TrialFilter = "All" | "Today" | "Upcoming" | "Past";

const TRIAL_STATUSES: TrialStatus[] = [
  "Scheduled",
  "Attended",
  "Missed",
  "Rescheduled",
  "Cancelled",
];

const TRIAL_OUTCOMES: TrialOutcome[] = [
  "Pending",
  "Interested",
  "Joined",
  "Follow-up Required",
  "Not Interested",
];

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getWhatsAppUrl(phone: string | null, name: string | null): string {
  let cleanNumber = (phone ?? "").replace(/\D/g, "");
  if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
  const customerName = name?.trim() || "there";
  const message = encodeURIComponent(
    `Hi ${customerName}, this is Footloose Alley Dance & Fitness Studio. We are following up regarding your trial class. Please let us know if you need any assistance.`
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function getCallUrl(phone: string | null): string {
  return `tel:${(phone ?? "").replace(/[^\d+]/g, "")}`;
}

function getStatusStyle(status: TrialStatus | null): string {
  switch (status) {
    case "Attended":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Missed":
      return "bg-red-50 text-red-700 ring-red-200";
    case "Rescheduled":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "Cancelled":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-blue-50 text-blue-700 ring-blue-200";
  }
}

function getOutcomeStyle(outcome: TrialOutcome | null): string {
  switch (outcome) {
    case "Joined":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Interested":
      return "bg-cyan-50 text-cyan-700 ring-cyan-200";
    case "Follow-up Required":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "Not Interested":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClassName,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TrialOperationsDashboard() {
  const [trials, setTrials] = useState<TrialEnquiry[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<TrialFilter>("All");
  const [statusFilter, setStatusFilter] = useState<TrialStatus | "All">("All");

  const fetchTrials = useCallback(async () => {
    const { data, error } = await supabase
      .from("Enquiries")
      .select("id,Name,Phone,Email,Program,Status,Follow_up_date,Notes,assigned_to,trial_date,trial_status,trial_outcome,trial_notes,converted_student_id,created_at")
      .not("trial_date", "is", null)
      .order("trial_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TrialEnquiry[];
  }, []);
  const commitTrials = useCallback((result: TrialEnquiry[]) => setTrials(result), []);
  const handleTrialsError = useCallback((error: unknown) => {
    toast.error(error instanceof Error ? error.message : "Unable to load trial bookings.");
    setTrials([]);
  }, []);
  const { loading, refresh: loadTrials } = useLatestAsync({
    fetchData: fetchTrials,
    onSuccess: commitTrials,
    onError: handleTrialsError,
  });

  async function updateTrial(
    trial: TrialEnquiry,
    changes: Partial<Pick<TrialEnquiry, "trial_status" | "trial_outcome" | "trial_notes" | "Follow_up_date">>
  ) {
    setSavingId(trial.id);
    const { error } = await supabase.from("Enquiries").update(changes).eq("id", trial.id);

    if (error) {
      toast.error(error.message || "Unable to update trial.");
    } else {
      setTrials((current) =>
        current.map((item) => (item.id === trial.id ? { ...item, ...changes } : item))
      );
      toast.success("Trial updated.");
    }
    setSavingId(null);
  }

  const today = getLocalDateString();

  const summary = useMemo(() => {
    const todayTrials = trials.filter((trial) => trial.trial_date === today);
    const attended = trials.filter((trial) => trial.trial_status === "Attended");
    const missed = trials.filter((trial) => trial.trial_status === "Missed");
    const followUp = trials.filter((trial) => trial.trial_outcome === "Follow-up Required");

    return {
      today: todayTrials.length,
      attended: attended.length,
      missed: missed.length,
      followUp: followUp.length,
    };
  }, [trials, today]);

  const filteredTrials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return trials.filter((trial) => {
      const matchesSearch =
        !query ||
        [trial.Name, trial.Phone, trial.Email, trial.Program, trial.assigned_to]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || (trial.trial_status ?? "Scheduled") === statusFilter;

      let matchesDate = true;
      if (dateFilter === "Today") matchesDate = trial.trial_date === today;
      if (dateFilter === "Upcoming") matchesDate = Boolean(trial.trial_date && trial.trial_date > today);
      if (dateFilter === "Past") matchesDate = Boolean(trial.trial_date && trial.trial_date < today);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [dateFilter, search, statusFilter, today, trials]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Trial Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track scheduled trials, attendance, outcomes, and next follow-ups.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadTrials()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold shadow-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/enquiries"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Manage Enquiries
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Trials Today" value={summary.today} subtitle="Scheduled for today" icon={<CalendarClock className="h-5 w-5" />} iconClassName="bg-blue-50 text-blue-700" />
        <SummaryCard title="Attended" value={summary.attended} subtitle="Trials marked attended" icon={<UserCheck className="h-5 w-5" />} iconClassName="bg-emerald-50 text-emerald-700" />
        <SummaryCard title="Missed" value={summary.missed} subtitle="Require rescheduling" icon={<UserRoundX className="h-5 w-5" />} iconClassName="bg-red-50 text-red-700" />
        <SummaryCard title="Follow-up Needed" value={summary.followUp} subtitle="Outcome needs action" icon={<Clock3 className="h-5 w-5" />} iconClassName="bg-amber-50 text-amber-700" />
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, program, or instructor..."
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as TrialFilter)}
            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Trial Dates</option>
            <option value="Today">Today</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Past">Past</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TrialStatus | "All")}
            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Trial Statuses</option>
            {TRIAL_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredTrials.length}</span> trial {filteredTrials.length === 1 ? "booking" : "bookings"}.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-background p-10 text-center text-sm text-muted-foreground shadow-sm">
          Loading trial bookings...
        </div>
      ) : filteredTrials.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center shadow-sm">
          <CalendarCheck2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No trial bookings found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a trial date to an enquiry or adjust the current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTrials.map((trial) => {
            const disabled = savingId === trial.id;
            const status = trial.trial_status ?? "Scheduled";
            const outcome = trial.trial_outcome ?? "Pending";

            return (
              <article key={trial.id} className="rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{trial.Name || "Unnamed enquiry"}</h2>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusStyle(status)}`}>
                        {status}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getOutcomeStyle(outcome)}`}>
                        {outcome}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {trial.Program || "Program not specified"} · {formatDate(trial.trial_date)}
                    </p>
                    {trial.assigned_to && (
                      <p className="mt-1 text-xs text-muted-foreground">Assigned to {trial.assigned_to}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {trial.Phone && (
                      <>
                        <a href={getCallUrl(trial.Phone)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted" aria-label={`Call ${trial.Name ?? "enquiry"}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                        <a href={getWhatsAppUrl(trial.Phone, trial.Name)} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted" aria-label={`WhatsApp ${trial.Name ?? "enquiry"}`}>
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium">
                    Trial status
                    <select
                      value={status}
                      disabled={disabled}
                      onChange={(event) => void updateTrial(trial, { trial_status: event.target.value as TrialStatus })}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      {TRIAL_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5 text-sm font-medium">
                    Trial outcome
                    <select
                      value={outcome}
                      disabled={disabled}
                      onChange={(event) => void updateTrial(trial, { trial_outcome: event.target.value as TrialOutcome })}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      {TRIAL_OUTCOMES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                    Follow-up date
                    <input
                      type="date"
                      value={trial.Follow_up_date ?? ""}
                      disabled={disabled}
                      onChange={(event) => void updateTrial(trial, { Follow_up_date: event.target.value || null })}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    />
                  </label>

                  <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                    Trial notes
                    <textarea
                      key={`${trial.id}-${trial.trial_notes ?? ""}`}
                      defaultValue={trial.trial_notes ?? ""}
                      placeholder="Record feedback, objections, or the next action..."
                      className="min-h-24 w-full resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value !== (trial.trial_notes ?? "")) {
                          void updateTrial(trial, { trial_notes: value || null });
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    {disabled ? "Saving changes..." : "Changes save automatically"}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {status !== "Attended" && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => void updateTrial(trial, { trial_status: "Attended" })}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Attended
                      </button>
                    )}
                    <Link
                      href="/enquiries"
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Open Enquiries
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
