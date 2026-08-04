"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auditLogService, type AuditLogEntry } from "@/services/audit-log.service";

const labels: Record<string, string> = {
  Students: "Student",
  Enquiries: "Enquiry",
  Payments: "Membership payment",
  Events: "Event",
  Event_Registrations: "Event registration",
  Event_Refunds: "Event refund",
  Event_Expenses: "Event expense",
  Instructors: "Instructor",
  Instructor_Sessions: "Instructor session",
  Instructor_Payments: "Instructor payment",
  Studio_Expenses: "Studio expense",
  Cash_Reconciliations: "Cash reconciliation",
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await auditLogService.getRecent());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load audit history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) =>
      `${labels[entry.table_name] ?? entry.table_name} ${entry.action} ${entry.record_id ?? ""}`
        .toLowerCase()
        .includes(needle)
    );
  }, [entries, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Administrator-only history of important studio, payment and finance changes."
        action={<Button type="button" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} />Refresh</Button>}
      />
      <div className="rounded-2xl border bg-card p-4">
        <label className="relative block max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search action, record or section" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="divide-y">
          {filtered.map((entry) => (
            <article key={entry.id} className="flex items-start gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{labels[entry.table_name] ?? entry.table_name}</strong>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.action === "DELETE" ? "bg-red-100 text-red-700" : entry.action === "INSERT" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{entry.action}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Record {entry.record_id ?? "unknown"} · {new Date(entry.changed_at).toLocaleString("en-IN")}</p>
              </div>
            </article>
          ))}
          {!loading && filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No matching audit activity.</p>}
        </div>
      </section>
    </div>
  );
}
