import { supabase } from "@/lib/supabase";

import type {
  DashboardStats,
  Enquiry,
  Payment,
  Student,
} from "@/types/database";

export type DashboardFeeDueStatus =
  | "Overdue"
  | "Due Today"
  | "Due Soon";

export type DashboardPriorityActionType =
  | "Fee Due"
  | "Enquiry Follow-up"
  | "Trial Class"
  | "Birthday";

export type DashboardPriorityLevel =
  | "Urgent"
  | "Today"
  | "Upcoming";

export interface DashboardFeeDue {
  id: number;
  student_id: number;
  student_name: string;
  student_phone: string;
  amount_due: number;
  due_date: string;
  status: DashboardFeeDueStatus;
  membership_plan: string | null;
  reminder_count: number;
}

export interface DashboardFeeDueSummary {
  overdueCount: number;
  overdueAmount: number;
  dueTodayCount: number;
  dueTodayAmount: number;
  dueSoonCount: number;
  dueSoonAmount: number;
  totalActionCount: number;
  totalActionAmount: number;
}

export interface DashboardRecentPayment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  Students?: {
    Name: string | null;
  } | null;
}

export interface DashboardPriorityAction {
  id: string;
  type: DashboardPriorityActionType;
  priority: DashboardPriorityLevel;
  title: string;
  description: string;
  href: string;
  phone: string | null;
  amount: number | null;
  actionDate: string | null;
}

export interface DashboardUpcomingRenewal {
  studentId: number;
  studentName: string;
  membershipPlan: string | null;
  endDate: string;
  daysRemaining: number;
}

export interface DashboardCommandSummary {
  todayRevenue: number;
  todayPresent: number;
  overdueFollowUps: number;
  todayFollowUps: number;
  todayTrials: number;
  todayBirthdays: number;
  urgentTasks: number;
}

export interface DashboardCheckIn {
  id: number;
  studentId: number | null;
  studentName: string;
  program: string | null;
  checkInTime: string | null;
  sessionName: string | null;
  status: string;
}

export interface DashboardReceptionArrival {
  id: number;
  name: string;
  phone: string | null;
  program: string | null;
  kind: "Trial" | "Follow-up";
  status: "Expected" | "Overdue" | "Due today";
  href: string;
}

export interface DashboardData {
  stats: DashboardStats;
  commandSummary: DashboardCommandSummary;
  priorityActions: DashboardPriorityAction[];
  birthdays: Student[];
  recentPayments: DashboardRecentPayment[];
  recentEnquiries: Enquiry[];
  urgentFeeDues: DashboardFeeDue[];
  feeDueSummary: DashboardFeeDueSummary;
  upcomingRenewals: DashboardUpcomingRenewal[];
  recentCheckIns: DashboardCheckIn[];
  receptionArrivals: DashboardReceptionArrival[];
}

interface DashboardRecentPaymentRow {
  id: number;
  amount: number | string;
  payment_date: string;
  payment_method: string | null;
  Students:
    | {
        Name: string | null;
      }[]
    | {
        Name: string | null;
      }
    | null;
}

interface FeeDueDatabaseRow {
  id: number;
  student_id: number;
  amount_due: number | string | null;
  due_date: string;
  status: string | null;
  membership_plan: string | null;
  reminder_count: number | null;
}

interface DashboardAttendanceRow {
  id: number;
  student_id: number | null;
  date: string | null;
  status: string | null;
  check_in_time: string | null;
  session_name: string | null;
}

type DashboardEnquiry = Enquiry & {
  Name?: string | null;
  Phone?: string | null;
  Program?: string | null;
  Status?: string | null;
  Follow_up_date?: string | null;
  trial_date?: string | null;
  Notes?: string | null;
};

function getLocalDateString(
  date: Date = new Date()
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  days: number
): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setDate(date.getDate() + days);

  return getLocalDateString(date);
}

function isClosedFeeDueStatus(
  status: string | null
): boolean {
  const normalized =
    status?.trim().toLowerCase() ?? "";

  return (
    normalized === "paid" ||
    normalized === "waived" ||
    normalized === "cancelled"
  );
}

function isActiveFeeDueStatus(
  status: string | null
): boolean {
  return !isClosedFeeDueStatus(status);
}

function isFinishedEnquiryStatus(
  status: string | null | undefined
): boolean {
  const normalized =
    status?.trim().toLowerCase() ?? "";

  return (
    normalized === "joined" ||
    normalized === "converted" ||
    normalized === "closed" ||
    normalized === "not interested"
  );
}

function isCompletedPayment(
  payment: Payment
): boolean {
  const status = (
    payment as Payment & {
      payment_status?: string | null;
    }
  ).payment_status;

  if (!status) {
    return true;
  }

  const normalized =
    status.trim().toLowerCase();

  return (
    normalized === "paid" ||
    normalized === "completed" ||
    normalized === "success"
  );
}

function isPresentStatus(
  status: string | null | undefined
): boolean {
  return (
    status?.trim().toLowerCase() ===
    "present"
  );
}

function calculateDashboardFeeDueStatus(
  dueDate: string,
  existingStatus: string | null,
  today: string,
  nextSevenDays: string
): DashboardFeeDueStatus | null {
  if (isClosedFeeDueStatus(existingStatus)) {
    return null;
  }

  if (dueDate < today) {
    return "Overdue";
  }

  if (dueDate === today) {
    return "Due Today";
  }

  if (
    dueDate > today &&
    dueDate <= nextSevenDays
  ) {
    return "Due Soon";
  }

  return null;
}

function getFeeDuePriority(
  status: DashboardFeeDueStatus
): number {
  if (status === "Overdue") {
    return 0;
  }

  if (status === "Due Today") {
    return 1;
  }

  return 2;
}

function getActionPriority(
  priority: DashboardPriorityLevel
): number {
  if (priority === "Urgent") {
    return 0;
  }

  if (priority === "Today") {
    return 1;
  }

  return 2;
}

function calculateFeeDueSummary(
  feeDues: DashboardFeeDue[]
): DashboardFeeDueSummary {
  const overdueFeeDues = feeDues.filter(
    (feeDue) =>
      feeDue.status === "Overdue"
  );

  const dueTodayFeeDues = feeDues.filter(
    (feeDue) =>
      feeDue.status === "Due Today"
  );

  const dueSoonFeeDues = feeDues.filter(
    (feeDue) =>
      feeDue.status === "Due Soon"
  );

  function sumAmounts(
    records: DashboardFeeDue[]
  ): number {
    return Number(
      records
        .reduce(
          (total, feeDue) =>
            total +
            Number(feeDue.amount_due),
          0
        )
        .toFixed(2)
    );
  }

  const overdueAmount =
    sumAmounts(overdueFeeDues);

  const dueTodayAmount =
    sumAmounts(dueTodayFeeDues);

  const dueSoonAmount =
    sumAmounts(dueSoonFeeDues);

  return {
    overdueCount:
      overdueFeeDues.length,

    overdueAmount,

    dueTodayCount:
      dueTodayFeeDues.length,

    dueTodayAmount,

    dueSoonCount:
      dueSoonFeeDues.length,

    dueSoonAmount,

    totalActionCount:
      feeDues.length,

    totalActionAmount:
      Number(
        (
          overdueAmount +
          dueTodayAmount +
          dueSoonAmount
        ).toFixed(2)
      ),
  };
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    const [
      studentsResult,
      attendanceResult,
      enquiriesResult,
      paymentsResult,
      recentPaymentsResult,
      feeDuesResult,
    ] = await Promise.all([
      supabase
        .from("Students")
        .select("*"),

      supabase
        .from("Attendance")
        .select("id,student_id,date,status,check_in_time,session_name"),

      supabase
        .from("Enquiries")
        .select("*"),

      supabase
        .from("Payments")
        .select("*"),

      supabase
        .from("Payments")
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          Students(Name)
        `)
        .order("payment_date", {
          ascending: false,
        })
        .limit(5),

      supabase
        .from("fee_dues")
        .select(`
          id,
          student_id,
          amount_due,
          due_date,
          status,
          membership_plan,
          reminder_count
        `)
        .order("due_date", {
          ascending: true,
        }),
    ]);

    if (studentsResult.error) {
      throw studentsResult.error;
    }

    if (attendanceResult.error) {
      throw attendanceResult.error;
    }

    if (enquiriesResult.error) {
      throw enquiriesResult.error;
    }

    if (paymentsResult.error) {
      throw paymentsResult.error;
    }

    if (recentPaymentsResult.error) {
      throw recentPaymentsResult.error;
    }

    if (feeDuesResult.error) {
      throw feeDuesResult.error;
    }

    const students =
      (studentsResult.data as
        | Student[]
        | null) ?? [];

    const enquiries =
      (enquiriesResult.data as
        | DashboardEnquiry[]
        | null) ?? [];

    const payments =
      (paymentsResult.data as
        | Payment[]
        | null) ?? [];

    const attendance =
      (attendanceResult.data as DashboardAttendanceRow[] | null) ?? [];

    const feeDues =
      (feeDuesResult.data as
        | FeeDueDatabaseRow[]
        | null) ?? [];

    const recentPaymentRows =
      (recentPaymentsResult.data as
        | DashboardRecentPaymentRow[]
        | null) ?? [];

    const recentPayments:
      DashboardRecentPayment[] =
        recentPaymentRows.map(
          (payment) => {
            const relatedStudent =
              Array.isArray(
                payment.Students
              )
                ? payment.Students[0] ??
                  null
                : payment.Students;

            return {
              id: Number(payment.id),

              amount: Number(
                payment.amount ?? 0
              ),

              payment_date:
                payment.payment_date,

              payment_method:
                payment.payment_method,

              Students: relatedStudent
                ? {
                    Name:
                      relatedStudent.Name ??
                      null,
                  }
                : null,
            };
          }
        );

    const today = new Date();

    const todayString =
      getLocalDateString(today);

    const nextSevenDays =
      addDays(todayString, 7);

    const currentMonth =
      today.getMonth();

    const currentYear =
      today.getFullYear();

    const upcomingRenewals: DashboardUpcomingRenewal[] =
      students
        .filter((student) => {
          const endDate = student.membership_end_date;

          return Boolean(
            endDate &&
              endDate >= todayString &&
              endDate <= addDays(todayString, 30) &&
              student.membership_status !== "Cancelled"
          );
        })
        .map((student) => {
          const endDate = student.membership_end_date as string;
          const end = new Date(`${endDate}T00:00:00`);
          const start = new Date(`${todayString}T00:00:00`);
          const daysRemaining = Math.max(
            0,
            Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
          );

          return {
            studentId: Number(student.id),
            studentName: student.Name?.trim() || `Student #${student.id}`,
            membershipPlan:
              student.membership_plan?.trim() ||
              student.Program?.trim() ||
              null,
            endDate,
            daysRemaining,
          };
        })
        .sort((first, second) =>
          first.endDate.localeCompare(second.endDate)
        )
        .slice(0, 6);

    const birthdays =
      students.filter((student) => {
        if (!student.date_of_birth) {
          return false;
        }

        const [year, month, day] =
          student.date_of_birth
            .split("-")
            .map(Number);

        if (!year || !month || !day) {
          return false;
        }

        return (
          day === today.getDate() &&
          month ===
            today.getMonth() + 1
        );
      });

    const completedPayments =
      payments.filter(
        isCompletedPayment
      );

    const todayRevenue =
      completedPayments.reduce(
        (total, payment) => {
          if (
            payment.payment_date ===
            todayString
          ) {
            return (
              total +
              Number(payment.amount ?? 0)
            );
          }

          return total;
        },
        0
      );

    const monthRevenue =
      completedPayments.reduce(
        (total, payment) => {
          const paymentDate = new Date(
            `${payment.payment_date}T00:00:00`
          );

          if (
            paymentDate.getMonth() ===
              currentMonth &&
            paymentDate.getFullYear() ===
              currentYear
          ) {
            return (
              total +
              Number(payment.amount ?? 0)
            );
          }

          return total;
        },
        0
      );

    const todayAttendanceRecords =
      attendance.filter(
        (record) =>
          record.date === todayString
      );

    const todayPresent =
      todayAttendanceRecords.filter(
        (record) =>
          isPresentStatus(record.status)
      ).length;

    const totalOutstanding =
      feeDues
        .filter((feeDue) =>
          isActiveFeeDueStatus(
            feeDue.status
          )
        )
        .reduce(
          (total, feeDue) =>
            total +
            Number(
              feeDue.amount_due ?? 0
            ),
          0
        );

    const stats: DashboardStats = {
      totalStudents:
        students.length,

      activeStudents:
        students.filter(
          (student) =>
            student.Status === "Active"
        ).length,

      frozenStudents:
        students.filter(
          (student) =>
            student.membership_frozen
        ).length,

      newEnquiries:
        enquiries.filter(
          (enquiry) =>
            enquiry.Status === "New"
        ).length,

      todayAttendance:
        todayPresent,

      monthRevenue:
        Number(monthRevenue.toFixed(2)),

      feesDue:
        Number(
          totalOutstanding.toFixed(2)
        ),
    };

    const studentsById =
      new Map<number, Student>();

    students.forEach((student) => {
      studentsById.set(
        Number(student.id),
        student
      );
    });

    const recentCheckIns: DashboardCheckIn[] =
      todayAttendanceRecords
        .filter((record) => isPresentStatus(record.status))
        .map((record) => {
          const student = record.student_id
            ? studentsById.get(Number(record.student_id))
            : null;

          return {
            id: Number(record.id),
            studentId: record.student_id ? Number(record.student_id) : null,
            studentName:
              student?.Name?.trim() ||
              (record.student_id
                ? `Student #${record.student_id}`
                : "Walk-in student"),
            program:
              student?.Program?.trim() ||
              student?.membership_plan?.trim() ||
              null,
            checkInTime: record.check_in_time,
            sessionName: record.session_name,
            status: record.status?.trim() || "Present",
          };
        })
        .sort((first, second) =>
          (second.checkInTime || "").localeCompare(first.checkInTime || "")
        )
        .slice(0, 8);

    const allActionFeeDues:
      DashboardFeeDue[] =
        feeDues
          .map((feeDue) => {
            const status =
              calculateDashboardFeeDueStatus(
                feeDue.due_date,
                feeDue.status,
                todayString,
                nextSevenDays
              );

            if (!status) {
              return null;
            }

            const student =
              studentsById.get(
                Number(
                  feeDue.student_id
                )
              );

            return {
              id: Number(feeDue.id),

              student_id:
                Number(
                  feeDue.student_id
                ),

              student_name:
                student?.Name?.trim() ||
                `Student #${feeDue.student_id}`,

              student_phone:
                student?.Phone?.trim() ||
                "",

              amount_due:
                Number(
                  feeDue.amount_due ?? 0
                ),

              due_date:
                feeDue.due_date,

              status,

              membership_plan:
                feeDue.membership_plan
                  ?.trim() ||
                student?.membership_plan
                  ?.trim() ||
                student?.Program
                  ?.trim() ||
                null,

              reminder_count:
                Number(
                  feeDue.reminder_count ??
                    0
                ),
            };
          })
          .filter(
            (
              feeDue
            ): feeDue is DashboardFeeDue =>
              feeDue !== null
          )
          .sort(
            (first, second) => {
              const priorityDifference =
                getFeeDuePriority(
                  first.status
                ) -
                getFeeDuePriority(
                  second.status
                );

              if (
                priorityDifference !== 0
              ) {
                return priorityDifference;
              }

              return first.due_date.localeCompare(
                second.due_date
              );
            }
          );

    const feeDueSummary =
      calculateFeeDueSummary(
        allActionFeeDues
      );

    const activeEnquiries =
      enquiries.filter(
        (enquiry) =>
          !isFinishedEnquiryStatus(
            enquiry.Status
          )
      );

    const overdueFollowUps =
      activeEnquiries.filter(
        (enquiry) =>
          Boolean(
            enquiry.Follow_up_date &&
              enquiry.Follow_up_date <
                todayString
          )
      );

    const todayFollowUps =
      activeEnquiries.filter(
        (enquiry) =>
          enquiry.Follow_up_date ===
          todayString
      );

    const todayTrials =
      activeEnquiries.filter(
        (enquiry) =>
          enquiry.trial_date ===
          todayString
      );

    const receptionArrivals: DashboardReceptionArrival[] = [
      ...todayTrials.map((enquiry) => ({
        id: Number(enquiry.id),
        name: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        phone: enquiry.Phone?.trim() || null,
        program: enquiry.Program?.trim() || null,
        kind: "Trial" as const,
        status: "Expected" as const,
        href: "/trials",
      })),
      ...overdueFollowUps.map((enquiry) => ({
        id: Number(enquiry.id),
        name: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        phone: enquiry.Phone?.trim() || null,
        program: enquiry.Program?.trim() || null,
        kind: "Follow-up" as const,
        status: "Overdue" as const,
        href: "/enquiries",
      })),
      ...todayFollowUps.map((enquiry) => ({
        id: Number(enquiry.id),
        name: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        phone: enquiry.Phone?.trim() || null,
        program: enquiry.Program?.trim() || null,
        kind: "Follow-up" as const,
        status: "Due today" as const,
        href: "/enquiries",
      })),
    ]
      .sort((first, second) => {
        const order = { Overdue: 0, Expected: 1, "Due today": 2 };
        return order[first.status] - order[second.status];
      })
      .slice(0, 10);

    const feePriorityActions:
      DashboardPriorityAction[] =
        allActionFeeDues
          .filter(
            (feeDue) =>
              feeDue.status ===
                "Overdue" ||
              feeDue.status ===
                "Due Today"
          )
          .map((feeDue) => ({
            id: `fee-${feeDue.id}`,
            type: "Fee Due",
            priority:
              feeDue.status ===
              "Overdue"
                ? "Urgent"
                : "Today",
            title:
              feeDue.student_name,
            description:
              feeDue.status ===
              "Overdue"
                ? `Fee of ₹${feeDue.amount_due.toLocaleString(
                    "en-IN"
                  )} is overdue.`
                : `Fee of ₹${feeDue.amount_due.toLocaleString(
                    "en-IN"
                  )} is due today.`,
            href: "/fee-dues",
            phone:
              feeDue.student_phone ||
              null,
            amount:
              feeDue.amount_due,
            actionDate:
              feeDue.due_date,
          }));

    const followUpActions:
      DashboardPriorityAction[] = [
        ...overdueFollowUps.map(
          (enquiry) => ({
            id: `follow-up-overdue-${enquiry.id}`,
            type:
              "Enquiry Follow-up" as const,
            priority:
              "Urgent" as const,
            title:
              enquiry.Name?.trim() ||
              `Enquiry #${enquiry.id}`,
            description:
              enquiry.Program?.trim()
                ? `${enquiry.Program} follow-up is overdue.`
                : "Enquiry follow-up is overdue.",
            href: "/enquiries",
            phone:
              enquiry.Phone?.trim() ||
              null,
            amount: null,
            actionDate:
              enquiry.Follow_up_date ??
              null,
          })
        ),

        ...todayFollowUps.map(
          (enquiry) => ({
            id: `follow-up-today-${enquiry.id}`,
            type:
              "Enquiry Follow-up" as const,
            priority:
              "Today" as const,
            title:
              enquiry.Name?.trim() ||
              `Enquiry #${enquiry.id}`,
            description:
              enquiry.Program?.trim()
                ? `Follow up about ${enquiry.Program} today.`
                : "Enquiry follow-up is due today.",
            href: "/enquiries",
            phone:
              enquiry.Phone?.trim() ||
              null,
            amount: null,
            actionDate:
              enquiry.Follow_up_date ??
              null,
          })
        ),
      ];

    const trialActions:
      DashboardPriorityAction[] =
        todayTrials.map((enquiry) => ({
          id: `trial-${enquiry.id}`,
          type: "Trial Class",
          priority: "Today",
          title:
            enquiry.Name?.trim() ||
            `Enquiry #${enquiry.id}`,
          description:
            enquiry.Program?.trim()
              ? `${enquiry.Program} trial is scheduled today.`
              : "Trial class is scheduled today.",
          href: "/enquiries",
          phone:
            enquiry.Phone?.trim() ||
            null,
          amount: null,
          actionDate:
            enquiry.trial_date ?? null,
        }));

    const birthdayActions:
      DashboardPriorityAction[] =
        birthdays.map((student) => ({
          id: `birthday-${student.id}`,
          type: "Birthday",
          priority: "Today",
          title:
            student.Name?.trim() ||
            `Student #${student.id}`,
          description:
            "Student birthday today.",
          href: `/students/${student.id}`,
          phone:
            student.Phone?.trim() ||
            null,
          amount: null,
          actionDate:
            student.date_of_birth ??
            null,
        }));

    const priorityActions = [
      ...feePriorityActions,
      ...followUpActions,
      ...trialActions,
      ...birthdayActions,
    ]
      .sort((first, second) => {
        const priorityDifference =
          getActionPriority(
            first.priority
          ) -
          getActionPriority(
            second.priority
          );

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return first.title.localeCompare(
          second.title
        );
      })
      .slice(0, 12);

    const commandSummary:
      DashboardCommandSummary = {
        todayRevenue:
          Number(
            todayRevenue.toFixed(2)
          ),

        todayPresent,

        overdueFollowUps:
          overdueFollowUps.length,

        todayFollowUps:
          todayFollowUps.length,

        todayTrials:
          todayTrials.length,

        todayBirthdays:
          birthdays.length,

        urgentTasks:
          priorityActions.filter(
            (action) =>
              action.priority ===
              "Urgent"
          ).length,
      };

    return {
      stats,
      commandSummary,
      priorityActions,
      birthdays,
      recentPayments,

      recentEnquiries:
        [...enquiries]
          .sort(
            (first, second) =>
              new Date(
                second.created_at
              ).getTime() -
              new Date(
                first.created_at
              ).getTime()
          )
          .slice(0, 5) as Enquiry[],

      urgentFeeDues:
        allActionFeeDues.slice(0, 9),

      feeDueSummary,
      upcomingRenewals,
      recentCheckIns,
      receptionArrivals,
    };
  }
}

export const dashboardService =
  new DashboardService();
