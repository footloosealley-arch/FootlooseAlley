"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AttendanceTrendPoint = {
  date: string;
  label: string;
  present: number;
  absent: number;
  leave: number;
};

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[];
}

export default function AttendanceTrendChart({
  data,
}: AttendanceTrendChartProps) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Weekly Attendance Trend
        </h2>
        <p className="text-sm text-muted-foreground">
          Present, absent, and leave entries for the last seven days.
        </p>
      </div>

      <div className="mt-5 h-72 w-full">
        {data.some(
          (item) =>
            item.present > 0 || item.absent > 0 || item.leave > 0
        ) ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Line
                type="monotone"
                dataKey="present"
                stroke="currentColor"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="leave"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="2 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No attendance data is available for the last seven days.
          </div>
        )}
      </div>
    </section>
  );
}
