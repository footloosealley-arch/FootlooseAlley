"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  History,
  MessageCircle,
  PhoneOff,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getWhatsAppUrl,
  whatsappService,
  type WhatsAppCommunicationData,
  type WhatsAppMessageCategory,
  type WhatsAppQueueItem,
} from "@/services/whatsapp.service";

const CATEGORIES: Array<WhatsAppMessageCategory | "All"> = [
  "All",
  "Fee Due",
  "Renewal",
  "Trial",
  "Attendance",
  "Birthday",
  "Enquiry",
];

function priorityClasses(priority: WhatsAppQueueItem["priority"]): string {
  if (priority === "Urgent") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "Today") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function categoryClasses(category: WhatsAppMessageCategory): string {
  if (category === "Fee Due") return "bg-red-100 text-red-700";
  if (category === "Renewal") return "bg-violet-100 text-violet-700";
  if (category === "Trial") return "bg-cyan-100 text-cyan-700";
  if (category === "Attendance") return "bg-orange-100 text-orange-700";
  if (category === "Birthday") return "bg-pink-100 text-pink-700";
  return "bg-slate-100 text-slate-700";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppCommunicationCenter() {
  const [data, setData] = useState<WhatsAppCommunicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<WhatsAppMessageCategory | "All">("All");
  const [selected, setSelected] = useState<WhatsAppQueueItem | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"Queue" | "History">("Queue");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await whatsappService.getCommunicationData());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load messages.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.queue ?? []).filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesSearch =
        !query ||
        [item.name, item.phone, item.reason, item.category]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, data?.queue, search]);

  function openPreview(item: WhatsAppQueueItem) {
    if (!item.validPhone) {
      toast.error("Add a valid 10-digit Indian phone number before messaging.");
      return;
    }
    setSelected(item);
    setMessage(item.template);
  }

  async function openWhatsApp() {
    if (!selected || !message.trim()) return;
    setSending(true);

    const popup = window.open(
      getWhatsAppUrl(selected.phone, message.trim()),
      "_blank",
      "noopener,noreferrer"
    );

    if (!popup) {
      toast.error("WhatsApp was blocked. Please allow pop-ups and try again.");
      setSending(false);
      return;
    }

    try {
      await whatsappService.logCommunication(selected, message.trim());
      toast.success("Opened in WhatsApp and added to communication history.");
      setSelected(null);
      setMessage("");
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "WhatsApp opened, but the communication log could not be saved."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            WhatsApp Communication Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review reminders, personalise messages, and contact students from one queue.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Messages Waiting"
          value={data?.summary.total ?? 0}
          subtitle="All pending reminders"
          icon={<MessageCircle className="h-5 w-5" />}
          tone="bg-green-100 text-green-700"
        />
        <StatCard
          title="Urgent"
          value={data?.summary.urgent ?? 0}
          subtitle="Overdue follow-ups"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="bg-red-100 text-red-700"
        />
        <StatCard
          title="Due Today"
          value={data?.summary.dueToday ?? 0}
          subtitle="Contact today"
          icon={<Clock3 className="h-5 w-5" />}
          tone="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Sent Today"
          value={data?.summary.sentToday ?? 0}
          subtitle="Opened in WhatsApp"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Invalid Phones"
          value={data?.summary.invalidPhones ?? 0}
          subtitle="Numbers to correct"
          icon={<PhoneOff className="h-5 w-5" />}
          tone="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab("Queue")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === "Queue" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Message Queue
            </button>
            <button
              type="button"
              onClick={() => setTab("History")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === "History" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Communication History
            </button>
          </div>

          {tab === "Queue" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, phone or reason"
                  className="pl-9"
                />
              </div>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as WhatsAppMessageCategory | "All")
                }
                className="h-10 rounded-lg border bg-background px-3 text-sm"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All message types" : item}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading communication center...
          </div>
        ) : tab === "Queue" ? (
          filteredQueue.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 font-semibold">Message queue is clear</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No reminders match the current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClasses(item.category)}`}>
                        {item.category}
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(item.priority)}`}>
                        {item.priority}
                      </span>
                      {!item.validPhone && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Invalid phone
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.phone || "No phone number"} · {item.recipientType}
                    </p>
                  </div>
                  <Button
                    onClick={() => openPreview(item)}
                    disabled={!item.validPhone}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Preview Message
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : (data?.history.length ?? 0) === 0 ? (
          <div className="p-12 text-center">
            <History className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No communication history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages opened from this center will be recorded here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data?.history.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.recipient_name}</p>
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.phone} · {item.recipient_type}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm">{item.message}</p>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(item.sent_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Preview WhatsApp Message</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  To {selected.name} · {selected.phone}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClasses(selected.category)}`}>
                {selected.category}
              </span>
            </div>

            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-5 min-h-44"
              maxLength={1200}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Edit the message before opening WhatsApp.</span>
              <span>{message.length}/1200</span>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setMessage("");
                }}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void openWhatsApp()}
                disabled={sending || !message.trim()}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                {sending ? "Opening..." : "Open in WhatsApp"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
