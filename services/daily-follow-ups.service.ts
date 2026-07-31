import { supabase } from "@/lib/supabase";
import { attendanceIntelligenceService } from "@/services/attendance-intelligence.service";

export const FOLLOW_UP_TYPES = [
  "Membership",
  "Fee Due",
  "Enquiry",
  "Trial",
  "Birthday",
  "Attendance",
] as const;

export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];
export type FollowUpPriority = "Urgent" | "Today" | "Upcoming";
export type FollowUpActionStatus = "Completed" | "Postponed";

export interface DailyFollowUp {
  key: string;
  type: FollowUpType;
  subjectId: number;
  name: string;
  phone: string | null;
  title: string;
  detail: string;
  dueDate: string;
  priority: FollowUpPriority;
  manageHref: string;
  whatsappUrl: string | null;
  actionStatus: FollowUpActionStatus | null;
  postponedUntil: string | null;
  completedAt: string | null;
}

type StudentRow = {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  date_of_birth: string | null;
  membership_plan: string | null;
  membership_end_date: string | null;
  membership_status: string | null;
  membership_frozen: boolean | null;
  whatsapp_enabled: boolean | null;
};

type FeeDueRow = {
  id: number;
  student_id: number;
  amount_due: number;
  due_date: string;
  status: string;
};

type EnquiryRow = {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  Follow_up_date: string | null;
  trial_date: string | null;
  trial_status: string | null;
  trial_outcome: string | null;
};

type ActionRow = {
  reminder_key: string;
  action_status: FollowUpActionStatus;
  postponed_until: string | null;
  completed_at: string | null;
};

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function formatDate(dateValue: string): string {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeWhatsAppNumber(phone: string | null): string {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return "";
}

function whatsappUrl(phone: string | null, message: string): string | null {
  const number = normalizeWhatsAppNumber(phone);
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : null;
}

function priorityFor(dateValue: string, today: string): FollowUpPriority {
  if (dateValue < today) return "Urgent";
  if (dateValue === today) return "Today";
  return "Upcoming";
}

function activeEnquiry(status: string | null): boolean {
  return status !== "Joined" && status !== "Closed" && status !== "Not Interested";
}

function activeStudent(status: string | null): boolean {
  return !["Inactive", "Cancelled", "Archived"].includes(status ?? "");
}

function birthdayDateFor(referenceDate: string, dateOfBirth: string): string {
  const [, month, day] = dateOfBirth.slice(0, 10).split("-");
  return `${referenceDate.slice(0, 4)}-${month}-${day}`;
}

function applyActions(
  reminders: DailyFollowUp[],
  actions: ActionRow[]
): DailyFollowUp[] {
  const actionsByKey = new Map(actions.map((action) => [action.reminder_key, action]));

  return reminders.map((reminder) => {
    const action = actionsByKey.get(reminder.key);

    return action
      ? {
          ...reminder,
          actionStatus: action.action_status,
          postponedUntil: action.postponed_until,
          completedAt: action.completed_at,
        }
      : reminder;
  });
}

function sortReminders(reminders: DailyFollowUp[]): DailyFollowUp[] {
  const priorityOrder: Record<FollowUpPriority, number> = {
    Urgent: 0,
    Today: 1,
    Upcoming: 2,
  };

  return [...reminders].sort(
    (left, right) =>
      priorityOrder[left.priority] - priorityOrder[right.priority] ||
      left.dueDate.localeCompare(right.dueDate) ||
      left.name.localeCompare(right.name)
  );
}

class DailyFollowUpsService {
  async getFollowUps(): Promise<DailyFollowUp[]> {
    const today = localDateString();
    const tomorrow = addDays(today, 1);
    const membershipWindow = addDays(today, 7);

    const refreshResult = await supabase.rpc("refresh_fee_due_statuses");
    if (refreshResult.error) {
      throw new Error(
        refreshResult.error.message || "Unable to refresh fee due statuses."
      );
    }

    const [studentsResult, feesResult, enquiriesResult, actionsResult] =
      await Promise.all([
        supabase
          .from("Students")
          .select(
            "id,Name,Phone,Program,Status,date_of_birth,membership_plan,membership_end_date,membership_status,membership_frozen,whatsapp_enabled"
          ),
        supabase
          .from("fee_dues")
          .select("id,student_id,amount_due,due_date,status")
          .in("status", ["Pending", "Due Today", "Overdue"])
          .lte("due_date", today),
        supabase
          .from("Enquiries")
          .select(
            "id,Name,Phone,Program,Status,Follow_up_date,trial_date,trial_status,trial_outcome"
          ),
        supabase
          .from("Daily_Follow_Up_Actions")
          .select("reminder_key,action_status,postponed_until,completed_at"),
      ]);

    const firstError =
      studentsResult.error ||
      feesResult.error ||
      enquiriesResult.error ||
      actionsResult.error;

    if (firstError) {
      throw new Error(firstError.message || "Unable to load daily follow-ups.");
    }

    const students = (studentsResult.data ?? []) as unknown as StudentRow[];
    const fees = (feesResult.data ?? []) as unknown as FeeDueRow[];
    const enquiries = (enquiriesResult.data ?? []) as unknown as EnquiryRow[];
    const actions = (actionsResult.data ?? []) as unknown as ActionRow[];
    const studentsById = new Map(students.map((student) => [student.id, student]));
    const reminders: DailyFollowUp[] = [];

    for (const student of students) {
      const name = student.Name?.trim() || "Student";
      const phone = student.whatsapp_enabled === false ? null : student.Phone;

      if (
        student.membership_end_date &&
        student.membership_end_date <= membershipWindow &&
        !student.membership_frozen &&
        student.membership_status !== "Frozen" &&
        student.membership_status !== "Cancelled"
      ) {
        const dueDate = student.membership_end_date.slice(0, 10);
        const expired = dueDate < today;

        reminders.push({
          key: `membership:${student.id}:${dueDate}`,
          type: "Membership",
          subjectId: student.id,
          name,
          phone,
          title: expired ? "Membership expired" : "Membership renewal due",
          detail: `${student.membership_plan || "Membership"} ${
            expired ? "expired" : "expires"
          } on ${formatDate(dueDate)}.`,
          dueDate,
          priority: priorityFor(dueDate, today),
          manageHref: `/students/${student.id}`,
          whatsappUrl: whatsappUrl(
            phone,
            `Hello ${name}, this is a friendly reminder from Footloose Alley Dance and Fitness Studio. Your membership ${
              expired ? "expired" : "will expire"
            } on ${formatDate(
              dueDate
            )}. Please contact us to renew your membership. Thank you!`
          ),
          actionStatus: null,
          postponedUntil: null,
          completedAt: null,
        });
      }

      if (student.date_of_birth) {
        const birthdayToday = birthdayDateFor(today, student.date_of_birth);
        const birthdayTomorrow = birthdayDateFor(tomorrow, student.date_of_birth);

        if (birthdayToday === today) {
          reminders.push({
            key: `birthday:${student.id}:${today.slice(0, 4)}`,
            type: "Birthday",
            subjectId: student.id,
            name,
            phone,
            title: "Birthday today",
            detail: `Wish ${name} a happy birthday from the Footloose Alley team.`,
            dueDate: today,
            priority: "Today",
            manageHref: `/students/${student.id}`,
            whatsappUrl: whatsappUrl(
              phone,
              `Happy Birthday ${name}! 🎉 Wishing you a wonderful year ahead from everyone at Footloose Alley Dance and Fitness Studio.`
            ),
            actionStatus: null,
            postponedUntil: null,
            completedAt: null,
          });
        } else if (birthdayTomorrow === tomorrow && activeStudent(student.Status)) {
          reminders.push({
            key: `birthday-plan:${student.id}:${tomorrow}`,
            type: "Birthday",
            subjectId: student.id,
            name,
            phone,
            title: "Birthday tomorrow",
            detail: `Plan tomorrow's birthday wish or celebration for ${name}.`,
            dueDate: tomorrow,
            priority: "Upcoming",
            manageHref: `/students/${student.id}`,
            whatsappUrl: null,
            actionStatus: null,
            postponedUntil: null,
            completedAt: null,
          });
        }
      }
    }

    for (const fee of fees) {
      const student = studentsById.get(fee.student_id);
      const name = student?.Name?.trim() || "Student";
      const phone = student?.whatsapp_enabled === false ? null : student?.Phone ?? null;
      const dueDate = fee.due_date.slice(0, 10);

      reminders.push({
        key: `fee-due:${fee.id}:${dueDate}`,
        type: "Fee Due",
        subjectId: fee.id,
        name,
        phone,
        title: dueDate < today ? "Fee overdue" : "Fee due today",
        detail: `${formatCurrency(Number(fee.amount_due) || 0)} ${
          dueDate < today ? "was due" : "is due"
        } on ${formatDate(dueDate)}.`,
        dueDate,
        priority: priorityFor(dueDate, today),
        manageHref: "/fee-dues",
        whatsappUrl: whatsappUrl(
          phone,
          `Hello ${name}, this is a friendly reminder from Footloose Alley Dance and Fitness Studio. Your fee of ${formatCurrency(
            Number(fee.amount_due) || 0
          )} ${dueDate < today ? "was due" : "is due"} on ${formatDate(
            dueDate
          )}. Please contact us if you need any assistance. Thank you!`
        ),
        actionStatus: null,
        postponedUntil: null,
        completedAt: null,
      });
    }

    for (const enquiry of enquiries) {
      const name = enquiry.Name?.trim() || "there";
      const phone = enquiry.Phone;

      if (
        enquiry.Follow_up_date &&
        enquiry.Follow_up_date <= today &&
        activeEnquiry(enquiry.Status)
      ) {
        const dueDate = enquiry.Follow_up_date.slice(0, 10);

        reminders.push({
          key: `enquiry:${enquiry.id}:${dueDate}`,
          type: "Enquiry",
          subjectId: enquiry.id,
          name,
          phone,
          title: dueDate < today ? "Enquiry follow-up overdue" : "Enquiry follow-up",
          detail: `${enquiry.Program || "Class enquiry"} follow-up ${
            dueDate < today ? "was due" : "is due"
          } on ${formatDate(dueDate)}.`,
          dueDate,
          priority: priorityFor(dueDate, today),
          manageHref: "/enquiries",
          whatsappUrl: whatsappUrl(
            phone,
            `Hi ${name}, this is Footloose Alley Dance and Fitness Studio. We are following up regarding your enquiry for ${
              enquiry.Program || "our classes"
            }. Please let us know how we can assist you.`
          ),
          actionStatus: null,
          postponedUntil: null,
          completedAt: null,
        });
      }

      const trialDate = enquiry.trial_date?.slice(0, 10) ?? null;
      const trialIsOpen =
        trialDate &&
        activeEnquiry(enquiry.Status) &&
        !["Attended", "Cancelled"].includes(enquiry.trial_status ?? "");

      if (trialIsOpen && trialDate === tomorrow) {
        reminders.push({
          key: `trial-reminder:${enquiry.id}:${trialDate}`,
          type: "Trial",
          subjectId: enquiry.id,
          name,
          phone,
          title: "Trial class tomorrow",
          detail: `${enquiry.Program || "Trial class"} is scheduled for ${formatDate(
            trialDate
          )}.`,
          dueDate: trialDate,
          priority: "Upcoming",
          manageHref: "/trials",
          whatsappUrl: whatsappUrl(
            phone,
            `Hi ${name}, this is a reminder from Footloose Alley Dance and Fitness Studio that your trial class is tomorrow. We look forward to seeing you!`
          ),
          actionStatus: null,
          postponedUntil: null,
          completedAt: null,
        });
      }

      if (trialIsOpen && trialDate <= today) {
        const dueDate = trialDate;

        reminders.push({
          key: `trial:${enquiry.id}:${dueDate}`,
          type: "Trial",
          subjectId: enquiry.id,
          name,
          phone,
          title: dueDate < today ? "Trial follow-up overdue" : "Trial reminder today",
          detail: `${enquiry.Program || "Trial class"} ${
            dueDate < today ? "was scheduled" : "is scheduled"
          } for ${formatDate(dueDate)}.`,
          dueDate,
          priority: priorityFor(dueDate, today),
          manageHref: "/trials",
          whatsappUrl: whatsappUrl(
            phone,
            dueDate === today
              ? `Hi ${name}, this is a reminder from Footloose Alley Dance and Fitness Studio about your trial class today. We look forward to seeing you!`
              : `Hi ${name}, this is Footloose Alley Dance and Fitness Studio. We are following up regarding your trial class. Please let us know if you would like to reschedule or need any assistance.`
          ),
          actionStatus: null,
          postponedUntil: null,
          completedAt: null,
        });
      }
    }

    const attendanceRisks = await attendanceIntelligenceService.getRisks();
    for (const risk of attendanceRisks) {
      reminders.push({
        key: risk.key,
        type: "Attendance",
        subjectId: risk.studentId,
        name: risk.name,
        phone: risk.phone,
        title: risk.reason,
        detail: risk.detail,
        dueDate: risk.lastPresentDate ?? today,
        priority: risk.priority === "Urgent" ? "Urgent" : "Today",
        manageHref: "/attendance",
        whatsappUrl: risk.whatsappUrl,
        actionStatus: risk.actionStatus,
        postponedUntil: risk.postponedUntil,
        completedAt: risk.completedAt,
      });
    }

    return sortReminders(applyActions(reminders, actions));
  }

  async complete(followUp: DailyFollowUp): Promise<void> {
    const { error } = await supabase.rpc("complete_daily_follow_up", {
      target_reminder_key: followUp.key,
      target_reminder_type: followUp.type,
    });

    if (error) {
      throw new Error(error.message || "Unable to complete the follow-up.");
    }
  }

  async postpone(followUp: DailyFollowUp, until: string): Promise<void> {
    const { error } = await supabase.rpc("postpone_daily_follow_up", {
      target_reminder_key: followUp.key,
      target_reminder_type: followUp.type,
      target_postponed_until: until,
    });

    if (error) {
      throw new Error(error.message || "Unable to postpone the follow-up.");
    }
  }
}

export const dailyFollowUpsService = new DailyFollowUpsService();
export { addDays, localDateString };
