import Link from "next/link";
import {
  UserPlus,
  CreditCard,
  CalendarCheck,
  PhoneCall,
  CalendarDays,
  BarChart3,
  PartyPopper,
  Settings,
} from "lucide-react";

const actions = [
  {
    title: "Add Student",
    description: "Register a new student",
    href: "/students",
    icon: UserPlus,
    color: "bg-purple-600",
  },
  {
    title: "Record Payment",
    description: "Update fee payment",
    href: "/payments",
    icon: CreditCard,
    color: "bg-green-600",
  },
  {
    title: "Attendance",
    description: "Mark today's attendance",
    href: "/attendance",
    icon: CalendarCheck,
    color: "bg-blue-600",
  },
  {
    title: "Enquiries",
    description: "Follow up new leads",
    href: "/enquiries",
    icon: PhoneCall,
    color: "bg-orange-500",
  },
  {
    title: "Schedule",
    description: "Manage class timings",
    href: "/schedule",
    icon: CalendarDays,
    color: "bg-cyan-600",
  },
  {
    title: "Reports",
    description: "View analytics",
    href: "/reports",
    icon: BarChart3,
    color: "bg-indigo-600",
  },
  {
    title: "Events",
    description: "Manage studio events",
    href: "/events",
    icon: PartyPopper,
    color: "bg-pink-600",
  },
  {
    title: "Settings",
    description: "Studio preferences",
    href: "/settings",
    icon: Settings,
    color: "bg-slate-700",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            ⚡ Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Frequently used shortcuts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl"
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md ${action.color}`}
              >
                <Icon size={30} />
              </div>

              <h3 className="mt-5 text-center text-lg font-semibold text-gray-800 transition group-hover:text-purple-600">
                {action.title}
              </h3>

              <p className="mt-2 text-center text-sm text-gray-500">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}