"use client";

import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  CalendarCheck,
  Pencil,
} from "lucide-react";

type Props = {
  studentId: number;
  phone: string;
  email: string;
};

export default function QuickActions({
  studentId,
  phone,
  email,
}: Props) {
  const cleanPhone = phone.replace(/\D/g, "");

  const actions = [
    {
      href: `tel:${cleanPhone}`,
      label: "Call",
      icon: Phone,
      color: "text-green-600",
      external: true,
      enabled: cleanPhone.length > 0,
    },
    {
      href: `https://wa.me/91${cleanPhone}`,
      label: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-500",
      external: true,
      enabled: cleanPhone.length > 0,
    },
    {
      href: email ? `mailto:${email}` : "#",
      label: "Email",
      icon: Mail,
      color: "text-blue-600",
      external: true,
      enabled: email.trim().length > 0,
    },
    {
      href: `/payments?student=${studentId}`,
      label: "Payment",
      icon: CreditCard,
      color: "text-indigo-600",
      external: false,
      enabled: true,
    },
    {
      href: `/attendance?student=${studentId}`,
      label: "Attendance",
      icon: CalendarCheck,
      color: "text-orange-600",
      external: false,
      enabled: true,
    },
    {
      href: `/students?edit=${studentId}`,
      label: "Edit",
      icon: Pencil,
      color: "text-slate-700",
      external: false,
      enabled: true,
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-lg">
      <h2 className="mb-5 text-xl font-bold text-slate-800">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => {
          const Icon = action.icon;

          if (action.external) {
            return (
              <a
                key={action.label}
                href={action.enabled ? action.href : undefined}
                target={action.label === "WhatsApp" ? "_blank" : undefined}
                rel={
                  action.label === "WhatsApp"
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`flex flex-col items-center rounded-xl border p-4 transition ${
                  action.enabled
                    ? "hover:bg-slate-50"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <Icon className={`mb-2 h-6 w-6 ${action.color}`} />
                <span className="text-sm font-medium">
                  {action.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center rounded-xl border p-4 transition hover:bg-slate-50"
            >
              <Icon className={`mb-2 h-6 w-6 ${action.color}`} />
              <span className="text-sm font-medium">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}