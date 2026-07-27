import { supabase } from "@/lib/supabase";

export const FEE_DUE_STATUSES = [
  "Pending",
  "Due Today",
  "Overdue",
  "Paid",
  "Waived",
  "Cancelled",
] as const;

export const ACTIVE_FEE_DUE_STATUSES = [
  "Pending",
  "Due Today",
  "Overdue",
] as const;

export type FeeDueStatus =
  (typeof FEE_DUE_STATUSES)[number];

export type ActiveFeeDueStatus =
  (typeof ACTIVE_FEE_DUE_STATUSES)[number];

export interface FeeDue {
  id: number;
  student_id: number;
  amount_due: number;
  due_date: string;
  status: FeeDueStatus;
  membership_plan: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  payment_id: number | null;
  paid_amount: number | null;
  paid_date: string | null;
  reminder_sent: boolean;
  last_reminder_sent_at: string | null;
  reminder_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeDueWithStudent extends FeeDue {
  student_name?: string;
  student_phone?: string;
  student_email?: string | null;
}

export interface CreateFeeDueInput {
  student_id: number;
  amount_due: number;
  due_date: string;
  membership_plan?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  notes?: string | null;
}

export interface UpdateFeeDueInput {
  student_id?: number;
  amount_due?: number;
  due_date?: string;
  status?: FeeDueStatus;
  membership_plan?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  payment_id?: number | null;
  paid_amount?: number | null;
  paid_date?: string | null;
  reminder_sent?: boolean;
  last_reminder_sent_at?: string | null;
  reminder_count?: number;
  notes?: string | null;
}

export interface MarkFeeDuePaidInput {
  paid_amount: number;
  paid_date?: string;
  payment_id?: number | null;
}

export type FeeDueDateFilter =
  | "All"
  | "Today"
  | "Overdue"
  | "Upcoming"
  | "Next 3 Days"
  | "Next 7 Days"
  | "This Month";

export interface FeeDueFilters {
  search?: string;
  status?: FeeDueStatus | "All";
  dateFilter?: FeeDueDateFilter;
  studentId?: number | null;
}

export interface FeeDueSummary {
  totalRecords: number;
  activeRecords: number;
  pendingRecords: number;
  dueTodayRecords: number;
  overdueRecords: number;
  paidRecords: number;
  waivedRecords: number;
  cancelledRecords: number;
  upcomingRecords: number;
  totalOutstanding: number;
  overdueAmount: number;
  dueTodayAmount: number;
  upcomingAmount: number;
  totalCollected: number;
  collectedThisMonth: number;
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

function getMonthStartString(
  date: Date = new Date()
): string {
  return getLocalDateString(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )
  );
}

function getMonthEndString(
  date: Date = new Date()
): string {
  return getLocalDateString(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    )
  );
}

function addDays(
  dateString: string,
  days: number
): string {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setDate(
    date.getDate() + days
  );

  return getLocalDateString(date);
}

function cleanOptionalText(
  value: string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleanedValue =
    value.trim();

  return cleanedValue
    ? cleanedValue
    : null;
}

function validateStudentId(
  studentId: number
): number {
  const parsedStudentId =
    Number(studentId);

  if (
    !Number.isInteger(
      parsedStudentId
    ) ||
    parsedStudentId <= 0
  ) {
    throw new Error(
      "Please select a valid student."
    );
  }

  return parsedStudentId;
}

function validateAmount(
  amount: number,
  fieldName: string
): number {
  const parsedAmount =
    Number(amount);

  if (
    !Number.isFinite(
      parsedAmount
    ) ||
    parsedAmount < 0
  ) {
    throw new Error(
      `${fieldName} must be zero or greater.`
    );
  }

  return Number(
    parsedAmount.toFixed(2)
  );
}

function validateDate(
  value: string,
  fieldName: string
): string {
  const cleanedValue =
    value.trim();

  if (!cleanedValue) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      cleanedValue
    )
  ) {
    throw new Error(
      `${fieldName} must use the YYYY-MM-DD format.`
    );
  }

  return cleanedValue;
}

function throwSupabaseError(
  error:
    | {
        message?: string;
      }
    | null,
  fallbackMessage: string
): void {
  if (error) {
    throw new Error(
      error.message ||
        fallbackMessage
    );
  }
}

function normalizeFeeDue(
  feeDue: FeeDue
): FeeDue {
  return {
    ...feeDue,
    id: Number(feeDue.id),
    student_id: Number(
      feeDue.student_id
    ),
    amount_due: Number(
      feeDue.amount_due ?? 0
    ),
    payment_id:
      feeDue.payment_id === null
        ? null
        : Number(
            feeDue.payment_id
          ),
    paid_amount:
      feeDue.paid_amount === null
        ? null
        : Number(
            feeDue.paid_amount
          ),
    reminder_count: Number(
      feeDue.reminder_count ?? 0
    ),
  };
}

function normalizeFeeDues(
  feeDues: FeeDue[]
): FeeDue[] {
  return feeDues.map(
    normalizeFeeDue
  );
}

function isActiveStatus(
  status: FeeDueStatus
): boolean {
  return (
    status === "Pending" ||
    status === "Due Today" ||
    status === "Overdue"
  );
}

function createFeeDuePayload(
  input: CreateFeeDueInput
) {
  return {
    student_id:
      validateStudentId(
        input.student_id
      ),

    amount_due:
      validateAmount(
        input.amount_due,
        "Amount due"
      ),

    due_date:
      validateDate(
        input.due_date,
        "Due date"
      ),

    status:
      calculateStatusFromDate(
        input.due_date
      ),

    membership_plan:
      cleanOptionalText(
        input.membership_plan
      ),

    billing_period_start:
      input.billing_period_start ||
      null,

    billing_period_end:
      input.billing_period_end ||
      null,

    notes:
      cleanOptionalText(
        input.notes
      ),
  };
}

function createUpdatePayload(
  input: UpdateFeeDueInput
): UpdateFeeDueInput {
  const payload:
    UpdateFeeDueInput = {};

  if (
    input.student_id !==
    undefined
  ) {
    payload.student_id =
      validateStudentId(
        input.student_id
      );
  }

  if (
    input.amount_due !==
    undefined
  ) {
    payload.amount_due =
      validateAmount(
        input.amount_due,
        "Amount due"
      );
  }

  if (
    input.due_date !==
    undefined
  ) {
    payload.due_date =
      validateDate(
        input.due_date,
        "Due date"
      );

    if (
      input.status ===
        undefined
    ) {
      payload.status =
        calculateStatusFromDate(
          input.due_date
        );
    }
  }

  if (
    input.status !==
    undefined
  ) {
    payload.status =
      input.status;
  }

  if (
    input.membership_plan !==
    undefined
  ) {
    payload.membership_plan =
      cleanOptionalText(
        input.membership_plan
      );
  }

  if (
    input.billing_period_start !==
    undefined
  ) {
    payload.billing_period_start =
      input.billing_period_start ||
      null;
  }

  if (
    input.billing_period_end !==
    undefined
  ) {
    payload.billing_period_end =
      input.billing_period_end ||
      null;
  }

  if (
    input.payment_id !==
    undefined
  ) {
    payload.payment_id =
      input.payment_id;
  }

  if (
    input.paid_amount !==
    undefined
  ) {
    payload.paid_amount =
      input.paid_amount === null
        ? null
        : validateAmount(
            input.paid_amount,
            "Paid amount"
          );
  }

  if (
    input.paid_date !==
    undefined
  ) {
    payload.paid_date =
      input.paid_date ||
      null;
  }

  if (
    input.reminder_sent !==
    undefined
  ) {
    payload.reminder_sent =
      input.reminder_sent;
  }

  if (
    input.last_reminder_sent_at !==
    undefined
  ) {
    payload.last_reminder_sent_at =
      input.last_reminder_sent_at;
  }

  if (
    input.reminder_count !==
    undefined
  ) {
    payload.reminder_count =
      Math.max(
        0,
        Math.floor(
          input.reminder_count
        )
      );
  }

  if (
    input.notes !==
    undefined
  ) {
    payload.notes =
      cleanOptionalText(
        input.notes
      );
  }

  return payload;
}

export function calculateStatusFromDate(
  dueDate: string
): FeeDueStatus {
  const today =
    getLocalDateString();

  if (dueDate < today) {
    return "Overdue";
  }

  if (dueDate === today) {
    return "Due Today";
  }

  return "Pending";
}

export const feeDuesService = {
  async refreshStatuses():
    Promise<void> {
    const {
      error,
    } = await supabase.rpc(
      "refresh_fee_due_statuses"
    );

    throwSupabaseError(
      error,
      "Unable to refresh fee due statuses."
    );
  },

  async getFeeDues():
    Promise<FeeDue[]> {
    await this.refreshStatuses();

    const {
      data,
      error,
    } = await supabase
      .from("fee_dues")
      .select("*")
      .order("due_date", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    throwSupabaseError(
      error,
      "Unable to load fee dues."
    );

    return normalizeFeeDues(
      (data ?? []) as FeeDue[]
    );
  },

  async getFeeDueById(
    id: number
  ): Promise<FeeDue> {
    const parsedId =
      Number(id);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        "Invalid fee due ID."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("fee_dues")
      .select("*")
      .eq("id", parsedId)
      .single();

    throwSupabaseError(
      error,
      "Unable to load fee due."
    );

    if (!data) {
      throw new Error(
        "Fee due record not found."
      );
    }

    return normalizeFeeDue(
      data as FeeDue
    );
  },

  async getFeeDuesByStudentId(
    studentId: number
  ): Promise<FeeDue[]> {
    const parsedStudentId =
      validateStudentId(
        studentId
      );

    const {
      data,
      error,
    } = await supabase
      .from("fee_dues")
      .select("*")
      .eq(
        "student_id",
        parsedStudentId
      )
      .order("due_date", {
        ascending: false,
      });

    throwSupabaseError(
      error,
      "Unable to load the student's fee dues."
    );

    return normalizeFeeDues(
      (data ?? []) as FeeDue[]
    );
  },

  async createFeeDue(
    input: CreateFeeDueInput
  ): Promise<FeeDue> {
    const payload =
      createFeeDuePayload(
        input
      );

    const {
      data,
      error,
    } = await supabase
      .from("fee_dues")
      .insert(payload)
      .select("*")
      .single();

    throwSupabaseError(
      error,
      "Unable to create fee due."
    );

    if (!data) {
      throw new Error(
        "Fee due was not created."
      );
    }

    return normalizeFeeDue(
      data as FeeDue
    );
  },

  async updateFeeDue(
    id: number,
    input: UpdateFeeDueInput
  ): Promise<FeeDue> {
    const parsedId =
      Number(id);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        "Invalid fee due ID."
      );
    }

    const payload =
      createUpdatePayload(
        input
      );

    if (
      Object.keys(
        payload
      ).length === 0
    ) {
      return this.getFeeDueById(
        parsedId
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("fee_dues")
      .update(payload)
      .eq("id", parsedId)
      .select("*")
      .single();

    throwSupabaseError(
      error,
      "Unable to update fee due."
    );

    if (!data) {
      throw new Error(
        "Fee due was not updated."
      );
    }

    return normalizeFeeDue(
      data as FeeDue
    );
  },

  async deleteFeeDue(
    id: number
  ): Promise<void> {
    const parsedId =
      Number(id);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        "Invalid fee due ID."
      );
    }

    const {
      error,
    } = await supabase
      .from("fee_dues")
      .delete()
      .eq("id", parsedId);

    throwSupabaseError(
      error,
      "Unable to delete fee due."
    );
  },

  async markAsPaid(
    id: number,
    input: MarkFeeDuePaidInput
  ): Promise<FeeDue> {
    const parsedId =
      Number(id);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        "Invalid fee due ID."
      );
    }

    const paidAmount =
      validateAmount(
        input.paid_amount,
        "Paid amount"
      );

    const paidDate =
      input.paid_date ||
      getLocalDateString();

    const {
      data,
      error,
    } = await supabase.rpc(
      "mark_fee_due_paid",
      {
        p_fee_due_id:
          parsedId,
        p_paid_amount:
          paidAmount,
        p_paid_date:
          paidDate,
        p_payment_id:
          input.payment_id ??
          null,
      }
    );

    throwSupabaseError(
      error,
      "Unable to mark the fee due as paid."
    );

    if (!data) {
      throw new Error(
        "Fee due was not marked as paid."
      );
    }

    const returnedRecord =
      Array.isArray(data)
        ? data[0]
        : data;

    return normalizeFeeDue(
      returnedRecord as FeeDue
    );
  },

  async markAsWaived(
    id: number,
    notes?: string
  ): Promise<FeeDue> {
    return this.updateFeeDue(
      id,
      {
        status: "Waived",
        notes:
          cleanOptionalText(
            notes
          ),
      }
    );
  },

  async markAsCancelled(
    id: number,
    notes?: string
  ): Promise<FeeDue> {
    return this.updateFeeDue(
      id,
      {
        status: "Cancelled",
        notes:
          cleanOptionalText(
            notes
          ),
      }
    );
  },

  async reopenFeeDue(
    id: number
  ): Promise<FeeDue> {
    const feeDue =
      await this.getFeeDueById(
        id
      );

    return this.updateFeeDue(
      id,
      {
        status:
          calculateStatusFromDate(
            feeDue.due_date
          ),
        paid_amount: null,
        paid_date: null,
        payment_id: null,
      }
    );
  },

  async recordReminder(
    id: number
  ): Promise<FeeDue> {
    const parsedId =
      Number(id);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        "Invalid fee due ID."
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "record_fee_due_reminder",
      {
        p_fee_due_id:
          parsedId,
      }
    );

    throwSupabaseError(
      error,
      "Unable to record the reminder."
    );

    if (!data) {
      throw new Error(
        "Reminder was not recorded."
      );
    }

    const returnedRecord =
      Array.isArray(data)
        ? data[0]
        : data;

    return normalizeFeeDue(
      returnedRecord as FeeDue
    );
  },

  calculateSummary(
    feeDues: FeeDue[]
  ): FeeDueSummary {
    const today =
      getLocalDateString();

    const monthStart =
      getMonthStartString();

    const monthEnd =
      getMonthEndString();

    const activeFeeDues =
      feeDues.filter(
        (feeDue) =>
          isActiveStatus(
            feeDue.status
          )
      );

    const pendingFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
          "Pending"
      );

    const dueTodayFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
            "Due Today" ||
          (
            isActiveStatus(
              feeDue.status
            ) &&
            feeDue.due_date ===
              today
          )
      );

    const overdueFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
            "Overdue" ||
          (
            isActiveStatus(
              feeDue.status
            ) &&
            feeDue.due_date <
              today
          )
      );

    const upcomingFeeDues =
      feeDues.filter(
        (feeDue) =>
          isActiveStatus(
            feeDue.status
          ) &&
          feeDue.due_date >
            today
      );

    const paidFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
          "Paid"
      );

    const waivedFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
          "Waived"
      );

    const cancelledFeeDues =
      feeDues.filter(
        (feeDue) =>
          feeDue.status ===
          "Cancelled"
      );

    const totalOutstanding =
      activeFeeDues.reduce(
        (total, feeDue) =>
          total +
          Number(
            feeDue.amount_due
          ),
        0
      );

    const overdueAmount =
      overdueFeeDues.reduce(
        (total, feeDue) =>
          total +
          Number(
            feeDue.amount_due
          ),
        0
      );

    const dueTodayAmount =
      dueTodayFeeDues.reduce(
        (total, feeDue) =>
          total +
          Number(
            feeDue.amount_due
          ),
        0
      );

    const upcomingAmount =
      upcomingFeeDues.reduce(
        (total, feeDue) =>
          total +
          Number(
            feeDue.amount_due
          ),
        0
      );

    const totalCollected =
      paidFeeDues.reduce(
        (total, feeDue) =>
          total +
          Number(
            feeDue.paid_amount ??
              feeDue.amount_due
          ),
        0
      );

    const collectedThisMonth =
      paidFeeDues
        .filter(
          (feeDue) =>
            Boolean(
              feeDue.paid_date
            ) &&
            feeDue.paid_date! >=
              monthStart &&
            feeDue.paid_date! <=
              monthEnd
        )
        .reduce(
          (total, feeDue) =>
            total +
            Number(
              feeDue.paid_amount ??
                feeDue.amount_due
            ),
          0
        );

    return {
      totalRecords:
        feeDues.length,

      activeRecords:
        activeFeeDues.length,

      pendingRecords:
        pendingFeeDues.length,

      dueTodayRecords:
        dueTodayFeeDues.length,

      overdueRecords:
        overdueFeeDues.length,

      paidRecords:
        paidFeeDues.length,

      waivedRecords:
        waivedFeeDues.length,

      cancelledRecords:
        cancelledFeeDues.length,

      upcomingRecords:
        upcomingFeeDues.length,

      totalOutstanding:
        Number(
          totalOutstanding.toFixed(
            2
          )
        ),

      overdueAmount:
        Number(
          overdueAmount.toFixed(
            2
          )
        ),

      dueTodayAmount:
        Number(
          dueTodayAmount.toFixed(
            2
          )
        ),

      upcomingAmount:
        Number(
          upcomingAmount.toFixed(
            2
          )
        ),

      totalCollected:
        Number(
          totalCollected.toFixed(
            2
          )
        ),

      collectedThisMonth:
        Number(
          collectedThisMonth.toFixed(
            2
          )
        ),
    };
  },

  filterFeeDues(
    feeDues:
      FeeDueWithStudent[],
    filters: FeeDueFilters
  ): FeeDueWithStudent[] {
    const today =
      getLocalDateString();

    const nextThreeDays =
      addDays(today, 3);

    const nextSevenDays =
      addDays(today, 7);

    const monthStart =
      getMonthStartString();

    const monthEnd =
      getMonthEndString();

    const search =
      filters.search
        ?.trim()
        .toLowerCase() ?? "";

    return feeDues.filter(
      (feeDue) => {
        const matchesSearch =
          !search ||
          feeDue.student_name
            ?.toLowerCase()
            .includes(search) ||
          feeDue.student_phone
            ?.toLowerCase()
            .includes(search) ||
          feeDue.student_email
            ?.toLowerCase()
            .includes(search) ||
          feeDue.membership_plan
            ?.toLowerCase()
            .includes(search) ||
          feeDue.notes
            ?.toLowerCase()
            .includes(search) ||
          String(
            feeDue.student_id
          ).includes(search);

        const matchesStatus =
          !filters.status ||
          filters.status ===
            "All" ||
          feeDue.status ===
            filters.status;

        const matchesStudent =
          !filters.studentId ||
          feeDue.student_id ===
            filters.studentId;

        let matchesDate =
          true;

        switch (
          filters.dateFilter
        ) {
          case "Today":
            matchesDate =
              feeDue.due_date ===
              today;
            break;

          case "Overdue":
            matchesDate =
              isActiveStatus(
                feeDue.status
              ) &&
              feeDue.due_date <
                today;
            break;

          case "Upcoming":
            matchesDate =
              isActiveStatus(
                feeDue.status
              ) &&
              feeDue.due_date >
                today;
            break;

          case "Next 3 Days":
            matchesDate =
              isActiveStatus(
                feeDue.status
              ) &&
              feeDue.due_date >=
                today &&
              feeDue.due_date <=
                nextThreeDays;
            break;

          case "Next 7 Days":
            matchesDate =
              isActiveStatus(
                feeDue.status
              ) &&
              feeDue.due_date >=
                today &&
              feeDue.due_date <=
                nextSevenDays;
            break;

          case "This Month":
            matchesDate =
              feeDue.due_date >=
                monthStart &&
              feeDue.due_date <=
                monthEnd;
            break;

          case "All":
          default:
            matchesDate =
              true;
            break;
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesStudent &&
          matchesDate
        );
      }
    );
  },

  isOverdue(
    feeDue: FeeDue
  ): boolean {
    return (
      isActiveStatus(
        feeDue.status
      ) &&
      feeDue.due_date <
        getLocalDateString()
    );
  },

  isDueToday(
    feeDue: FeeDue
  ): boolean {
    return (
      isActiveStatus(
        feeDue.status
      ) &&
      feeDue.due_date ===
        getLocalDateString()
    );
  },

  isUpcoming(
    feeDue: FeeDue
  ): boolean {
    return (
      isActiveStatus(
        feeDue.status
      ) &&
      feeDue.due_date >
        getLocalDateString()
    );
  },

  getDaysUntilDue(
    dueDate: string
  ): number {
    const today =
      getLocalDateString();

    const todayDate =
      new Date(
        `${today}T00:00:00`
      );

    const dueDateValue =
      new Date(
        `${dueDate}T00:00:00`
      );

    const difference =
      dueDateValue.getTime() -
      todayDate.getTime();

    return Math.round(
      difference /
        (1000 * 60 * 60 * 24)
    );
  },

  getWhatsAppUrl(
    phone: string,
    studentName: string,
    feeDue: FeeDue
  ): string {
    let cleanNumber =
      phone.replace(
        /\D/g,
        ""
      );

    if (
      cleanNumber.length ===
      10
    ) {
      cleanNumber =
        `91${cleanNumber}`;
    }

    const amount =
      Number(
        feeDue.amount_due
      ).toLocaleString(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits:
            0,
        }
      );

    const daysUntilDue =
      this.getDaysUntilDue(
        feeDue.due_date
      );

    let message = "";

    if (
      daysUntilDue < 0
    ) {
      message =
        `Hi ${studentName} 👋\n\n` +
        `This is a friendly reminder from Footloose Alley Dance & Fitness Studio. ` +
        `Your membership fee of ${amount} was due on ${feeDue.due_date} and is currently pending.\n\n` +
        `Please visit the studio or contact us to complete your renewal. ` +
        `We would love to have you continue your fitness journey with us.\n\n` +
        `Thank you,\nFootloose Alley`;
    } else if (
      daysUntilDue === 0
    ) {
      message =
        `Hi ${studentName} 👋\n\n` +
        `This is a friendly reminder from Footloose Alley Dance & Fitness Studio that your membership fee of ${amount} is due today.\n\n` +
        `Please contact us or visit the studio to renew your membership.\n\n` +
        `Thank you,\nFootloose Alley`;
    } else if (
      daysUntilDue === 1
    ) {
      message =
        `Hi ${studentName} 👋\n\n` +
        `This is a friendly reminder from Footloose Alley Dance & Fitness Studio that your membership fee of ${amount} is due tomorrow.\n\n` +
        `Please contact us or visit the studio to renew your membership.\n\n` +
        `Thank you,\nFootloose Alley`;
    } else {
      message =
        `Hi ${studentName} 👋\n\n` +
        `This is a friendly reminder from Footloose Alley Dance & Fitness Studio that your membership fee of ${amount} is due on ${feeDue.due_date}.\n\n` +
        `Please contact us or visit the studio for your renewal.\n\n` +
        `Thank you,\nFootloose Alley`;
    }

    return (
      `https://wa.me/` +
      `${cleanNumber}` +
      `?text=${encodeURIComponent(
        message
      )}`
    );
  },

  getCallUrl(
    phone: string
  ): string {
    const cleanNumber =
      phone.replace(
        /[^\d+]/g,
        ""
      );

    return `tel:${cleanNumber}`;
  },

  formatCurrency(
    value:
      | number
      | null
      | undefined
  ): string {
    return Number(
      value ?? 0
    ).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits:
          0,
      }
    );
  },

  formatDate(
    value:
      | string
      | null
      | undefined
  ): string {
    if (!value) {
      return "—";
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  },
};