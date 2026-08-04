import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  BadgeIndianRupee,
  UserCog,
  BarChart3,
  PartyPopper,
  Settings,
  MessageCircle,
  Bot,
  BellRing,
  Cake,
  WalletCards,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const navigation: NavigationItem[] = [
  {
    title: "Reception",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Birthdays",
    href: "/birthdays",
    icon: Cake,
  },
  {
    title: "Enquiries",
    href: "/enquiries",
    icon: UserPlus,
  },
  {
    title: "Trials",
    href: "/trials",
    icon: ClipboardList,
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
    title: "Expenses",
    href: "/expenses",
    icon: WalletCards,
  },
  {
    title: "Memberships",
    href: "/memberships",
    icon: CreditCard,
  },
  {
    title: "Follow-ups",
    href: "/follow-ups",
    icon: BellRing,
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    icon: MessageCircle,
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
    title: "AI Assistant",
    href: "/assistant",
    icon: Bot,
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
