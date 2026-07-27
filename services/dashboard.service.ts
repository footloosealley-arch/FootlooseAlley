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

export interface DashboardData {
  stats: DashboardStats;
  birthdays: Student[];
  recentPayments: DashboardRecentPayment[];
  recentEnquiries: Enquiry[];
  urgentFeeDues: DashboardFeeDue[];
  feeDueSummary: DashboardFeeDueSummary;
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
  return (
    status === "Paid" ||
    status === "Waived" ||
    status === "Cancelled"
  );
}

function isActiveFeeDueStatus(
  status: string | null
): boolean {
  return !isClosedFeeDueStatus(status);
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
      birthdaysResult,
      recentPaymentsResult,
      feeDuesResult,
    ] = await Promise.all([
      supabase
        .from("Students")
        .select("*"),

      supabase
        .from("Attendance")
        .select("id,date,status"),

      supabase
        .from("Enquiries")
        .select("*"),

      supabase
        .from("Payments")
        .select("*"),

      supabase
        .from("Students")
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

    if (birthdaysResult.error) {
      throw birthdaysResult.error;
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
        | Enquiry[]
        | null) ?? [];

    const payments =
      (paymentsResult.data as
        | Payment[]
        | null) ?? [];

    const attendance =
      attendanceResult.data ?? [];

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
              id:
                Number(payment.id),

              amount:
                Number(
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

    const birthdays =
      (
        (birthdaysResult.data as
          | Student[]
          | null) ?? []
      ).filter((student) => {
        if (!student.date_of_birth) {
          return false;
        }

        const dateParts =
          student.date_of_birth
            .split("-")
            .map(Number);

        if (dateParts.length !== 3) {
          return false;
        }

        const [, month, day] =
          dateParts;

        return (
          day === today.getDate() &&
          month ===
            today.getMonth() + 1
        );
      });

    const currentMonth =
      today.getMonth();

    const currentYear =
      today.getFullYear();

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
        attendance.filter(
          (record) =>
            record.date === todayString
        ).length,

      monthRevenue:
        payments.reduce(
          (total, payment) => {
            const paymentDate =
              new Date(
                payment.payment_date
              );

            if (
              paymentDate.getMonth() ===
                currentMonth &&
              paymentDate.getFullYear() ===
                currentYear
            ) {
              return (
                total +
                Number(payment.amount)
              );
            }

            return total;
          },
          0
        ),

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
              id:
                Number(feeDue.id),

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
                  feeDue.amount_due ??
                    0
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

    return {
      stats,
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
          .slice(0, 5),

      urgentFeeDues:
        allActionFeeDues.slice(0, 9),

      feeDueSummary,
    };
  }
}

export const dashboardService =
  new DashboardService();