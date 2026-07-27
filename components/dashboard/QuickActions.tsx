"use client";

import Link from "next/link";

import WidgetCard from "./WidgetCard";

type Action = {
  title: string;
  description: string;
  href: string;
};

const actions: Action[] = [
  {
    title: "Add Student",
    description: "Register a new student",
    href: "/students/new",
  },
  {
    title: "New Enquiry",
    description: "Create a new enquiry",
    href: "/enquiries/new",
  },
  {
    title: "Mark Attendance",
    description: "Record today's attendance",
    href: "/attendance",
  },
  {
    title: "Collect Payment",
    description: "Receive membership fees",
    href: "/payments/new",
  },
  {
    title: "Classes",
    description: "Manage classes",
    href: "/classes",
  },
  {
    title: "Schedule",
    description: "View class schedule",
    href: "/schedule",
  },
];

export default function QuickActions() {
  return (
    <WidgetCard
      title="Quick Actions"
      description="Frequently used shortcuts"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="
              rounded-lg
              border
              p-4
              transition-all
              hover:border-primary
              hover:bg-muted/40
              hover:shadow-sm
            "
          >
            <h3 className="font-medium">
              {action.title}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </WidgetCard>
  );
}