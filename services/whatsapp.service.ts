import { supabase } from "@/lib/supabase";

export type WhatsAppMessageCategory =
  | "Fee Due"
  | "Renewal"
  | "Trial"
  | "Attendance"
  | "Birthday"
  | "Enquiry"
  | "Custom";

export type WhatsAppPriority = "Urgent" | "Today" | "Upcoming";

export interface WhatsAppQueueItem {
  id: string;
  recipientType: "Student" | "Enquiry";
  recipientId: number;
  name: string;
  phone: string;
  validPhone: boolean;
  category: WhatsAppMessageCategory;
  priority: WhatsAppPriority;
  reason: string;
  template: string;
  actionDate: string | null;
}

export interface WhatsAppHistoryItem {
  id: number;
  recipient_name: string;
  phone: string;
  recipient_type: string;
  recipient_id: number | null;
  category: string;
  message: string;
  status: string;
  sent_at: string;
}

export interface WhatsAppCommunicationData {
  queue: WhatsAppQueueItem[];
  history: WhatsAppHistoryItem[];
  summary: {
    total: number;
    urgent: number;
    dueToday: number;
    invalidPhones: number;
    sentToday: number;
  };
}

interface StudentRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  membership_plan: string | null;
  membership_end_date: string | null;
  next_due_date: string | null;
  date_of_birth: string | null;
  last_attendance: string | null;
  whatsapp_enabled: boolean | null;
}

interface EnquiryRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  Follow_up_date: string | null;
  trial_date: string | null;
  trial_status?: string | null;
}

interface FeeDueRow {
  id: number;
  student_id: number;
  amount_due: number | string | null;
  due_date: string;
  status: string | null;
}

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

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function cleanPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function isValidWhatsAppPhone(phone: string | null | undefined): boolean {
  return cleanPhone(phone).length === 12;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

function isClosedStatus(status: string | null | undefined): boolean {
  const value = status?.trim().toLowerCase() ?? "";
  return ["paid", "waived", "cancelled", "closed", "joined", "converted", "not interested"].includes(value);
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

function priorityOrder(priority: WhatsAppPriority): number {
  if (priority === "Urgent") return 0;
  if (priority === "Today") return 1;
  return 2;
}

class WhatsAppService {
  async getCommunicationData(): Promise<WhatsAppCommunicationData> {
    const [studentsResult, enquiriesResult, feeDuesResult, historyResult] =
      await Promise.all([
        supabase
          .from("Students")
          .select(
            "id,Name,Phone,Program,Status,membership_plan,membership_end_date,next_due_date,date_of_birth,last_attendance,whatsapp_enabled"
          ),
        supabase
          .from("Enquiries")
          .select("id,Name,Phone,Program,Status,Follow_up_date,trial_date,trial_status"),
        supabase
          .from("fee_dues")
          .select("id,student_id,amount_due,due_date,status"),
        supabase
          .from("communication_history")
          .select(
            "id,recipient_name,phone,recipient_type,recipient_id,category,message,status,sent_at"
          )
          .order("sent_at", { ascending: false })
          .limit(50),
      ]);

    if (studentsResult.error) throw studentsResult.error;
    if (enquiriesResult.error) throw enquiriesResult.error;
    if (feeDuesResult.error) throw feeDuesResult.error;

    const students = (studentsResult.data ?? []) as StudentRow[];
    const enquiries = (enquiriesResult.data ?? []) as EnquiryRow[];
    const feeDues = (feeDuesResult.data ?? []) as FeeDueRow[];
    const history = historyResult.error
      ? []
      : ((historyResult.data ?? []) as WhatsAppHistoryItem[]);

    const today = getLocalDateString();
    const inSevenDays = addDays(today, 7);
    const sevenDaysAgo = addDays(today, -7);
    const studentById = new Map(students.map((student) => [Number(student.id), student]));
    const queue: WhatsAppQueueItem[] = [];

    feeDues
      .filter((feeDue) => !isClosedStatus(feeDue.status) && feeDue.due_date <= inSevenDays)
      .forEach((feeDue) => {
        const student = studentById.get(Number(feeDue.student_id));
        if (!student || student.whatsapp_enabled === false) return;
        const name = student.Name?.trim() || `Student #${student.id}`;
        const phone = student.Phone?.trim() || "";
        const amount = Number(feeDue.amount_due ?? 0);
        const overdue = feeDue.due_date < today;
        const dueToday = feeDue.due_date === today;
        queue.push({
          id: `fee-${feeDue.id}`,
          recipientType: "Student",
          recipientId: Number(student.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Fee Due",
          priority: overdue ? "Urgent" : dueToday ? "Today" : "Upcoming",
          reason: overdue
            ? `₹${amount.toLocaleString("en-IN")} overdue since ${formatDate(feeDue.due_date)}`
            : `₹${amount.toLocaleString("en-IN")} due ${dueToday ? "today" : `on ${formatDate(feeDue.due_date)}`}`,
          template: `Hi ${firstName(name)}, this is Footloose Alley Dance & Fitness Studio. A membership fee of ₹${amount.toLocaleString("en-IN")} is ${overdue ? `overdue since ${formatDate(feeDue.due_date)}` : `due on ${formatDate(feeDue.due_date)}`}. Please complete the payment at your earliest convenience. Thank you!`,
          actionDate: feeDue.due_date,
        });
      });

    students
      .filter(
        (student) =>
          student.membership_end_date &&
          student.membership_end_date >= today &&
          student.membership_end_date <= inSevenDays &&
          student.Status !== "Inactive" &&
          student.whatsapp_enabled !== false
      )
      .forEach((student) => {
        const name = student.Name?.trim() || `Student #${student.id}`;
        const phone = student.Phone?.trim() || "";
        queue.push({
          id: `renewal-${student.id}`,
          recipientType: "Student",
          recipientId: Number(student.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Renewal",
          priority: student.membership_end_date === today ? "Today" : "Upcoming",
          reason: `Membership ends ${student.membership_end_date === today ? "today" : formatDate(student.membership_end_date!)}`,
          template: `Hi ${firstName(name)}, your ${student.membership_plan || student.Program || "membership"} at Footloose Alley ends on ${formatDate(student.membership_end_date!)}. Renew now to continue your classes without interruption. Reply to this message and we will help you with the renewal.`,
          actionDate: student.membership_end_date,
        });
      });

    enquiries
      .filter(
        (enquiry) =>
          enquiry.trial_date === today &&
          !["Attended", "Cancelled"].includes(enquiry.trial_status ?? "") &&
          !isClosedStatus(enquiry.Status)
      )
      .forEach((enquiry) => {
        const name = enquiry.Name?.trim() || `Enquiry #${enquiry.id}`;
        const phone = enquiry.Phone?.trim() || "";
        queue.push({
          id: `trial-${enquiry.id}`,
          recipientType: "Enquiry",
          recipientId: Number(enquiry.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Trial",
          priority: "Today",
          reason: `${enquiry.Program || "Trial class"} scheduled today`,
          template: `Hi ${firstName(name)}, this is a friendly reminder about your ${enquiry.Program || "trial class"} at Footloose Alley today. We look forward to welcoming you! Please reply if you need any assistance.`,
          actionDate: enquiry.trial_date,
        });
      });

    enquiries
      .filter(
        (enquiry) =>
          enquiry.Follow_up_date &&
          enquiry.Follow_up_date <= today &&
          !isClosedStatus(enquiry.Status)
      )
      .forEach((enquiry) => {
        const name = enquiry.Name?.trim() || `Enquiry #${enquiry.id}`;
        const phone = enquiry.Phone?.trim() || "";
        queue.push({
          id: `enquiry-${enquiry.id}`,
          recipientType: "Enquiry",
          recipientId: Number(enquiry.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Enquiry",
          priority: enquiry.Follow_up_date! < today ? "Urgent" : "Today",
          reason:
            enquiry.Follow_up_date! < today
              ? `Follow-up overdue since ${formatDate(enquiry.Follow_up_date!)}`
              : "Follow-up due today",
          template: `Hi ${firstName(name)}, thank you for your interest in ${enquiry.Program || "classes"} at Footloose Alley Dance & Fitness Studio. Would you like help choosing a batch or booking a trial class?`,
          actionDate: enquiry.Follow_up_date,
        });
      });

    students
      .filter(
        (student) =>
          student.Status === "Active" &&
          student.last_attendance &&
          student.last_attendance < sevenDaysAgo &&
          student.whatsapp_enabled !== false
      )
      .forEach((student) => {
        const name = student.Name?.trim() || `Student #${student.id}`;
        const phone = student.Phone?.trim() || "";
        queue.push({
          id: `attendance-${student.id}`,
          recipientType: "Student",
          recipientId: Number(student.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Attendance",
          priority: "Upcoming",
          reason: `Last attended on ${formatDate(student.last_attendance!)}`,
          template: `Hi ${firstName(name)}, we missed you at Footloose Alley! We hope everything is well. Come back and join your ${student.Program || "class"} session soon — we would love to see you.`,
          actionDate: student.last_attendance,
        });
      });

    students
      .filter((student) => {
        if (!student.date_of_birth || student.whatsapp_enabled === false) return false;
        const [, month, day] = student.date_of_birth.split("-").map(Number);
        const [, todayMonth, todayDay] = today.split("-").map(Number);
        return month === todayMonth && day === todayDay;
      })
      .forEach((student) => {
        const name = student.Name?.trim() || `Student #${student.id}`;
        const phone = student.Phone?.trim() || "";
        queue.push({
          id: `birthday-${student.id}`,
          recipientType: "Student",
          recipientId: Number(student.id),
          name,
          phone,
          validPhone: isValidWhatsAppPhone(phone),
          category: "Birthday",
          priority: "Today",
          reason: "Birthday today",
          template: `Happy Birthday, ${firstName(name)}! 🎉 The entire Footloose Alley family wishes you a wonderful year filled with happiness, health, dance, and fitness. Have an amazing day!`,
          actionDate: today,
        });
      });

    const sortedQueue = queue.sort((first, second) => {
      const priorityDifference =
        priorityOrder(first.priority) - priorityOrder(second.priority);
      if (priorityDifference !== 0) return priorityDifference;
      return first.name.localeCompare(second.name);
    });

    const sentToday = history.filter((item) => item.sent_at.startsWith(today)).length;

    return {
      queue: sortedQueue,
      history,
      summary: {
        total: sortedQueue.length,
        urgent: sortedQueue.filter((item) => item.priority === "Urgent").length,
        dueToday: sortedQueue.filter((item) => item.priority === "Today").length,
        invalidPhones: sortedQueue.filter((item) => !item.validPhone).length,
        sentToday,
      },
    };
  }

  async logCommunication(
    item: WhatsAppQueueItem,
    message: string
  ): Promise<void> {
    const { error } = await supabase.from("communication_history").insert({
      recipient_name: item.name,
      phone: cleanPhone(item.phone),
      recipient_type: item.recipientType,
      recipient_id: item.recipientId,
      category: item.category,
      message,
      status: "Opened in WhatsApp",
      sent_at: new Date().toISOString(),
    });

    if (error) throw error;
  }
}

export const whatsappService = new WhatsAppService();
