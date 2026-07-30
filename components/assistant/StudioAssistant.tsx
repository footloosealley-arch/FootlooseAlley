"use client";

import Link from "next/link";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarCheck,
  ExternalLink,
  IndianRupee,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck,
  UserRoundSearch,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageDraftAssistant from "@/components/assistant/MessageDraftAssistant";
import {
  assistantService,
  type AssistantAnswer,
  type AssistantInsight,
  type AssistantPriority,
  type AssistantSnapshot,
} from "@/services/assistant.service";
import { getWhatsAppUrl } from "@/services/whatsapp.service";

const SUGGESTED_QUESTIONS = [
  "Who has fees overdue?",
  "Which students have missed classes?",
  "Which memberships are expiring?",
  "Who should I contact today?",
  "What trials are coming up?",
  "How much revenue did we collect this month?",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function priorityClasses(priority: AssistantPriority): string {
  if (priority === "Critical") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "High") return "border-orange-200 bg-orange-50 text-orange-700";
  if (priority === "Medium") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function InsightIcon({ insight }: { insight: AssistantInsight }) {
  const iconClass = "h-5 w-5";
  if (insight.type === "Fee Risk") return <IndianRupee className={iconClass} />;
  if (insight.type === "Attendance") return <UserCheck className={iconClass} />;
  if (insight.type === "Renewal") return <CalendarCheck className={iconClass} />;
  if (insight.type === "Enquiry") return <UserRoundSearch className={iconClass} />;
  if (insight.type === "Trial") return <Sparkles className={iconClass} />;
  if (insight.type === "Revenue") return <IndianRupee className={iconClass} />;
  return <Lightbulb className={iconClass} />;
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export default function StudioAssistant() {
  const [snapshot, setSnapshot] = useState<AssistantSnapshot | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);

  const commitSnapshot = useCallback((result: AssistantSnapshot) => {
    setSnapshot(result);
    setAnswer(null);
  }, []);
  const handleSnapshotError = useCallback((error: unknown) => {
    toast.error(error instanceof Error ? error.message : "Unable to load the assistant.");
    setSnapshot(null);
  }, []);
  const { loading, refresh: loadSnapshot } = useLatestAsync({
    fetchData: assistantService.getSnapshot,
    onSuccess: commitSnapshot,
    onError: handleSnapshotError,
  });

  function ask(value = question) {
    if (!snapshot || !value.trim()) return;
    setQuestion(value);
    setAnswer(assistantService.answerQuestion(value, snapshot));
  }

  const criticalCount = useMemo(
    () =>
      snapshot?.insights.filter(
        (insight) => insight.priority === "Critical" || insight.priority === "High"
      ).length ?? 0,
    [snapshot]
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-100 via-background to-cyan-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  AI Studio Assistant
                </h1>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Live studio data
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                {getGreeting()} — your Footloose Alley priorities and opportunities are ready.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => void loadSnapshot()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh insights
          </Button>
        </div>

        {!loading && snapshot && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border bg-background/80 p-4 backdrop-blur">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
            <div>
              <p className="font-semibold">Today’s briefing</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {snapshot.greetingSummary}
              </p>
            </div>
          </div>
        )}
      </div>

      <MessageDraftAssistant />

      {loading ? (
        <div className="rounded-2xl border p-12 text-center text-sm text-muted-foreground">
          Analysing your studio data...
        </div>
      ) : !snapshot ? (
        <div className="rounded-2xl border p-12 text-center text-sm text-muted-foreground">
          The studio assistant could not load.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Revenue Today"
              value={formatCurrency(snapshot.metrics.revenueToday)}
              subtitle={`${formatCurrency(snapshot.metrics.revenueMonth)} this month`}
            />
            <MetricCard
              title="Present Today"
              value={snapshot.metrics.presentToday}
              subtitle="Students checked in"
            />
            <MetricCard
              title="Trials Today"
              value={snapshot.metrics.trialsToday}
              subtitle="Conversion opportunities"
            />
            <MetricCard
              title="Priority Alerts"
              value={criticalCount}
              subtitle={`${formatCurrency(snapshot.metrics.overdueFeeAmount)} overdue`}
            />
          </div>

          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Ask about your studio</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask naturally about fees, attendance, renewals, enquiries, trials, or revenue.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") ask();
                }}
                placeholder="Example: Who should I contact today?"
                className="h-11"
              />
              <Button onClick={() => ask()} disabled={!question.trim()}>
                <Send className="h-4 w-4" />
                Ask Assistant
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => ask(item)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-violet-300 hover:bg-violet-50"
                >
                  {item}
                </button>
              ))}
            </div>

            {answer && (
              <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{answer.title}</h3>
                    <p className="mt-1 text-sm">{answer.answer}</p>

                    {answer.people.length > 0 && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {answer.people.slice(0, 8).map((person) => (
                          <Link
                            key={`${answer.title}-${person.id}`}
                            href={person.href}
                            className="rounded-xl border bg-background p-3 transition hover:bg-muted/40"
                          >
                            <p className="truncate text-sm font-semibold">{person.name}</p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {person.detail}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}

                    {answer.href && answer.hrefLabel && (
                      <Link
                        href={answer.href}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
                      >
                        {answer.hrefLabel}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Recommended Actions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ranked automatically using your live studio records.
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                {snapshot.insights.length} insights
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {snapshot.insights.map((insight) => (
                <div key={insight.id} className="rounded-2xl border bg-background p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${priorityClasses(insight.priority)}`}
                    >
                      <InsightIcon insight={insight} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(insight.priority)}`}
                        >
                          {insight.priority}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {insight.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {insight.phone && insight.suggestedMessage && (
                      <a
                        href={getWhatsAppUrl(insight.phone, insight.suggestedMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Suggested WhatsApp
                      </a>
                    )}
                    <Link
                      href={insight.href}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                    >
                      {insight.actionLabel}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">
                Complete critical and high-priority actions first. Refresh the assistant
                after updating payments, attendance, enquiries, or memberships.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
