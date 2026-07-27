import { createClient } from "@/lib/client";

import type {
  CreatePaymentInput,
  PaymentSummary,
  PaymentWithStudent,
  Student,
} from "@/types/database";

const supabase = createClient();

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStartDate() {
  const now = new Date();

  return getLocalDateString(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )
  );
}

function isCompletedPayment(
  status: string | null
) {
  const normalizedStatus =
    status?.trim().toLowerCase();

  return (
    !normalizedStatus ||
    normalizedStatus === "paid" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "success"
  );
}

export const paymentService = {
  async getPayments(): Promise<
    PaymentWithStudent[]
  > {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        created_at,
        student_id,
        amount,
        payment_date,
        payment_method,
        remarks,
        received_by,
        invoice_number,
        payment_status,
        reference_number,
        student:Students (
          id,
          Name,
          Phone,
          student_code,
          Program,
          Fees,
          Fees_due,
          fee_status
        )
      `)
      .order("payment_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load payments."
      );
    }

    return (
      data ?? []
    ) as unknown as PaymentWithStudent[];
  },

  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .order("Name", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load students."
      );
    }

    return (data ?? []) as Student[];
  },

  async getSummary(): Promise<PaymentSummary> {
    const today = getLocalDateString();
    const monthStart = getMonthStartDate();

    const [
      paymentsResult,
      pendingStudentsResult,
    ] = await Promise.all([
      supabase
        .from("payments")
        .select(
          "amount, payment_date, payment_status"
        ),

      supabase
        .from("Students")
        .select("Fees_due"),
    ]);

    if (paymentsResult.error) {
      throw new Error(
        paymentsResult.error.message ||
          "Unable to load payment totals."
      );
    }

    if (pendingStudentsResult.error) {
      throw new Error(
        pendingStudentsResult.error.message ||
          "Unable to load pending fees."
      );
    }

    const completedPayments =
      paymentsResult.data?.filter((payment) =>
        isCompletedPayment(
          payment.payment_status
        )
      ) ?? [];

    const totalCollected =
      completedPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount ?? 0),
        0
      );

    const monthCollected =
      completedPayments
        .filter(
          (payment) =>
            payment.payment_date >=
            monthStart
        )
        .reduce(
          (total, payment) =>
            total +
            Number(payment.amount ?? 0),
          0
        );

    const todayCollected =
      completedPayments
        .filter(
          (payment) =>
            payment.payment_date === today
        )
        .reduce(
          (total, payment) =>
            total +
            Number(payment.amount ?? 0),
          0
        );

    const pendingAmount =
      pendingStudentsResult.data?.reduce(
        (total, student) =>
          total +
          Math.max(
            Number(student.Fees_due ?? 0),
            0
          ),
        0
      ) ?? 0;

    return {
      totalCollected,
      monthCollected,
      todayCollected,
      pendingAmount,
      paymentCount:
        completedPayments.length,
    };
  },

  async createPayment(
    input: CreatePaymentInput
  ): Promise<void> {
    if (!input.student_id) {
      throw new Error(
        "Please select a student."
      );
    }

    if (!input.amount || input.amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero."
      );
    }

    const {
      data: student,
      error: studentError,
    } = await supabase
      .from("Students")
      .select(`
        id,
        Fees,
        Fees_due,
        next_due_date
      `)
      .eq("id", input.student_id)
      .single();

    if (studentError) {
      throw new Error(
        studentError.message ||
          "Unable to find the selected student."
      );
    }

    const paymentStatus =
      input.payment_status?.trim() || "Paid";

    const { error: paymentError } =
      await supabase
        .from("payments")
        .insert({
          student_id: input.student_id,
          amount: input.amount,
          payment_date:
            input.payment_date,
          payment_method:
            input.payment_method || "Cash",
          remarks:
            input.remarks || null,
          received_by:
            input.received_by || null,
          invoice_number:
            input.invoice_number || null,
          payment_status: paymentStatus,
          reference_number:
            input.reference_number || null,
        });

    if (paymentError) {
      throw new Error(
        paymentError.message ||
          "Unable to record payment."
      );
    }

    if (!isCompletedPayment(paymentStatus)) {
      return;
    }

    const currentDue = Math.max(
      Number(
        student.Fees_due ??
          student.Fees ??
          0
      ),
      0
    );

    const remainingDue = Math.max(
      currentDue - input.amount,
      0
    );

    const newFeeStatus =
      remainingDue <= 0
        ? "Paid"
        : "Partial";

    const { error: updateError } =
      await supabase
        .from("Students")
        .update({
          Fees_due: remainingDue,
          last_payment_date:
            input.payment_date,
          fee_status: newFeeStatus,
        })
        .eq("id", input.student_id);

    if (updateError) {
      throw new Error(
        `Payment was recorded, but the student fee balance could not be updated: ${updateError.message}`
      );
    }
  },

  async deletePayment(
    paymentId: number
  ): Promise<void> {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      throw new Error(
        error.message ||
          "Unable to delete payment."
      );
    }
  },
};