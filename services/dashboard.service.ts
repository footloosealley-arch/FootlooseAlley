import { supabase } from "@/lib/supabase";
import type {
  Student,
  Payment,
  Enquiry,
  DashboardStats,
} from "@/types/database";

export interface DashboardData {
  stats: DashboardStats;
  birthdays: Student[];
  recentPayments: any[];
  recentEnquiries: Enquiry[];
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
          *,
          Students(Name)
        `)
        .order("payment_date", {
          ascending: false,
        })
        .limit(5),
    ]);

    if (studentsResult.error) throw studentsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (enquiriesResult.error) throw enquiriesResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (birthdaysResult.error) throw birthdaysResult.error;
    if (recentPaymentsResult.error)
      throw recentPaymentsResult.error;

    const students =
      (studentsResult.data as Student[]) ?? [];

    const enquiries =
      (enquiriesResult.data as Enquiry[]) ?? [];

    const payments =
      (paymentsResult.data as Payment[]) ?? [];

    const attendance =
      attendanceResult.data ?? [];

    const today = new Date();

    const todayString =
      today.toISOString().split("T")[0];

    const birthdays =
      ((birthdaysResult.data as Student[]) ?? []).filter(
        (student) => {
          if (!student.date_of_birth) return false;

          const dob = new Date(student.date_of_birth);

          return (
            dob.getDate() === today.getDate() &&
            dob.getMonth() === today.getMonth()
          );
        }
      );

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const stats: DashboardStats = {
      totalStudents: students.length,

      activeStudents: students.filter(
        (s) => s.Status === "Active"
      ).length,

      frozenStudents: students.filter(
        (s) => s.membership_frozen
      ).length,

      newEnquiries: enquiries.filter(
        (e) => e.Status === "New"
      ).length,

      todayAttendance: attendance.filter(
        (a) => a.date === todayString
      ).length,

      monthRevenue: payments.reduce(
        (sum, payment) => {
          const paymentDate = new Date(
            payment.payment_date
          );

          if (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          ) {
            return sum + Number(payment.amount);
          }

          return sum;
        },
        0
      ),

      feesDue: students.reduce(
        (sum, student) =>
          sum + Number(student.Fees_due ?? 0),
        0
      ),
    };

    return {
      stats,
      birthdays,
      recentPayments:
        recentPaymentsResult.data ?? [],
      recentEnquiries: enquiries
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    };
  }
}

export const dashboardService =
  new DashboardService();