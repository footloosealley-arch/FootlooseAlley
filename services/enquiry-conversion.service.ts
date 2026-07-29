import { supabase } from "@/lib/supabase";

import {
  enquiriesService,
  type Enquiry,
} from "@/services/enquiries.service";

import {
  feeDuesService,
  type FeeDue,
} from "@/services/fee-dues.service";

import {
  studentsService,
} from "@/services/students.service";

import type {
  Student,
} from "@/types/database";

export const CONVERSION_MEMBERSHIP_PLANS = [
  "Monthly",
  "3 Months",
  "6 Months",
  "Yearly",
  "Custom",
] as const;

export type ConversionMembershipPlan =
  (typeof CONVERSION_MEMBERSHIP_PLANS)[number];

export interface ConvertEnquiryInput {
  enquiry: Enquiry;

  membershipPlan: ConversionMembershipPlan;

  membershipAmount: number;

  amountPaid?: number;

  joinDate: string;

  dueDate: string;

  billingPeriodStart?: string | null;

  billingPeriodEnd?: string | null;

  classId?: number | null;

  instructorId?: number | null;

  createFeeDue?: boolean;

  whatsappEnabled?: boolean;

  notes?: string | null;
}

export interface EnquiryConversionResult {
  enquiry: Enquiry;

  student: Student;

  feeDue: FeeDue | null;

  studentCreated: boolean;

  feeDueCreated: boolean;

  existingStudentUsed: boolean;
}

interface ExistingStudentRow
  extends Student {
  id: number;
}

function getLocalDateString(
  date: Date = new Date()
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanText(
  value:
    | string
    | null
    | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  return cleaned || null;
}

function normalizePhone(
  phone: string
): string {
  return phone
    .replace(/[^\d+]/g, "")
    .trim();
}

function validateDate(
  value: string,
  fieldName: string
): string {
  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      cleaned
    )
  ) {
    throw new Error(
      `${fieldName} must use YYYY-MM-DD format.`
    );
  }

  return cleaned;
}

function validateMoney(
  value: number,
  fieldName: string
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    throw new Error(
      `${fieldName} must be zero or greater.`
    );
  }

  return Number(
    parsed.toFixed(2)
  );
}

function validateOptionalId(
  value:
    | number
    | null
    | undefined,
  fieldName: string
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `${fieldName} is invalid.`
    );
  }

  return parsed;
}

function getFeeStatus(
  amountDue: number
): string {
  return amountDue > 0
    ? "Due"
    : "Paid";
}

function createStudentPayload(
  input: ConvertEnquiryInput
): Partial<Student> {
  const {
    enquiry,
  } = input;

  const membershipAmount =
    validateMoney(
      input.membershipAmount,
      "Membership amount"
    );

  const amountPaid =
    validateMoney(
      input.amountPaid ?? 0,
      "Amount paid"
    );

  const amountDue =
    Math.max(
      0,
      membershipAmount -
        amountPaid
    );

  const joinDate =
    validateDate(
      input.joinDate,
      "Join date"
    );

  const dueDate =
    validateDate(
      input.dueDate,
      "Due date"
    );

  return {
    Name:
      enquiry.name.trim(),

    Phone:
      enquiry.phone.trim(),

    Email:
      cleanText(
        enquiry.email
      ),

    Program:
      cleanText(
        enquiry.interested_in
      ),

    Fees:
      membershipAmount,

    Fees_due:
      amountDue,

    Status:
      "Active",

    Address:
      null,

    Emergency_contact:
      null,

    photo_url:
      null,

    membership_plan:
      input.membershipPlan,

    join_date:
      joinDate,

    date_of_birth:
      null,

    gender:
      enquiry.gender ?? null,

    next_due_date:
      dueDate,

    last_payment_date:
      amountPaid > 0
        ? joinDate
        : null,

    fee_status:
      getFeeStatus(
        amountDue
      ),

    student_code:
      null,

    batch:
      null,

    instructor_id:
      validateOptionalId(
        input.instructorId,
        "Instructor"
      ),

    medical_notes:
      null,

    attendance_percentage:
      0,

    whatsapp_enabled:
      input.whatsappEnabled ??
      true,

    notes:
      cleanText(
        input.notes
      ) ||
      cleanText(
        enquiry.notes
      ) ||
      `Converted from enquiry #${enquiry.id}.`,

    referred_by:
      enquiry.source
        ? `Enquiry: ${enquiry.source}`
        : null,

    membership_frozen:
      false,

    last_attendance:
      null,

    class_id:
      validateOptionalId(
        input.classId,
        "Class"
      ),
  };
}

async function findStudentByPhone(
  phone: string
): Promise<ExistingStudentRow | null> {
  const normalizedPhone =
    normalizePhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const directResult =
    await supabase
      .from("Students")
      .select("*")
      .eq(
        "Phone",
        phone.trim()
      )
      .limit(1)
      .maybeSingle();

  if (directResult.error) {
    throw new Error(
      directResult.error.message ||
        "Unable to check existing students."
    );
  }

  if (directResult.data) {
    return directResult.data as ExistingStudentRow;
  }

  const {
    data,
    error,
  } = await supabase
    .from("Students")
    .select("*")
    .limit(500);

  if (error) {
    throw new Error(
      error.message ||
        "Unable to check existing students."
    );
  }

  const matchingStudent =
    (
      (data ??
        []) as ExistingStudentRow[]
    ).find((student) => {
      return (
        normalizePhone(
          String(
            student.Phone ?? ""
          )
        ) === normalizedPhone
      );
    });

  return matchingStudent ?? null;
}

async function feeDueAlreadyExists(
  studentId: number,
  dueDate: string,
  membershipPlan: string
): Promise<FeeDue | null> {
  const studentFeeDues =
    await feeDuesService.getFeeDuesByStudentId(
      studentId
    );

  return (
    studentFeeDues.find(
      (feeDue) =>
        feeDue.due_date ===
          dueDate &&
        feeDue.membership_plan ===
          membershipPlan &&
        feeDue.status !==
          "Cancelled"
    ) ?? null
  );
}

async function safelyDeleteStudent(
  studentId: number
): Promise<void> {
  try {
    await studentsService.deleteStudent(
      studentId
    );
  } catch (
    rollbackError
  ) {
    console.error(
      "Student rollback failed:",
      rollbackError
    );
  }
}

async function safelyDeleteFeeDue(
  feeDueId: number
): Promise<void> {
  try {
    await feeDuesService.deleteFeeDue(
      feeDueId
    );
  } catch (
    rollbackError
  ) {
    console.error(
      "Fee-due rollback failed:",
      rollbackError
    );
  }
}

export const enquiryConversionService = {
  getDefaultMembershipAmount(
    plan: ConversionMembershipPlan
  ): number {
    switch (plan) {
      case "Monthly":
        return 2500;

      case "3 Months":
        return 6000;

      case "6 Months":
        return 10000;

      case "Yearly":
        return 18000;

      case "Custom":
      default:
        return 0;
    }
  },

  getMembershipEndDate(
    startDate: string,
    plan: ConversionMembershipPlan
  ): string {
    const validStartDate =
      validateDate(
        startDate,
        "Membership start date"
      );

    const [
      year,
      month,
      day,
    ] = validStartDate
      .split("-")
      .map(Number);

    const endDate =
      new Date(
        year,
        month - 1,
        day
      );

    switch (plan) {
      case "Monthly":
        endDate.setMonth(
          endDate.getMonth() + 1
        );
        break;

      case "3 Months":
        endDate.setMonth(
          endDate.getMonth() + 3
        );
        break;

      case "6 Months":
        endDate.setMonth(
          endDate.getMonth() + 6
        );
        break;

      case "Yearly":
        endDate.setFullYear(
          endDate.getFullYear() + 1
        );
        break;

      case "Custom":
      default:
        return validStartDate;
    }

    endDate.setDate(
      endDate.getDate() - 1
    );

    return getLocalDateString(
      endDate
    );
  },

  async convertEnquiry(
    input: ConvertEnquiryInput
  ): Promise<EnquiryConversionResult> {
    const {
      enquiry,
    } = input;

    if (
      !Number.isInteger(
        enquiry.id
      ) ||
      enquiry.id <= 0
    ) {
      throw new Error(
        "Invalid enquiry."
      );
    }

    if (
      enquiry.converted_student_id
    ) {
      const convertedStudent =
        await studentsService.getStudentById(
          enquiry.converted_student_id
        );

      if (convertedStudent) {
        return {
          enquiry,
          student:
            convertedStudent,
          feeDue:
            null,
          studentCreated:
            false,
          feeDueCreated:
            false,
          existingStudentUsed:
            true,
        };
      }
    }

    const membershipAmount =
      validateMoney(
        input.membershipAmount,
        "Membership amount"
      );

    const amountPaid =
      validateMoney(
        input.amountPaid ?? 0,
        "Amount paid"
      );

    if (
      amountPaid >
      membershipAmount
    ) {
      throw new Error(
        "Amount paid cannot be greater than the membership amount."
      );
    }

    const joinDate =
      validateDate(
        input.joinDate,
        "Join date"
      );

    const dueDate =
      validateDate(
        input.dueDate,
        "Due date"
      );

    const billingPeriodStart =
      input.billingPeriodStart
        ? validateDate(
            input.billingPeriodStart,
            "Billing period start"
          )
        : joinDate;

    const billingPeriodEnd =
      input.billingPeriodEnd
        ? validateDate(
            input.billingPeriodEnd,
            "Billing period end"
          )
        : this.getMembershipEndDate(
            billingPeriodStart,
            input.membershipPlan
          );

    const amountDue =
      Number(
        Math.max(
          0,
          membershipAmount -
            amountPaid
        ).toFixed(2)
      );

    let student:
      Student | null = null;

    let createdFeeDue:
      FeeDue | null = null;

    let studentCreated =
      false;

    let existingStudentUsed =
      false;

    try {
      const existingStudent =
        await findStudentByPhone(
          enquiry.phone
        );

      if (existingStudent) {
        student =
          existingStudent;

        existingStudentUsed =
          true;
      } else {
        const studentPayload =
          createStudentPayload({
            ...input,
            membershipAmount,
            amountPaid,
            joinDate,
            dueDate,
            billingPeriodStart,
            billingPeriodEnd,
          });

        student =
          await studentsService.createStudent(
            studentPayload
          );

        studentCreated =
          true;
      }

      const studentId =
        Number(student.id);

      if (
        !Number.isInteger(
          studentId
        ) ||
        studentId <= 0
      ) {
        throw new Error(
          "The student was created without a valid ID."
        );
      }

      const shouldCreateFeeDue =
        input.createFeeDue !==
          false &&
        amountDue > 0;

      if (shouldCreateFeeDue) {
        const existingFeeDue =
          await feeDueAlreadyExists(
            studentId,
            dueDate,
            input.membershipPlan
          );

        if (existingFeeDue) {
          createdFeeDue =
            existingFeeDue;
        } else {
          createdFeeDue =
            await feeDuesService.createFeeDue(
              {
                student_id:
                  studentId,

                amount_due:
                  amountDue,

                due_date:
                  dueDate,

                membership_plan:
                  input.membershipPlan,

                billing_period_start:
                  billingPeriodStart,

                billing_period_end:
                  billingPeriodEnd,

                notes:
                  cleanText(
                    input.notes
                  ) ||
                  `Created automatically from enquiry #${enquiry.id}.`,
              }
            );
        }
      }

      const updatedEnquiry =
        await enquiriesService.markAsJoined(
          enquiry.id,
          studentId
        );

      return {
        enquiry:
          updatedEnquiry,

        student,

        feeDue:
          createdFeeDue,

        studentCreated,

        feeDueCreated:
          Boolean(
            createdFeeDue
          ),

        existingStudentUsed,
      };
    } catch (
      conversionError
    ) {
      if (
        createdFeeDue &&
        studentCreated
      ) {
        await safelyDeleteFeeDue(
          createdFeeDue.id
        );
      }

      if (
        student &&
        studentCreated
      ) {
        await safelyDeleteStudent(
          Number(student.id)
        );
      }

      throw conversionError instanceof
        Error
        ? conversionError
        : new Error(
            "Unable to convert the enquiry into a student."
          );
    }
  },
};
