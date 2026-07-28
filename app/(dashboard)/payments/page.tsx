"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgeIndianRupee,
  CalendarDays,
  CreditCard,
  Loader2,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PaymentMethodBreakdown from "@/components/payments/PaymentMethodBreakdown";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/payments/PaymentBadges";

import { paymentService } from "@/services/payment.service";

import type {
  CreatePaymentInput,
  PaymentSummary,
  PaymentWithStudent,
  Student,
} from "@/types/database";

interface PaymentFormState {
  student_id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  reference_number: string;
  invoice_number: string;
  received_by: string;
  remarks: string;
}

const initialSummary: PaymentSummary = {
  totalCollected: 0,
  monthCollected: 0,
  weekCollected: 0,
  todayCollected: 0,
  pendingAmount: 0,
  paymentCount: 0,
};

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(now.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
}

function createInitialForm(): PaymentFormState {
  return {
    student_id: "",
    amount: "",
    payment_date: getTodayDate(),
    payment_method: "Cash",
    payment_status: "Paid",
    reference_number: "",
    invoice_number: "",
    received_by: "",
    remarks: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<
    PaymentWithStudent[]
  >([]);

  const [students, setStudents] = useState<
    Student[]
  >([]);

  const [summary, setSummary] =
    useState<PaymentSummary>(initialSummary);

  const [form, setForm] =
    useState<PaymentFormState>(
      createInitialForm()
    );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [methodFilter, setMethodFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        paymentsData,
        studentsData,
        summaryData,
      ] = await Promise.all([
        paymentService.getPayments(),
        paymentService.getStudents(),
        paymentService.getSummary(),
      ]);

      setPayments(paymentsData);
      setStudents(studentsData);
      setSummary(summaryData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedStudent = useMemo(() => {
    const selectedId = Number(form.student_id);

    return students.find(
      (student) =>
        student.id === selectedId
    );
  }, [form.student_id, students]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return payments.filter((payment) => {
      const studentName =
        payment.student?.Name?.toLowerCase() ??
        "";

      const studentPhone =
        payment.student?.Phone?.toLowerCase() ??
        "";

      const studentCode =
        payment.student?.student_code?.toLowerCase() ??
        "";

      const invoiceNumber =
        payment.invoice_number?.toLowerCase() ??
        "";

      const referenceNumber =
        payment.reference_number?.toLowerCase() ??
        "";

      const matchesSearch =
        !normalizedSearch ||
        studentName.includes(normalizedSearch) ||
        studentPhone.includes(normalizedSearch) ||
        studentCode.includes(normalizedSearch) ||
        invoiceNumber.includes(normalizedSearch) ||
        referenceNumber.includes(normalizedSearch);

      const paymentStatus =
        payment.payment_status?.trim() ||
        "Paid";

      const matchesStatus =
        statusFilter === "All" ||
        paymentStatus.toLowerCase() ===
          statusFilter.toLowerCase();

      const paymentMethod =
        payment.payment_method?.trim() ||
        "Other";

      const matchesMethod =
        methodFilter === "All" ||
        paymentMethod.toLowerCase() ===
          methodFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod
      );
    });
  }, [
    payments,
    search,
    statusFilter,
    methodFilter,
  ]);

  function updateForm(
    field: keyof PaymentFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStudentChange(
    studentId: string
  ) {
    const student = students.find(
      (item) =>
        item.id === Number(studentId)
    );

    setForm((current) => ({
      ...current,
      student_id: studentId,
      amount:
        student && Number(student.Fees_due ?? 0) > 0
          ? String(student.Fees_due)
          : current.amount,
    }));
  }

  function resetForm() {
    setForm(createInitialForm());
    setSuccess(null);
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const studentId = Number(
        form.student_id
      );

      const amount = Number(form.amount);

      if (!studentId) {
        throw new Error(
          "Please select a student."
        );
      }

      if (!amount || amount <= 0) {
        throw new Error(
          "Please enter a valid payment amount."
        );
      }

      const payload: CreatePaymentInput = {
        student_id: studentId,
        amount,
        payment_date: form.payment_date,
        payment_method:
          form.payment_method,
        payment_status:
          form.payment_status,
        reference_number:
          form.reference_number.trim() || null,
        invoice_number:
          form.invoice_number.trim() || null,
        received_by:
          form.received_by.trim() || null,
        remarks:
          form.remarks.trim() || null,
      };

      await paymentService.createPayment(
        payload
      );

      setSuccess(
        "Payment recorded successfully."
      );

      setForm(createInitialForm());

      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    payment: PaymentWithStudent
  ) {
    const studentName =
      payment.student?.Name || "this student";

    const confirmed = window.confirm(
      `Delete the payment of ${formatCurrency(
        Number(payment.amount)
      )} for ${studentName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(payment.id);
      setError(null);
      setSuccess(null);

      await paymentService.deletePayment(
        payment.id
      );

      setSuccess(
        "Payment deleted successfully."
      );

      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete payment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Record student payments and track fee collections"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setShowForm((current) => !current)
            }
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {showForm ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}

            {showForm
              ? "Close Form"
              : "Record Payment"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Collected Today"
            value={formatCurrency(summary.todayCollected)}
            description="Payments received today"
            icon={WalletCards}
          />

          <SummaryCard
            title="This Week"
            value={formatCurrency(summary.weekCollected)}
            description="Collection since Monday"
            icon={CalendarDays}
          />

          <SummaryCard
            title="This Month"
            value={formatCurrency(summary.monthCollected)}
            description="Total monthly collection"
            icon={CalendarDays}
          />

          <SummaryCard
            title="Total Collected"
            value={formatCurrency(summary.totalCollected)}
            description={`${summary.paymentCount} completed payments`}
            icon={BadgeIndianRupee}
          />

          <SummaryCard
            title="Fees Pending"
            value={formatCurrency(summary.pendingAmount)}
            description="Outstanding student fees"
            icon={CreditCard}
          />
        </div>

        <PaymentMethodBreakdown
          payments={payments}
          formatCurrency={formatCurrency}
        />

        {showForm && (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Record Payment
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter the payment details below.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FormField
                  label="Student"
                  required
                >
                  <select
                    value={form.student_id}
                    onChange={(event) =>
                      handleStudentChange(
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map((student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.Name ||
                          `Student ${student.id}`}
                        {student.student_code
                          ? ` - ${student.student_code}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Amount"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      updateForm(
                        "amount",
                        event.target.value
                      )
                    }
                    placeholder="Enter amount"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </FormField>

                <FormField
                  label="Payment Date"
                  required
                >
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={(event) =>
                      updateForm(
                        "payment_date",
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </FormField>

                <FormField
                  label="Payment Method"
                  required
                >
                  <select
                    value={form.payment_method}
                    onChange={(event) =>
                      updateForm(
                        "payment_method",
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Cheque">
                      Cheque
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </FormField>

                <FormField label="Payment Status">
                  <select
                    value={form.payment_status}
                    onChange={(event) =>
                      updateForm(
                        "payment_status",
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Failed">
                      Failed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </FormField>

                <FormField label="Reference Number">
                  <input
                    type="text"
                    value={
                      form.reference_number
                    }
                    onChange={(event) =>
                      updateForm(
                        "reference_number",
                        event.target.value
                      )
                    }
                    placeholder="UPI or transaction reference"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </FormField>

                <FormField label="Invoice Number">
                  <input
                    type="text"
                    value={form.invoice_number}
                    onChange={(event) =>
                      updateForm(
                        "invoice_number",
                        event.target.value
                      )
                    }
                    placeholder="Optional invoice number"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </FormField>

                <FormField label="Received By">
                  <input
                    type="text"
                    value={form.received_by}
                    onChange={(event) =>
                      updateForm(
                        "received_by",
                        event.target.value
                      )
                    }
                    placeholder="Staff or admin name"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </FormField>

                <FormField label="Remarks">
                  <input
                    type="text"
                    value={form.remarks}
                    onChange={(event) =>
                      updateForm(
                        "remarks",
                        event.target.value
                      )
                    }
                    placeholder="Optional remarks"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </FormField>
              </div>

              {selectedStudent && (
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">
                      Student
                    </p>

                    <p className="font-medium">
                      {selectedStudent.Name ||
                        "Unnamed Student"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Program
                    </p>

                    <p className="font-medium">
                      {selectedStudent.Program ||
                        "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Current Fees Due
                    </p>

                    <p className="font-medium">
                      {formatCurrency(
                        Number(
                          selectedStudent.Fees_due ??
                            0
                        )
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ReceiptText className="mr-2 h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Payment"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Payment History
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredPayments.length} of {payments.length} payment
                  {payments.length === 1 ? "" : "s"}{" "}
                  found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search student or invoice..."
                    className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-72"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Failed">
                    Failed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(event) =>
                    setMethodFilter(
                      event.target.value
                    )
                  }
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">
                    All Methods
                  </option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>
                  <option value="Cheque">
                    Cheque
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>

                {(search ||
                  statusFilter !== "All" ||
                  methodFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setMethodFilter("All");
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />

                <p className="mt-3 text-sm text-muted-foreground">
                  Loading payments...
                </p>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center p-6">
              <div className="text-center">
                <ReceiptText className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 font-semibold">
                  No payments found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Record a payment to see it here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Student
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Amount
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Method
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Reference
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Invoice
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredPayments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          {formatDate(
                            payment.payment_date
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {payment.student?.Name ||
                              "Unknown Student"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {payment.student
                              ?.student_code ||
                              payment.student
                                ?.Phone ||
                              "No student details"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {formatCurrency(
                            Number(
                              payment.amount ?? 0
                            )
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <PaymentMethodBadge method={payment.payment_method} />
                        </td>

                        <td className="px-5 py-4">
                          <PaymentStatusBadge status={payment.payment_status} />
                        </td>

                        <td className="max-w-44 truncate px-5 py-4">
                          {payment.reference_number ||
                            "—"}
                        </td>

                        <td className="max-w-44 truncate px-5 py-4">
                          {payment.invoice_number ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {payment.student?.id && (
                              <a
                                href={`/students/${payment.student.id}`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-muted"
                              >
                                View Student
                              </a>
                            )}
                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                payment
                              )
                            }
                            disabled={
                              deletingId ===
                              payment.id
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950"
                            title="Delete payment"
                          >
                            {deletingId ===
                            payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: typeof BadgeIndianRupee;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
