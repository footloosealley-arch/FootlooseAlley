"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  BellRing,
  Activity,
  Cake,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  UserRoundSearch,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import {
  FOLLOW_UP_TYPES,
  addDays,
  dailyFollowUpsService,
  localDateString,
  type DailyFollowUp,
  type FollowUpType,
} from "@/services/daily-follow-ups.service";

type StatusFilter = "Open" | "Postponed" | "Completed" | "All";

const typeStyles: Record<
  FollowUpType,
  { icon: React.ReactNode; badge: string; border: string }
> = {
  Membership: {
    icon: <CreditCard />,
    badge: "bg-violet-100 text-violet-800",
    border: "border-l-violet-500",
  },
  "Fee Due": {
    icon: <CircleDollarSign />,
    badge: "bg-rose-100 text-rose-800",
    border: "border-l-rose-500",
  },
  Enquiry: {
    icon: <UserRoundSearch />,
    badge: "bg-blue-100 text-blue-800",
    border: "border-l-blue-500",
  },
  Trial: {
    icon: <CalendarClock />,
    badge: "bg-amber-100 text-amber-800",
    border: "border-l-amber-500",
  },
  Birthday: {
    icon: <Cake />,
    badge: "bg-pink-100 text-pink-800",
    border: "border-l-pink-500",
  },
  Attendance: {
    icon: <Activity />,
    badge: "bg-cyan-100 text-cyan-800",
    border: "border-l-cyan-500",
  },
};

function effectiveStatus(followUp: DailyFollowUp): Exclude<StatusFilter, "All"> {
  if (followUp.actionStatus === "Completed") return "Completed";
  if (
    followUp.actionStatus === "Postponed" &&
    followUp.postponedUntil &&
    followUp.postponedUntil > localDateString()
  ) {
    return "Postponed";
  }
  return "Open";
}

function formatDate(dateValue: string): string {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  className,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs opacity-75">{detail}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-white/70 [&_svg]:size-5">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DailyFollowUpCenter() {
  const [followUps, setFollowUps] = useState<DailyFollowUp[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FollowUpType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Open");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchFollowUps = useCallback(
    () => dailyFollowUpsService.getFollowUps(),
    []
  );
  const handleSuccess = useCallback((result: DailyFollowUp[]) => {
    setFollowUps(result);
  }, []);
  const handleError = useCallback((error: unknown) => {
    toast.error(
      error instanceof Error ? error.message : "Unable to load daily follow-ups."
    );
    setFollowUps([]);
  }, []);
  const { loading, refresh } = useLatestAsync({
    fetchData: fetchFollowUps,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const summary = useMemo(() => {
    const open = followUps.filter((item) => effectiveStatus(item) === "Open");
    return {
      open: open.length,
      urgent: open.filter((item) => item.priority === "Urgent").length,
      today: open.filter((item) => item.priority === "Today").length,
      postponed: followUps.filter(
        (item) => effectiveStatus(item) === "Postponed"
      ).length,
    };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    const query = search.trim().toLowerCase();

    return followUps.filter((followUp) => {
      const matchesStatus =
        statusFilter === "All" || effectiveStatus(followUp) === statusFilter;
      const matchesType = typeFilter === "All" || followUp.type === typeFilter;
      const matchesSearch =
        !query ||
        [followUp.name, followUp.phone, followUp.title, followUp.detail]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [followUps, search, statusFilter, typeFilter]);

  async function completeFollowUp(followUp: DailyFollowUp) {
    setSavingKey(followUp.key);
    try {
      await dailyFollowUpsService.complete(followUp);
      toast.success("Follow-up completed.");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to complete follow-up."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function postponeFollowUp(followUp: DailyFollowUp, days: number) {
    setSavingKey(followUp.key);
    try {
      await dailyFollowUpsService.postpone(
        followUp,
        addDays(localDateString(), days)
      );
      toast.success(`Follow-up postponed for ${days === 1 ? "tomorrow" : `${days} days`}.`);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to postpone follow-up."
      );
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="studio-surface studio-glow overflow-hidden rounded-3xl border border-primary/15 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-lg shadow-red-500/20">
              <BellRing className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Daily Follow-up Center
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                One staff-controlled list for renewals, fees, enquiries, trials,
                and birthdays. Messages open in WhatsApp for your review before
                they are sent.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full lg:w-auto"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Open Follow-ups"
          value={summary.open}
          detail="Ready for staff action"
          icon={<BellRing />}
          className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-950"
        />
        <SummaryCard
          label="Urgent"
          value={summary.urgent}
          detail="Past their due date"
          icon={<Clock3 />}
          className="border-rose-200 bg-gradient-to-br from-rose-50 to-red-50 text-rose-950"
        />
        <SummaryCard
          label="Due Today"
          value={summary.today}
          detail="Scheduled for today"
          icon={<CalendarClock />}
          className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950"
        />
        <SummaryCard
          label="Postponed"
          value={summary.postponed}
          detail="Waiting until a later date"
          icon={<ChevronRight />}
          className="border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-950"
        />
      </div>

      <section className="rounded-2xl border bg-background/95 p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
          <label className="relative">
            <span className="sr-only">Search follow-ups</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, or follow-up..."
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as FollowUpType | "All")
            }
            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Types</option>
            {FOLLOW_UP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="Open">Open</option>
            <option value="Postponed">Postponed</option>
            <option value="Completed">Completed</option>
            <option value="All">All Statuses</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredFollowUps.length}</span>{" "}
          {filteredFollowUps.length === 1 ? "follow-up" : "follow-ups"}.
        </p>
      </section>

      {loading && followUps.length === 0 ? (
        <div className="rounded-2xl border bg-background p-12 text-center text-sm text-muted-foreground">
          Loading today&apos;s priorities…
        </div>
      ) : filteredFollowUps.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background/80 p-12 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
          <h2 className="mt-3 font-bold">Nothing in this view</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your selected follow-up list is clear.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredFollowUps.map((followUp) => {
            const style = typeStyles[followUp.type];
            const status = effectiveStatus(followUp);
            const isSaving = savingKey === followUp.key;

            return (
              <article
                key={followUp.key}
                className={`rounded-2xl border border-l-4 bg-background/95 p-5 shadow-sm ${style.border}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold [&_svg]:size-3.5 ${style.badge}`}
                      >
                        {style.icon}
                        {followUp.type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          followUp.priority === "Urgent"
                            ? "bg-red-100 text-red-800"
                            : followUp.priority === "Today"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-cyan-100 text-cyan-800"
                        }`}
                      >
                        {followUp.priority}
                      </span>
                      {status !== "Open" && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {status}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-lg font-bold">{followUp.name}</h2>
                    <p className="mt-1 font-semibold">{followUp.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {followUp.detail}
                    </p>
                    {status === "Postponed" && followUp.postponedUntil && (
                      <p className="mt-2 text-xs font-semibold text-violet-700">
                        Returns to Open on {formatDate(followUp.postponedUntil)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4 [&>*]:min-h-11 sm:flex sm:flex-wrap md:[&>*]:min-h-8">
                  {status === "Open" && followUp.whatsappUrl && (
                    <Button
                      type="button"
                      onClick={() =>
                        window.open(
                          followUp.whatsappUrl!,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <MessageCircle />
                      Review in WhatsApp
                    </Button>
                  )}
                  <Link
                    href={followUp.manageHref}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <ExternalLink />
                    Manage
                  </Link>
                  {status === "Open" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => void postponeFollowUp(followUp, 1)}
                      >
                        Tomorrow
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => void postponeFollowUp(followUp, 7)}
                      >
                        1 Week
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving}
                        onClick={() => void completeFollowUp(followUp)}
                      >
                        <CheckCircle2 />
                        Complete
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
