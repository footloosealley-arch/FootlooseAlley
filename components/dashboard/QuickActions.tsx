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
};

const actions: Action[] = [
  {
    title: "Find Student",
    description:
      "Search profiles and membership status",
    href: "/students",
    icon: Search,
  },
  {
    title: "Add Walk-in Enquiry",
    description:
      "Open the enquiry follow-up centre",
    href: "/enquiries",
    icon: UserPlus,
  },
  {
    title: "Student Check-in",
    description:
      "Record today's class attendance",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Collect Payment",
    description:
      "Receive and record membership fees",
    href: "/payments",
    icon: IndianRupee,
  },
  {
    title: "Follow Up Fee Due",
    description:
      "Follow up pending membership fees",
    href: "/fee-dues",
    icon: CircleDollarSign,
  },
  {
    title: "Manage Today’s Trials",
    description:
      "Update trial attendance and outcome",
    href: "/trials",
    icon: CalendarCheck,
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
              className="group flex items-start gap-3 rounded-xl border p-4 transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
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
