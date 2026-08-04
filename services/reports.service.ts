import { supabase } from "@/lib/supabase";

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportTrendPoint {
  date: string;
  label: string;
  revenue: number;
  membershipRevenue: number;
  eventRevenue: number;
  refunds: number;
  attendance: number;
  enquiries: number;
}

export interface ReportBreakdownPoint {
  name: string;
  value: number;
}

export interface ReportSummary {
  revenue: number;
  membershipRevenue: number;
  eventRevenue: number;
  membershipRefunds: number;
  eventRefunds: number;
  grossRevenue: number;
  paymentCount: number;
  averagePayment: number;
  attendance: number;
  activeStudents: number;
  newStudents: number;
  enquiries: number;
  convertedEnquiries: number;
  enquiryConversionRate: number;
  trials: number;
  trialsAttended: number;
  trialConversionRate: number;
  outstandingFees: number;
  overdueFees: number;
  renewalsDue: number;
}

export interface ReportsData {
  range: ReportDateRange;
  summary: ReportSummary;
  trend: ReportTrendPoint[];
  paymentMethods: ReportBreakdownPoint[];
  membershipPlans: ReportBreakdownPoint[];
  enquiryStatuses: ReportBreakdownPoint[];
  trialOutcomes: ReportBreakdownPoint[];
  feeDueStatus: ReportBreakdownPoint[];
  topPrograms: ReportBreakdownPoint[];
}

interface PaymentRow {
  id: number;
  amount: number | string | null;
  payment_date: string;
  payment_method: string | null;
  payment_status: string | null;
}

interface EventPaymentRow { id: number; amount_paid: number | string | null; payment_status: string; payment_verified_at: string | null; }
interface EventRefundRow { id: number; amount: number | string; created_at: string; reason: string; }

interface AttendanceRow {
  id: number;
  date: string | null;
  status: string | null;
}

interface StudentRow {
  id: number;
  Program: string | null;
  Status: string | null;
  join_date: string | null;
  membership_plan: string | null;
  membership_end_date: string | null;
  membership_status: string | null;
}

interface EnquiryRow {
  id: number;
  created_at: string;
  Program: string | null;
  Status: string | null;
  trial_date: string | null;
  trial_status: string | null;
  trial_outcome: string | null;
}

interface FeeDueRow {
  id: number;
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

function isCompletedPayment(status: string | null): boolean {
  if (!status) return true;
  return ["paid", "completed", "success"].includes(status.trim().toLowerCase());
}

function isPresent(status: string | null): boolean {
  return status?.trim().toLowerCase() === "present";
}

function isClosedFeeDue(status: string | null): boolean {
  return ["paid", "waived", "cancelled"].includes(status?.trim().toLowerCase() ?? "");
}

function isConvertedEnquiry(status: string | null): boolean {
  return ["joined", "converted"].includes(status?.trim().toLowerCase() ?? "");
}

function increment(map: Map<string, number>, key: string, amount = 1): void {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function toBreakdown(map: Map<string, number>): ReportBreakdownPoint[] {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((first, second) => second.value - first.value);
}

class ReportsService {
  async getReportsData(range: ReportDateRange): Promise<ReportsData> {
    const [paymentsResult, eventPaymentsResult, eventRefundsResult, attendanceResult, studentsResult, enquiriesResult, feeDuesResult] =
      await Promise.all([
        supabase
          .from("Payments")
          .select("id,amount,payment_date,payment_method,payment_status"),
        supabase.from("Event_Registrations").select("id,amount_paid,payment_status,payment_verified_at"),
        supabase.from("Event_Refunds").select("id,amount,created_at,reason"),
        supabase.from("Attendance").select("id,date,status"),
        supabase
          .from("Students")
          .select(
            "id,Program,Status,join_date,membership_plan,membership_end_date,membership_status"
          ),
        supabase
          .from("Enquiries")
          .select(
            "id,created_at,Program,Status,trial_date,trial_status,trial_outcome"
          ),
        supabase.from("fee_dues").select("id,amount_due,due_date,status"),
      ]);

    if (paymentsResult.error) throw paymentsResult.error;
    if (eventPaymentsResult.error) throw eventPaymentsResult.error;
    if (eventRefundsResult.error) throw eventRefundsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (studentsResult.error) throw studentsResult.error;
    if (enquiriesResult.error) throw enquiriesResult.error;
    if (feeDuesResult.error) throw feeDuesResult.error;

    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const eventPayments = (eventPaymentsResult.data ?? []) as EventPaymentRow[];
    const eventRefunds = (eventRefundsResult.data ?? []) as EventRefundRow[];
    const attendance = (attendanceResult.data ?? []) as AttendanceRow[];
    const students = (studentsResult.data ?? []) as StudentRow[];
    const enquiries = (enquiriesResult.data ?? []) as EnquiryRow[];
    const feeDues = (feeDuesResult.data ?? []) as FeeDueRow[];

    const dateInRange = (date: string | null | undefined): boolean =>
      Boolean(date && date >= range.startDate && date <= range.endDate);

    const rangePayments = payments.filter(
      (payment) =>
        dateInRange(payment.payment_date) && isCompletedPayment(payment.payment_status)
    );
    const rangeMembershipRefunds = payments.filter((payment) => dateInRange(payment.payment_date) && payment.payment_status?.trim().toLowerCase() === "refunded");
    const rangeEventPayments = eventPayments.filter((payment) => payment.payment_status === "Paid" && dateInRange(payment.payment_verified_at?.slice(0, 10)));
    const rangeEventRefunds = eventRefunds.filter((refund) => dateInRange(refund.created_at.slice(0, 10)));
    const rangeAttendance = attendance.filter(
      (record) => dateInRange(record.date) && isPresent(record.status)
    );
    const rangeEnquiries = enquiries.filter((enquiry) =>
      dateInRange(enquiry.created_at.slice(0, 10))
    );
    const rangeTrials = enquiries.filter((enquiry) => dateInRange(enquiry.trial_date));

    const membershipRevenue = rangePayments.reduce(
      (total, payment) => total + Number(payment.amount ?? 0),
      0
    );
    const eventRevenue = rangeEventPayments.reduce((total, payment) => total + Number(payment.amount_paid ?? 0), 0);
    const membershipRefunds = rangeMembershipRefunds.reduce((total, payment) => total + Number(payment.amount ?? 0), 0);
    const eventRefundAmount = rangeEventRefunds.reduce((total, refund) => total + Number(refund.amount), 0);
    const grossRevenue = membershipRevenue + eventRevenue;
    const revenue = grossRevenue - membershipRefunds - eventRefundAmount;
    const convertedEnquiries = rangeEnquiries.filter((enquiry) =>
      isConvertedEnquiry(enquiry.Status)
    ).length;
    const trialsAttended = rangeTrials.filter(
      (enquiry) => enquiry.trial_status === "Attended"
    ).length;
    const trialsJoined = rangeTrials.filter(
      (enquiry) =>
        enquiry.trial_outcome === "Joined" || isConvertedEnquiry(enquiry.Status)
    ).length;

    const today = getLocalDateString();
    const openFeeDues = feeDues.filter((feeDue) => !isClosedFeeDue(feeDue.status));
    const outstandingFees = openFeeDues.reduce(
      (total, feeDue) => total + Number(feeDue.amount_due ?? 0),
      0
    );
    const overdueFees = openFeeDues
      .filter((feeDue) => feeDue.due_date < today)
      .reduce((total, feeDue) => total + Number(feeDue.amount_due ?? 0), 0);

    const dayMap = new Map<string, ReportTrendPoint>();
    let cursor = range.startDate;
    while (cursor <= range.endDate) {
      const [year, month, day] = cursor.split("-").map(Number);
      dayMap.set(cursor, {
        date: cursor,
        label: new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
        }).format(new Date(year, month - 1, day)),
        revenue: 0,
        membershipRevenue: 0,
        eventRevenue: 0,
        refunds: 0,
        attendance: 0,
        enquiries: 0,
      });
      cursor = addDays(cursor, 1);
    }

    rangePayments.forEach((payment) => {
      const point = dayMap.get(payment.payment_date);
      if (point) { point.membershipRevenue += Number(payment.amount ?? 0); point.revenue += Number(payment.amount ?? 0); }
    });
    rangeEventPayments.forEach((payment) => { const point = payment.payment_verified_at ? dayMap.get(payment.payment_verified_at.slice(0, 10)) : null; if (point) { point.eventRevenue += Number(payment.amount_paid ?? 0); point.revenue += Number(payment.amount_paid ?? 0); } });
    rangeMembershipRefunds.forEach((payment) => { const point = dayMap.get(payment.payment_date); if (point) { point.refunds += Number(payment.amount ?? 0); point.revenue -= Number(payment.amount ?? 0); } });
    rangeEventRefunds.forEach((refund) => { const point = dayMap.get(refund.created_at.slice(0, 10)); if (point) { point.refunds += Number(refund.amount); point.revenue -= Number(refund.amount); } });
    rangeAttendance.forEach((record) => {
      const point = record.date ? dayMap.get(record.date) : null;
      if (point) point.attendance += 1;
    });
    rangeEnquiries.forEach((enquiry) => {
      const point = dayMap.get(enquiry.created_at.slice(0, 10));
      if (point) point.enquiries += 1;
    });

    const paymentMethods = new Map<string, number>();
    rangePayments.forEach((payment) =>
      increment(paymentMethods, payment.payment_method?.trim() || "Not recorded", Number(payment.amount ?? 0))
    );

    const membershipPlans = new Map<string, number>();
    students.forEach((student) =>
      increment(membershipPlans, student.membership_plan?.trim() || "Not assigned")
    );

    const enquiryStatuses = new Map<string, number>();
    rangeEnquiries.forEach((enquiry) =>
      increment(enquiryStatuses, enquiry.Status?.trim() || "New")
    );

    const trialOutcomes = new Map<string, number>();
    rangeTrials.forEach((enquiry) =>
      increment(trialOutcomes, enquiry.trial_outcome?.trim() || "Pending")
    );

    const feeDueStatus = new Map<string, number>();
    openFeeDues.forEach((feeDue) => {
      const status =
        feeDue.due_date < today
          ? "Overdue"
          : feeDue.due_date === today
            ? "Due Today"
            : "Upcoming";
      increment(feeDueStatus, status, Number(feeDue.amount_due ?? 0));
    });

    const topPrograms = new Map<string, number>();
    students.forEach((student) =>
      increment(topPrograms, student.Program?.trim() || "Not assigned")
    );

    const summary: ReportSummary = {
      revenue: Number(revenue.toFixed(2)),
      membershipRevenue: Number(membershipRevenue.toFixed(2)),
      eventRevenue: Number(eventRevenue.toFixed(2)),
      membershipRefunds: Number(membershipRefunds.toFixed(2)),
      eventRefunds: Number(eventRefundAmount.toFixed(2)),
      grossRevenue: Number(grossRevenue.toFixed(2)),
      paymentCount: rangePayments.length + rangeEventPayments.length,
      averagePayment:
        rangePayments.length + rangeEventPayments.length > 0 ? Number((grossRevenue / (rangePayments.length + rangeEventPayments.length)).toFixed(2)) : 0,
      attendance: rangeAttendance.length,
      activeStudents: students.filter((student) => student.Status === "Active").length,
      newStudents: students.filter((student) => dateInRange(student.join_date)).length,
      enquiries: rangeEnquiries.length,
      convertedEnquiries,
      enquiryConversionRate:
        rangeEnquiries.length > 0
          ? Number(((convertedEnquiries / rangeEnquiries.length) * 100).toFixed(1))
          : 0,
      trials: rangeTrials.length,
      trialsAttended,
      trialConversionRate:
        rangeTrials.length > 0
          ? Number(((trialsJoined / rangeTrials.length) * 100).toFixed(1))
          : 0,
      outstandingFees: Number(outstandingFees.toFixed(2)),
      overdueFees: Number(overdueFees.toFixed(2)),
      renewalsDue: students.filter(
        (student) =>
          student.membership_end_date &&
          student.membership_end_date >= today &&
          student.membership_end_date <= addDays(today, 30) &&
          student.membership_status !== "Cancelled"
      ).length,
    };

    return {
      range,
      summary,
      trend: [...dayMap.values()],
      paymentMethods: toBreakdown(paymentMethods),
      membershipPlans: toBreakdown(membershipPlans),
      enquiryStatuses: toBreakdown(enquiryStatuses),
      trialOutcomes: toBreakdown(trialOutcomes),
      feeDueStatus: toBreakdown(feeDueStatus),
      topPrograms: toBreakdown(topPrograms).slice(0, 8),
    };
  }
}

export const reportsService = new ReportsService();
