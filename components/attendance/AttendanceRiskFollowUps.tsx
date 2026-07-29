"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import {
  attendanceAddDays,
  attendanceIntelligenceService,
  attendanceLocalDate,
  type AttendanceRisk,
  type AttendanceRiskReason,
} from "@/services/attendance-intelligence.service";

type RiskStatus = "Open" | "Postponed" | "Completed";
type StatusFilter = RiskStatus | "All";

function effectiveStatus(risk: AttendanceRisk): RiskStatus {
  if (risk.actionStatus === "Completed") return "Completed";
  if (
    risk.actionStatus === "Postponed" &&
    risk.postponedUntil &&
    risk.postponedUntil > attendanceLocalDate()
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

const reasonStyles: Record<AttendanceRiskReason, string> = {
  "No Recent Attendance": "bg-rose-100 text-rose-800",
  "Consecutive Absences": "bg-orange-100 text-orange-800",
  "Low Attendance": "bg-amber-100 text-amber-800",
};

export default function AttendanceRiskFollowUps() {
  const [risks, setRisks] = useState<AttendanceRisk[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Open");
  const [reasonFilter, setReasonFilter] = useState<
    AttendanceRiskReason | "All"
  >("All");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchRisks = useCallback(
    () => attendanceIntelligenceService.getRisks(),
    []
  );
  const handleSuccess = useCallback((result: AttendanceRisk[]) => {
    setRisks(result);
  }, []);
  const handleError = useCallback((error: unknown) => {
    toast.error(
      error instanceof Error
        ? error.message
        : "Unable to load attendance follow-ups."
    );
    setRisks([]);
  }, []);
  const { loading, refresh } = useLatestAsync({
    fetchData: fetchRisks,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const summary = useMemo(() => {
    const open = risks.filter((risk) => effectiveStatus(risk) === "Open");
    return {
      open: open.length,
      urgent: open.filter((risk) => risk.priority === "Urgent").length,
      sevenDays: open.filter(
        (risk) => risk.reason === "No Recent Attendance"
      ).length,
      lowRate: open.filter((risk) => risk.reason === "Low Attendance").length,
    };
  }, [risks]);

  const filteredRisks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return risks.filter((risk) => {
      const matchesStatus =
        statusFilter === "All" || effectiveStatus(risk) === statusFilter;
      const matchesReason =
        reasonFilter === "All" || risk.reason === reasonFilter;
      const matchesSearch =
        !query ||
        [risk.name, risk.phone, risk.program, risk.detail]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesStatus && matchesReason && matchesSearch;
    });
  }, [reasonFilter, risks, search, statusFilter]);

  async function completeRisk(risk: AttendanceRisk) {
    setSavingKey(risk.key);
    try {
      await attendanceIntelligenceService.complete(risk);
      toast.success("Attendance follow-up completed.");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to complete follow-up."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function postponeRisk(risk: AttendanceRisk, days: number) {
    setSavingKey(risk.key);
    try {
      await attendanceIntelligenceService.postpone(
        risk,
        attendanceAddDays(attendanceLocalDate(), days)
      );
      toast.success(
        `Attendance follow-up postponed ${
          days === 1 ? "until tomorrow" : "for one week"
        }.`
      );
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
    <section className="studio-surface studio-glow rounded-3xl border border-primary/15 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-3 text-white shadow-lg shadow-rose-500/20">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Attendance Follow-ups
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Actionable alerts for students away seven days, three consecutive
              absences, or attendance below 50% across at least four marked
              classes.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh risks
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Open",
            value: summary.open,
            icon: <AlertTriangle />,
            style: "border-blue-200 bg-blue-50 text-blue-950",
          },
          {
            label: "Urgent",
            value: summary.urgent,
            icon: <Clock3 />,
            style: "border-rose-200 bg-rose-50 text-rose-950",
          },
          {
            label: "Away 7+ Days",
            value: summary.sevenDays,
            icon: <UserRoundX />,
            style: "border-orange-200 bg-orange-50 text-orange-950",
          },
          {
            label: "Below 50%",
            value: summary.lowRate,
            icon: <ShieldAlert />,
            style: "border-amber-200 bg-amber-50 text-amber-950",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-2xl border p-4 ${item.style}`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-black">{item.value}</p>
            </div>
            <div className="rounded-xl bg-white/70 p-2.5 [&_svg]:size-5">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_180px]">
        <label className="relative">
          <span className="sr-only">Search attendance risks</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, phone, or program..."
            className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <select
          value={reasonFilter}
          onChange={(event) =>
            setReasonFilter(event.target.value as AttendanceRiskReason | "All")
          }
          className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="All">All Risk Reasons</option>
          <option value="No Recent Attendance">Away 7+ Days</option>
          <option value="Consecutive Absences">3+ Absences</option>
          <option value="Low Attendance">Below 50%</option>
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

      <div className="mt-5 space-y-3">
        {loading && risks.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Loading attendance risks…
          </div>
        ) : filteredRisks.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <CheckCircle2 className="mx-auto size-9 text-emerald-600" />
            <p className="mt-2 font-bold">No attendance risks in this view</p>
          </div>
        ) : (
          filteredRisks.map((risk) => {
            const status = effectiveStatus(risk);
            const isSaving = savingKey === risk.key;

            return (
              <article
                key={risk.key}
                className="rounded-2xl border bg-background/95 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${reasonStyles[risk.reason]}`}
                      >
                        {risk.reason}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          risk.priority === "Urgent"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {risk.priority}
                      </span>
                      {status !== "Open" && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {status}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-bold">{risk.name}</h3>
                    <p className="text-sm text-muted-foreground">{risk.detail}</p>
                    {status === "Postponed" && risk.postponedUntil && (
                      <p className="mt-1 text-xs font-semibold text-violet-700">
                        Returns on {formatDate(risk.postponedUntil)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {status === "Open" && risk.whatsappUrl && (
                      <Button
                        type="button"
                        onClick={() =>
                          window.open(
                            risk.whatsappUrl!,
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
                      href={`/students/${risk.studentId}`}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <ExternalLink />
                      Student
                    </Link>
                    {status === "Open" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving}
                          onClick={() => void postponeRisk(risk, 1)}
                        >
                          Tomorrow
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving}
                          onClick={() => void postponeRisk(risk, 7)}
                        >
                          1 Week
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isSaving}
                          onClick={() => void completeRisk(risk)}
                        >
                          <CheckCircle2 />
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
