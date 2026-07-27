<<<<<<< HEAD
import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";

import type { Student } from "@/types/database";

interface BirthdayCardProps {
  birthdays: Student[];
}

export default function BirthdayCard({
  birthdays,
}: BirthdayCardProps) {
  return (
    <WidgetCard
      title="Today's Birthdays"
      description="Celebrate your students"
    >
      {birthdays.length === 0 ? (
        <EmptyState
          title="No Birthdays Today"
          description="There are no student birthdays today."
        />
      ) : (
        <div className="space-y-3">
          {birthdays.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {student.Name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {student.Phone}
                </p>
              </div>

              <div className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
                🎂 Birthday
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
=======
"use client";

import { Cake, Gift } from "lucide-react";
import Link from "next/link";
import type { Student } from "@/types/student";

type BirthdayCardProps = {
  students: Student[];
};

function formatBirthday(date: string) {
  const birthday = new Date(date);

  return birthday.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function BirthdayCard({
  students,
}: BirthdayCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-pink-100 p-3">
            <Cake className="h-6 w-6 text-pink-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Upcoming Birthdays
            </h2>

            <p className="text-sm text-slate-500">
              Celebrate your students 🎉
            </p>
          </div>
        </div>

        <Gift className="h-5 w-5 text-pink-500" />
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Cake className="mx-auto mb-3 h-10 w-10 text-slate-300" />

          <p className="font-medium text-slate-600">
            No upcoming birthdays
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Student birthdays will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.slice(0, 5).map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-pink-50"
            >
              <div>
                <p className="font-semibold">
                  {student.Name}
                </p>

                <p className="text-sm text-slate-500">
                  {student.Program ?? "Member"}
                </p>
              </div>

              <div className="rounded-lg bg-pink-100 px-3 py-2 text-sm font-semibold text-pink-700">
                {student.date_of_birth
                  ? formatBirthday(
                      student.date_of_birth
                    )
                  : "--"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
