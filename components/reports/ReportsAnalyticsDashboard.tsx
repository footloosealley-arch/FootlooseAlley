"use client";

import { useCallback, useMemo, useState } from "react";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import {
  BarChart3,
  CalendarDays,
  Download,
  IndianRupee,
  Printer,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reportsService,
  type ReportBreakdownPoint,
  type ReportDateRange,
  type ReportsData,
} from "@/services/reports.service";

type RangePreset = "7 Days" | "30 Days" | "This Month" | "3 Months" | "Custom";

const CHART_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#64748b",
];

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

function getPresetRange(preset: RangePreset): ReportDateRange {
  const today = getLocalDateString();
  const date = new Date();
  if (preset === "7 Days") return { startDate: addDays(today, -6), endDate: today };
  if (preset === "30 Days") return { startDate: addDays(today, -29), endDate: today };
  if (preset === "3 Months") return { startDate: addDays(today, -89), endDate: today };
  return {
    startDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`,
    endDate: today,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 h-72">{children}</div>
    </div>
  );
}

function BreakdownList({
  data,
  formatValue = (value) => String(value),
}: {
  data: ReportBreakdownPoint[];
  formatValue?: (value: number) => string;
}) {
  const maximum = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No data in this period.</p>
      ) : (
        data.map((item, index) => (
          <div key={item.name}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatValue(item.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((item.value / maximum) * 100, 2)}%`,
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function csvEscape(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function ReportsAnalyticsDashboard() {
  const [preset, setPreset] = useState<RangePreset>("30 Days");
  const [range, setRange] = useState<ReportDateRange>(() => getPresetRange("30 Days"));
  const [data, setData] = useState<ReportsData | null>(null);

  const fetchReports = useCallback(async () => {
    if (!range.startDate || !range.endDate || range.startDate > range.endDate) {
      throw new Error("Choose a valid report date range.");
    }
    return reportsService.getReportsData(range);
  }, [range]);
  const commitReports = useCallback((result: ReportsData) => setData(result), []);
  const handleReportsError = useCallback((error: unknown) => {
    toast.error(error instanceof Error ? error.message : "Unable to load reports.");
    setData(null);
  }, []);
  const reportRefreshKey =
    `${range.startDate.length}:${range.startDate}|${range.endDate.length}:${range.endDate}`;
  const { loading, refresh: loadReports } = useLatestAsync({
    fetchData: fetchReports,
    onSuccess: commitReports,
    onError: handleReportsError,
    refreshKey: reportRefreshKey,
  });

  function selectPreset(value: RangePreset) {
    setPreset(value);
    if (value !== "Custom") setRange(getPresetRange(value));
  }

  function exportCsv() {
    if (!data) return;
    const rows: Array<Array<string | number>> = [
      ["Footloose Alley Reports & Analytics"],
      ["Start Date", data.range.startDate],
      ["End Date", data.range.endDate],
      [],
      ["Summary Metric", "Value"],
      ["Revenue", data.summary.revenue],
      ["Payment Count", data.summary.paymentCount],
      ["Average Payment", data.summary.averagePayment],
      ["Attendance", data.summary.attendance],
      ["Active Students", data.summary.activeStudents],
      ["New Students", data.summary.newStudents],
      ["Enquiries", data.summary.enquiries],
      ["Converted Enquiries", data.summary.convertedEnquiries],
      ["Enquiry Conversion Rate", `${data.summary.enquiryConversionRate}%`],
      ["Trials", data.summary.trials],
      ["Trials Attended", data.summary.trialsAttended],
      ["Trial Conversion Rate", `${data.summary.trialConversionRate}%`],
      ["Outstanding Fees", data.summary.outstandingFees],
      ["Overdue Fees", data.summary.overdueFees],
      ["Renewals Due", data.summary.renewalsDue],
      [],
      ["Daily Trend"],
      ["Date", "Revenue", "Attendance", "Enquiries"],
      ...data.trend.map((item) => [
        item.date,
        item.revenue,
        item.attendance,
        item.enquiries,
      ]),
      [],
      ["Payment Methods"],
      ["Method", "Revenue"],
      ...data.paymentMethods.map((item) => [item.name, item.value]),
      [],
      ["Membership Plans"],
      ["Plan", "Students"],
      ...data.membershipPlans.map((item) => [item.name, item.value]),
      [],
      ["Enquiry Status"],
      ["Status", "Count"],
      ...data.enquiryStatuses.map((item) => [item.name, item.value]),
      [],
      ["Trial Outcomes"],
      ["Outcome", "Count"],
      ...data.trialOutcomes.map((item) => [item.name, item.value]),
    ];

    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `footloose-alley-report-${data.range.startDate}-to-${data.range.endDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV report downloaded.");
  }

  const compactTrend = useMemo(() => {
    if (!data || data.trend.length <= 45) return data?.trend ?? [];
    const step = Math.ceil(data.trend.length / 45);
    return data.trend.filter((_, index) => index % step === 0 || index === data.trend.length - 1);
  }, [data]);

  return (
    <div className="space-y-6 print:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue, attendance, memberships, enquiries, trials, and fee performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={!data}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => void loadReports()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium">Report period</p>
            <div className="flex flex-wrap gap-2">
              {(["7 Days", "30 Days", "This Month", "3 Months", "Custom"] as RangePreset[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectPreset(item)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      preset === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Start date</span>
              <Input
                type="date"
                value={range.startDate}
                onChange={(event) => {
                  setPreset("Custom");
                  setRange((current) => ({ ...current, startDate: event.target.value }));
                }}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">End date</span>
              <Input
                type="date"
                value={range.endDate}
                max={getLocalDateString()}
                onChange={(event) => {
                  setPreset("Custom");
                  setRange((current) => ({ ...current, endDate: event.target.value }));
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border p-12 text-center text-sm text-muted-foreground">
          Loading reports and analytics...
        </div>
      ) : !data ? (
        <div className="rounded-2xl border p-12 text-center text-sm text-muted-foreground">
          Reports could not be loaded.
        </div>
      ) : (
        <>
          <div className="hidden print:block">
            <p className="text-sm">
              {data.range.startDate} to {data.range.endDate}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Revenue"
              value={formatCurrency(data.summary.revenue)}
              subtitle={`${data.summary.paymentCount} payments · ${formatCurrency(data.summary.averagePayment)} average`}
              icon={<IndianRupee className="h-5 w-5" />}
              tone="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              title="Attendance"
              value={data.summary.attendance}
              subtitle={`${data.summary.activeStudents} active students`}
              icon={<UserCheck className="h-5 w-5" />}
              tone="bg-blue-100 text-blue-700"
            />
            <SummaryCard
              title="Enquiry Conversion"
              value={`${data.summary.enquiryConversionRate}%`}
              subtitle={`${data.summary.convertedEnquiries} of ${data.summary.enquiries} converted`}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="bg-violet-100 text-violet-700"
            />
            <SummaryCard
              title="Trial Conversion"
              value={`${data.summary.trialConversionRate}%`}
              subtitle={`${data.summary.trialsAttended} attended · ${data.summary.trials} booked`}
              icon={<BarChart3 className="h-5 w-5" />}
              tone="bg-amber-100 text-amber-700"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="New Students"
              value={data.summary.newStudents}
              subtitle="Joined during selected period"
              icon={<Users className="h-5 w-5" />}
              tone="bg-cyan-100 text-cyan-700"
            />
            <SummaryCard
              title="Renewals Due"
              value={data.summary.renewalsDue}
              subtitle="Memberships ending in 30 days"
              icon={<CalendarDays className="h-5 w-5" />}
              tone="bg-orange-100 text-orange-700"
            />
            <SummaryCard
              title="Outstanding Fees"
              value={formatCurrency(data.summary.outstandingFees)}
              subtitle="All open fee dues"
              icon={<IndianRupee className="h-5 w-5" />}
              tone="bg-rose-100 text-rose-700"
            />
            <SummaryCard
              title="Overdue Fees"
              value={formatCurrency(data.summary.overdueFees)}
              subtitle="Requires immediate follow-up"
              icon={<IndianRupee className="h-5 w-5" />}
              tone="bg-red-100 text-red-700"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Revenue Trend" description="Completed payment revenue by day">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compactTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={20} />
                  <YAxis tick={{ fontSize: 11 }} width={55} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Studio Activity" description="Attendance and new enquiries by day">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compactTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={35} />
                  <Tooltip />
                  <Bar dataKey="attendance" name="Attendance" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enquiries" name="Enquiries" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <ChartCard title="Payment Methods" description="Revenue collected by payment method">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentMethods}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {data.paymentMethods.map((item, index) => (
                      <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Membership Plans</h2>
              <p className="mt-1 text-sm text-muted-foreground">Current students by membership plan</p>
              <div className="mt-6">
                <BreakdownList data={data.membershipPlans} />
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Popular Programs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Current students by program</p>
              <div className="mt-6">
                <BreakdownList data={data.topPrograms} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Enquiry Pipeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">Enquiries created in the selected period</p>
              <div className="mt-6">
                <BreakdownList data={data.enquiryStatuses} />
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Trial Outcomes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Trials scheduled in the selected period</p>
              <div className="mt-6">
                <BreakdownList data={data.trialOutcomes} />
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Fee-Due Exposure</h2>
              <p className="mt-1 text-sm text-muted-foreground">Open fee amount by urgency</p>
              <div className="mt-6">
                <BreakdownList data={data.feeDueStatus} formatValue={formatCurrency} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
