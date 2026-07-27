import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  BadgeIndianRupee,
  UserCog,
  BarChart3,
  PartyPopper,
  Settings,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Enquiries",
    href: "/enquiries",
    icon: UserPlus,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Classes",
    href: "/classes",
    icon: CalendarDays,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: BadgeIndianRupee,
  },
  {
    title: "Memberships",
    href: "/fee-dues",
    icon: CreditCard,
  },
  {
    title: "Instructors",
    href: "/instructors",
    icon: UserCog,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Events",
    href: "/events",
    icon: PartyPopper,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];