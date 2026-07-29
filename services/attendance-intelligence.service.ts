import { supabase } from "@/lib/supabase";

export type AttendanceRiskReason =
  | "No Recent Attendance"
  | "Consecutive Absences"
  | "Low Attendance";

export type AttendanceRiskPriority = "Urgent" | "Attention";
export type AttendanceRiskActionStatus = "Completed" | "Postponed";

export interface AttendanceRisk {
  key: string;
  studentId: number;
  name: string;
  phone: string | null;
  program: string | null;
  reason: AttendanceRiskReason;
  priority: AttendanceRiskPriority;
  detail: string;
  lastPresentDate: string | null;
  consecutiveAbsences: number;
  attendanceRate: number | null;
  markedClasses: number;
  whatsappUrl: string | null;
  actionStatus: AttendanceRiskActionStatus | null;
  postponedUntil: string | null;
  completedAt: string | null;
}

type StudentRow = {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  join_date: string | null;
  whatsapp_enabled: boolean | null;
};

type AttendanceRow = {
  student_id: number | null;
  date: string | null;
  status: string | null;
};

type ActionRow = {
  reminder_key: string;
  action_status: AttendanceRiskActionStatus;
  postponed_until: string | null;
  completed_at: string | null;
};

export function attendanceLocalDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function attendanceAddDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return attendanceLocalDate(date);
}

function daysBetween(earlier: string, later: string): number {
  const start = new Date(`${earlier}T00:00:00`);
  const end = new Date(`${later}T00:00:00`);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
}

function formatDate(dateValue: string): string {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function normalizeStatus(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function activeStudent(value: string | null): boolean {
  return !["inactive", "cancelled", "canceled", "deleted"].includes(
    normalizeStatus(value)
  );
}

function whatsappNumber(phone: string | null): string {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return "";
}

function whatsappUrl(
  phone: string | null,
  name: string,
  program: string | null
): string | null {
  const number = whatsappNumber(phone);
  if (!number) return null;

  const firstName = name.trim().split(/\s+/)[0] || "there";
  const message = `Hi ${firstName}, we missed you at Footloose Alley Dance and Fitness Studio! We hope everything is well. Come back and join your ${
    program || "class"
  } session soon — we would love to see you. Please reply if you need any help.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function riskCode(reason: AttendanceRiskReason): string {
  if (reason === "No Recent Attendance") return "no-recent";
  if (reason === "Consecutive Absences") return "consecutive";
  return "low-rate";
}

class AttendanceIntelligenceService {
  async getRisks(): Promise<AttendanceRisk[]> {
    const today = attendanceLocalDate();
    const sevenDaysAgo = attendanceAddDays(today, -7);
    const fourteenDaysAgo = attendanceAddDays(today, -14);
    const thirtyDaysAgo = attendanceAddDays(today, -30);
    const ninetyDaysAgo = attendanceAddDays(today, -90);

    const [studentsResult, attendanceResult, actionsResult] = await Promise.all([
      supabase
        .from("Students")
        .select("id,Name,Phone,Program,Status,join_date,whatsapp_enabled"),
      supabase
        .from("Attendance")
        .select("student_id,date,status")
        .gte("date", ninetyDaysAgo)
        .lte("date", today)
        .order("date", { ascending: false }),
      supabase
        .from("Daily_Follow_Up_Actions")
        .select("reminder_key,action_status,postponed_until,completed_at")
        .eq("reminder_type", "Attendance"),
    ]);

    const firstError =
      studentsResult.error || attendanceResult.error || actionsResult.error;
    if (firstError) {
      throw new Error(firstError.message || "Unable to load attendance risks.");
    }

    const students = (studentsResult.data ?? []) as unknown as StudentRow[];
    const records = (attendanceResult.data ?? []) as unknown as AttendanceRow[];
    const actions = (actionsResult.data ?? []) as unknown as ActionRow[];
    const actionByKey = new Map(
      actions.map((action) => [action.reminder_key, action])
    );
    const recordsByStudent = new Map<number, AttendanceRow[]>();

    for (const record of records) {
      if (!record.student_id || !record.date) continue;
      const studentRecords = recordsByStudent.get(record.student_id) ?? [];
      studentRecords.push(record);
      recordsByStudent.set(record.student_id, studentRecords);
    }

    const risks: AttendanceRisk[] = [];

    for (const student of students.filter((item) => activeStudent(item.Status))) {
      const studentRecords = (recordsByStudent.get(student.id) ?? []).sort((a, b) =>
        (b.date ?? "").localeCompare(a.date ?? "")
      );
      const presentRecords = studentRecords.filter(
        (record) => normalizeStatus(record.status) === "present"
      );
      const lastPresentDate = presentRecords[0]?.date ?? null;
      const latestRecordDate = studentRecords[0]?.date ?? null;
      const recentRecords = studentRecords.filter(
        (record) => Boolean(record.date && record.date >= thirtyDaysAgo)
      );
      const recentPresent = recentRecords.filter(
        (record) => normalizeStatus(record.status) === "present"
      ).length;
      const attendanceRate =
        recentRecords.length >= 4
          ? Math.round((recentPresent / recentRecords.length) * 100)
          : null;

      let consecutiveAbsences = 0;
      for (const record of studentRecords) {
        if (normalizeStatus(record.status) !== "absent") break;
        consecutiveAbsences += 1;
      }

      const joinedLongEnough =
        !student.join_date || student.join_date <= sevenDaysAgo;
      const noRecentAttendance =
        joinedLongEnough &&
        (!lastPresentDate || lastPresentDate <= sevenDaysAgo);

      let reason: AttendanceRiskReason | null = null;
      let priority: AttendanceRiskPriority = "Attention";
      let detail = "";

      if (noRecentAttendance) {
        reason = "No Recent Attendance";
        priority =
          !lastPresentDate || lastPresentDate <= fourteenDaysAgo
            ? "Urgent"
            : "Attention";
        detail = lastPresentDate
          ? `Last present ${formatDate(lastPresentDate)} (${daysBetween(
              lastPresentDate,
              today
            )} days ago).`
          : "No present attendance recorded during the past 90 days.";
      } else if (consecutiveAbsences >= 3) {
        reason = "Consecutive Absences";
        priority = "Urgent";
        detail = `${consecutiveAbsences} consecutive absences are recorded.`;
      } else if (attendanceRate !== null && attendanceRate < 50) {
        reason = "Low Attendance";
        detail = `${attendanceRate}% attendance across ${recentRecords.length} marked classes in the past 30 days.`;
      }

      if (!reason) continue;

      const anchor =
        latestRecordDate || lastPresentDate || student.join_date || "no-record";
      const key = `attendance:${student.id}:${anchor}:${riskCode(reason)}`;
      const action = actionByKey.get(key);
      const name = student.Name?.trim() || `Student #${student.id}`;
      const phone = student.whatsapp_enabled === false ? null : student.Phone;

      risks.push({
        key,
        studentId: student.id,
        name,
        phone,
        program: student.Program,
        reason,
        priority,
        detail,
        lastPresentDate,
        consecutiveAbsences,
        attendanceRate,
        markedClasses: recentRecords.length,
        whatsappUrl: whatsappUrl(phone, name, student.Program),
        actionStatus: action?.action_status ?? null,
        postponedUntil: action?.postponed_until ?? null,
        completedAt: action?.completed_at ?? null,
      });
    }

    return risks.sort(
      (left, right) =>
        Number(right.priority === "Urgent") -
          Number(left.priority === "Urgent") ||
        left.name.localeCompare(right.name)
    );
  }

  async complete(risk: AttendanceRisk): Promise<void> {
    const { error } = await supabase.rpc("complete_daily_follow_up", {
      target_reminder_key: risk.key,
      target_reminder_type: "Attendance",
    });
    if (error) {
      throw new Error(error.message || "Unable to complete attendance follow-up.");
    }
  }

  async postpone(risk: AttendanceRisk, until: string): Promise<void> {
    const { error } = await supabase.rpc("postpone_daily_follow_up", {
      target_reminder_key: risk.key,
      target_reminder_type: "Attendance",
      target_postponed_until: until,
    });
    if (error) {
      throw new Error(error.message || "Unable to postpone attendance follow-up.");
    }
  }
}

export const attendanceIntelligenceService =
  new AttendanceIntelligenceService();
