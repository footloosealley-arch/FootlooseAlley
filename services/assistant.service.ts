import { supabase } from "@/lib/supabase";

export type AssistantInsightType =
  | "Fee Risk"
  | "Attendance"
  | "Renewal"
  | "Enquiry"
  | "Trial"
  | "Revenue"
  | "Birthday";

export type AssistantPriority = "Critical" | "High" | "Medium" | "Positive";

export interface AssistantInsight {
  id: string;
  type: AssistantInsightType;
  priority: AssistantPriority;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  phone: string | null;
  suggestedMessage: string | null;
}

export interface AssistantPerson {
  id: number;
  name: string;
  phone: string | null;
  detail: string;
  href: string;
}

export interface AssistantSnapshot {
  generatedAt: string;
  greetingSummary: string;
  metrics: {
    revenueToday: number;
    revenueMonth: number;
    presentToday: number;
    trialsToday: number;
    overdueFollowUps: number;
    overdueFeeAmount: number;
    expiringMemberships: number;
  };
  insights: AssistantInsight[];
  lists: {
    overdueFees: AssistantPerson[];
    missedAttendance: AssistantPerson[];
    renewals: AssistantPerson[];
    followUps: AssistantPerson[];
    trials: AssistantPerson[];
  };
}

export interface AssistantAnswer {
  title: string;
  answer: string;
  people: AssistantPerson[];
  href: string | null;
  hrefLabel: string | null;
}

interface StudentRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  membership_plan: string | null;
  membership_end_date: string | null;
  last_attendance: string | null;
  date_of_birth: string | null;
  whatsapp_enabled: boolean | null;
}

interface PaymentRow {
  amount: number | string | null;
  payment_date: string;
  payment_status: string | null;
}

interface AttendanceRow {
  student_id: number | null;
  date: string | null;
  status: string | null;
}

interface EnquiryRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  Follow_up_date: string | null;
  trial_date: string | null;
  trial_status: string | null;
  trial_outcome: string | null;
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

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

function isCompletedPayment(status: string | null): boolean {
  if (!status) return true;
  return ["paid", "completed", "success"].includes(status.trim().toLowerCase());
}

function isPresent(status: string | null): boolean {
  return status?.trim().toLowerCase() === "present";
}

function isClosedFee(status: string | null): boolean {
  return ["paid", "waived", "cancelled"].includes(status?.trim().toLowerCase() ?? "");
}

function isFinishedEnquiry(status: string | null): boolean {
  return ["joined", "converted", "closed", "not interested"].includes(
    status?.trim().toLowerCase() ?? ""
  );
}

function priorityOrder(priority: AssistantPriority): number {
  if (priority === "Critical") return 0;
  if (priority === "High") return 1;
  if (priority === "Medium") return 2;
  return 3;
}

class AssistantService {
  async getSnapshot(): Promise<AssistantSnapshot> {
    const [studentsResult, paymentsResult, attendanceResult, enquiriesResult, feeDuesResult] =
      await Promise.all([
        supabase
          .from("Students")
          .select(
            "id,Name,Phone,Program,Status,membership_plan,membership_end_date,last_attendance,date_of_birth,whatsapp_enabled"
          ),
        supabase.from("Payments").select("amount,payment_date,payment_status"),
        supabase.from("Attendance").select("student_id,date,status"),
        supabase
          .from("Enquiries")
          .select(
            "id,Name,Phone,Program,Status,Follow_up_date,trial_date,trial_status,trial_outcome"
          ),
        supabase.from("fee_dues").select("id,student_id,amount_due,due_date,status"),
      ]);

    if (studentsResult.error) throw studentsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (enquiriesResult.error) throw enquiriesResult.error;
    if (feeDuesResult.error) throw feeDuesResult.error;

    const students = (studentsResult.data ?? []) as StudentRow[];
    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const attendance = (attendanceResult.data ?? []) as AttendanceRow[];
    const enquiries = (enquiriesResult.data ?? []) as EnquiryRow[];
    const feeDues = (feeDuesResult.data ?? []) as FeeDueRow[];

    const today = getLocalDateString();
    const monthStart = `${today.slice(0, 7)}-01`;
    const sevenDaysAgo = addDays(today, -7);
    const inSevenDays = addDays(today, 7);
    const inThirtyDays = addDays(today, 30);
    const studentById = new Map(students.map((student) => [Number(student.id), student]));
    const completedPayments = payments.filter((payment) =>
      isCompletedPayment(payment.payment_status)
    );
    const revenueToday = completedPayments
      .filter((payment) => payment.payment_date === today)
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const revenueMonth = completedPayments
      .filter(
        (payment) => payment.payment_date >= monthStart && payment.payment_date <= today
      )
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const presentToday = attendance.filter(
      (record) => record.date === today && isPresent(record.status)
    ).length;

    const overdueFeeRows = feeDues.filter(
      (feeDue) => !isClosedFee(feeDue.status) && feeDue.due_date < today
    );
    const overdueFeeAmount = overdueFeeRows.reduce(
      (sum, feeDue) => sum + Number(feeDue.amount_due ?? 0),
      0
    );
    const overdueFees: AssistantPerson[] = overdueFeeRows
      .map((feeDue) => {
        const student = studentById.get(Number(feeDue.student_id));
        return {
          id: Number(feeDue.id),
          name: student?.Name?.trim() || `Student #${feeDue.student_id}`,
          phone: student?.Phone?.trim() || null,
          detail: `${formatCurrency(Number(feeDue.amount_due ?? 0))} overdue since ${formatDate(feeDue.due_date)}`,
          href: "/fee-dues",
        };
      })
      .slice(0, 20);

    const missedAttendance: AssistantPerson[] = students
      .filter(
        (student) =>
          student.Status === "Active" &&
          (!student.last_attendance || student.last_attendance < sevenDaysAgo)
      )
      .map((student) => ({
        id: Number(student.id),
        name: student.Name?.trim() || `Student #${student.id}`,
        phone: student.Phone?.trim() || null,
        detail: student.last_attendance
          ? `Last attended ${formatDate(student.last_attendance)}`
          : "No attendance recorded",
        href: `/students/${student.id}`,
      }))
      .slice(0, 20);

    const renewals: AssistantPerson[] = students
      .filter(
        (student) =>
          student.membership_end_date &&
          student.membership_end_date >= today &&
          student.membership_end_date <= inThirtyDays &&
          student.Status !== "Inactive"
      )
      .sort((first, second) =>
        (first.membership_end_date || "").localeCompare(second.membership_end_date || "")
      )
      .map((student) => ({
        id: Number(student.id),
        name: student.Name?.trim() || `Student #${student.id}`,
        phone: student.Phone?.trim() || null,
        detail: `${student.membership_plan || student.Program || "Membership"} ends ${formatDate(student.membership_end_date!)}`,
        href: `/students/${student.id}`,
      }))
      .slice(0, 20);

    const activeEnquiries = enquiries.filter(
      (enquiry) => !isFinishedEnquiry(enquiry.Status)
    );
    const followUps: AssistantPerson[] = activeEnquiries
      .filter(
        (enquiry) => enquiry.Follow_up_date && enquiry.Follow_up_date <= today
      )
      .sort((first, second) =>
        (first.Follow_up_date || "").localeCompare(second.Follow_up_date || "")
      )
      .map((enquiry) => ({
        id: Number(enquiry.id),
        name: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        phone: enquiry.Phone?.trim() || null,
        detail:
          enquiry.Follow_up_date! < today
            ? `Follow-up overdue since ${formatDate(enquiry.Follow_up_date!)}`
            : `Follow-up due today · ${enquiry.Program || "Program not selected"}`,
        href: "/enquiries",
      }))
      .slice(0, 20);

    const trials: AssistantPerson[] = activeEnquiries
      .filter(
        (enquiry) =>
          enquiry.trial_date &&
          enquiry.trial_date >= today &&
          enquiry.trial_date <= inSevenDays &&
          !["Cancelled", "Attended"].includes(enquiry.trial_status ?? "")
      )
      .sort((first, second) =>
        (first.trial_date || "").localeCompare(second.trial_date || "")
      )
      .map((enquiry) => ({
        id: Number(enquiry.id),
        name: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        phone: enquiry.Phone?.trim() || null,
        detail: `${enquiry.Program || "Trial"} on ${formatDate(enquiry.trial_date!)}`,
        href: "/trials",
      }))
      .slice(0, 20);

    const todaysBirthdays = students.filter((student) => {
      if (!student.date_of_birth) return false;
      return student.date_of_birth.slice(5) === today.slice(5);
    });

    const insights: AssistantInsight[] = [];

    if (overdueFees.length > 0) {
      insights.push({
        id: "overdue-fees",
        type: "Fee Risk",
        priority: "Critical",
        title: `${overdueFees.length} overdue fee account${overdueFees.length === 1 ? "" : "s"}`,
        description: `${formatCurrency(overdueFeeAmount)} requires collection follow-up.`,
        href: "/fee-dues",
        actionLabel: "Review fee dues",
        phone: overdueFees[0]?.phone ?? null,
        suggestedMessage: overdueFees[0]
          ? `Hi ${firstName(overdueFees[0].name)}, this is Footloose Alley Dance & Fitness Studio. Your membership fee is overdue. Please complete the payment at your earliest convenience. Thank you!`
          : null,
      });
    }

    if (followUps.length > 0) {
      insights.push({
        id: "enquiry-followups",
        type: "Enquiry",
        priority: "High",
        title: `${followUps.length} enquiry follow-up${followUps.length === 1 ? "" : "s"} waiting`,
        description: "Contact these prospects before the opportunity becomes cold.",
        href: "/enquiries",
        actionLabel: "Open enquiries",
        phone: followUps[0]?.phone ?? null,
        suggestedMessage: followUps[0]
          ? `Hi ${firstName(followUps[0].name)}, thank you for your interest in Footloose Alley. Would you like help booking a trial class or choosing a batch?`
          : null,
      });
    }

    if (missedAttendance.length > 0) {
      insights.push({
        id: "attendance-risk",
        type: "Attendance",
        priority: "High",
        title: `${missedAttendance.length} active student${missedAttendance.length === 1 ? "" : "s"} may be disengaging`,
        description: "They have no recorded attendance during the past seven days.",
        href: "/attendance/history",
        actionLabel: "Review attendance",
        phone: missedAttendance[0]?.phone ?? null,
        suggestedMessage: missedAttendance[0]
          ? `Hi ${firstName(missedAttendance[0].name)}, we missed you at Footloose Alley! We hope everything is well and would love to see you back in class soon.`
          : null,
      });
    }

    if (renewals.length > 0) {
      insights.push({
        id: "renewal-risk",
        type: "Renewal",
        priority: renewals.some((renewal) => {
          const membershipEndDate = students.find(
            (student) => student.id === renewal.id
          )?.membership_end_date;

          return Boolean(membershipEndDate && membershipEndDate <= inSevenDays);
        })
          ? "High"
          : "Medium",
        title: `${renewals.length} membership renewal${renewals.length === 1 ? "" : "s"} approaching`,
        description: "Memberships shown will end within the next 30 days.",
        href: "/students",
        actionLabel: "Review renewals",
        phone: renewals[0]?.phone ?? null,
        suggestedMessage: renewals[0]
          ? `Hi ${firstName(renewals[0].name)}, your Footloose Alley membership is ending soon. Renew now to continue your classes without interruption.`
          : null,
      });
    }

    if (trials.length > 0) {
      insights.push({
        id: "trial-opportunities",
        type: "Trial",
        priority: "Medium",
        title: `${trials.length} trial conversion opportunit${trials.length === 1 ? "y" : "ies"}`,
        description: "Send reminders and record the outcome immediately after each trial.",
        href: "/trials",
        actionLabel: "Manage trials",
        phone: trials[0]?.phone ?? null,
        suggestedMessage: trials[0]
          ? `Hi ${firstName(trials[0].name)}, this is a reminder about your upcoming trial class at Footloose Alley. We look forward to welcoming you!`
          : null,
      });
    }

    if (todaysBirthdays.length > 0) {
      const student = todaysBirthdays[0];
      const name = student.Name?.trim() || `Student #${student.id}`;
      insights.push({
        id: "birthdays",
        type: "Birthday",
        priority: "Positive",
        title: `${todaysBirthdays.length} student birthday${todaysBirthdays.length === 1 ? "" : "s"} today`,
        description: "A personal greeting is a simple way to strengthen retention.",
        href: `/students/${student.id}`,
        actionLabel: "View student",
        phone: student.Phone?.trim() || null,
        suggestedMessage: `Happy Birthday, ${firstName(name)}! 🎉 The Footloose Alley family wishes you a wonderful year filled with happiness, health, dance, and fitness!`,
      });
    }

    insights.push({
      id: "revenue-status",
      type: "Revenue",
      priority: revenueToday > 0 ? "Positive" : "Medium",
      title:
        revenueToday > 0
          ? `${formatCurrency(revenueToday)} collected today`
          : "No completed payment recorded today",
      description: `${formatCurrency(revenueMonth)} collected so far this month.`,
      href: "/payments",
      actionLabel: "View payments",
      phone: null,
      suggestedMessage: null,
    });

    insights.sort(
      (first, second) => priorityOrder(first.priority) - priorityOrder(second.priority)
    );

    const criticalCount = insights.filter(
      (insight) => insight.priority === "Critical" || insight.priority === "High"
    ).length;

    return {
      generatedAt: new Date().toISOString(),
      greetingSummary:
        criticalCount > 0
          ? `${criticalCount} priority area${criticalCount === 1 ? "" : "s"} need attention today. Start with overdue fees and enquiry follow-ups.`
          : "Studio operations look healthy. Focus on today’s trials, renewals, and member engagement.",
      metrics: {
        revenueToday: Number(revenueToday.toFixed(2)),
        revenueMonth: Number(revenueMonth.toFixed(2)),
        presentToday,
        trialsToday: activeEnquiries.filter((enquiry) => enquiry.trial_date === today)
          .length,
        overdueFollowUps: activeEnquiries.filter(
          (enquiry) => enquiry.Follow_up_date && enquiry.Follow_up_date < today
        ).length,
        overdueFeeAmount: Number(overdueFeeAmount.toFixed(2)),
        expiringMemberships: renewals.length,
      },
      insights,
      lists: {
        overdueFees,
        missedAttendance,
        renewals,
        followUps,
        trials,
      },
    };
  }

  answerQuestion(question: string, snapshot: AssistantSnapshot): AssistantAnswer {
    const query = question.trim().toLowerCase();

    if (/(fee|fees|due|overdue|payment pending)/.test(query)) {
      return {
        title: "Overdue Fees",
        answer:
          snapshot.lists.overdueFees.length > 0
            ? `${snapshot.lists.overdueFees.length} fee account${snapshot.lists.overdueFees.length === 1 ? " is" : "s are"} overdue, totalling ${formatCurrency(snapshot.metrics.overdueFeeAmount)}.`
            : "There are no overdue fee accounts right now.",
        people: snapshot.lists.overdueFees,
        href: "/fee-dues",
        hrefLabel: "Open Fee Due Centre",
      };
    }

    if (/(miss|absent|attendance|not coming|inactive student)/.test(query)) {
      return {
        title: "Attendance Risk",
        answer:
          snapshot.lists.missedAttendance.length > 0
            ? `${snapshot.lists.missedAttendance.length} active student${snapshot.lists.missedAttendance.length === 1 ? " has" : "s have"} no recorded attendance in the past seven days.`
            : "All active students have recent attendance records.",
        people: snapshot.lists.missedAttendance,
        href: "/attendance/history",
        hrefLabel: "Open Attendance History",
      };
    }

    if (/(renew|expire|expiry|membership ending|lapse)/.test(query)) {
      return {
        title: "Upcoming Renewals",
        answer:
          snapshot.lists.renewals.length > 0
            ? `${snapshot.lists.renewals.length} membership${snapshot.lists.renewals.length === 1 ? "" : "s"} will end within the next 30 days.`
            : "No memberships are ending within the next 30 days.",
        people: snapshot.lists.renewals,
        href: "/students",
        hrefLabel: "Open Students",
      };
    }

    if (/(enquir|follow.?up|contact today|who.*contact|lead)/.test(query)) {
      return {
        title: "Enquiry Follow-ups",
        answer:
          snapshot.lists.followUps.length > 0
            ? `${snapshot.lists.followUps.length} enquiry follow-up${snapshot.lists.followUps.length === 1 ? " needs" : "s need"} attention today.`
            : "There are no overdue or due-today enquiry follow-ups.",
        people: snapshot.lists.followUps,
        href: "/enquiries",
        hrefLabel: "Open Enquiries",
      };
    }

    if (/(trial|prospect|conversion opportun)/.test(query)) {
      return {
        title: "Trial Opportunities",
        answer:
          snapshot.lists.trials.length > 0
            ? `${snapshot.lists.trials.length} trial${snapshot.lists.trials.length === 1 ? " is" : "s are"} scheduled during the next seven days.`
            : "There are no upcoming trials during the next seven days.",
        people: snapshot.lists.trials,
        href: "/trials",
        hrefLabel: "Open Trial Operations",
      };
    }

    if (/(revenue|income|collection|collected|money|sales)/.test(query)) {
      return {
        title: "Revenue Summary",
        answer: `${formatCurrency(snapshot.metrics.revenueToday)} has been collected today and ${formatCurrency(snapshot.metrics.revenueMonth)} has been collected this month.`,
        people: [],
        href: "/reports",
        hrefLabel: "Open Reports",
      };
    }

    if (/(today|brief|priority|what.*do|summary|status)/.test(query)) {
      return {
        title: "Today’s Priorities",
        answer: snapshot.greetingSummary,
        people: [
          ...snapshot.lists.overdueFees.slice(0, 3),
          ...snapshot.lists.followUps.slice(0, 3),
          ...snapshot.lists.trials.slice(0, 3),
        ],
        href: "/dashboard",
        hrefLabel: "Open Reception Dashboard",
      };
    }

    return {
      title: "Try a Studio Question",
      answer:
        "I can answer questions about overdue fees, missed attendance, renewals, enquiries, trials, revenue, and today’s priorities.",
      people: [],
      href: null,
      hrefLabel: null,
    };
  }
}

export const assistantService = new AssistantService();
