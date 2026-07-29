"use client";

import Link from "next/link";

import {
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  IndianRupee,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import WidgetCard from "./WidgetCard";

type Action = {
  title: string;
  description: string;
  href: string;
  icon: typeof Users;
  tone: string;
};

const actions: Action[] = [
  {
    title: "Find Student",
    description:
      "Search profiles and membership status",
    href: "/students",
    icon: Search,
    tone: "from-rose-500 to-red-600",
  },
  {
    title: "Add Walk-in Enquiry",
    description:
      "Open the enquiry follow-up centre",
    href: "/enquiries",
    icon: UserPlus,
    tone: "from-violet-500 to-fuchsia-600",
  },
  {
    title: "Student Check-in",
    description:
      "Record today's class attendance",
    href: "/attendance",
    icon: ClipboardCheck,
    tone: "from-emerald-500 to-teal-600",
  },
  {
    title: "Collect Payment",
    description:
      "Receive and record membership fees",
    href: "/payments",
    icon: IndianRupee,
    tone: "from-blue-500 to-cyan-600",
  },
  {
    title: "Follow Up Fee Due",
    description:
      "Follow up pending membership fees",
    href: "/fee-dues",
    icon: CircleDollarSign,
    tone: "from-amber-500 to-orange-600",
  },
  {
    title: "Manage Today’s Trials",
    description:
      "Update trial attendance and outcome",
    href: "/trials",
    icon: CalendarCheck,
    tone: "from-pink-500 to-rose-600",
  },
];

export default function QuickActions() {
  return (
    <WidgetCard
      title="Quick Actions"
      description="Frequently used studio shortcuts"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl border bg-gradient-to-br from-white to-muted/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition group-hover:scale-110 ${action.tone}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-medium">
                  {action.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </WidgetCard>
  );
}
