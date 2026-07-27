"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CreateFeeDueInput,
  FeeDue,
  UpdateFeeDueInput,
  feeDuesService,
} from "@/services/fee-dues.service";

export interface FeeDueStudentOption {
  id: number;
  name: string;
  phone?: string | null;
  membership_plan?: string | null;
}

interface FeeDueFormDialogProps {
  open: boolean;
  students: FeeDueStudentOption[];
  feeDue?: FeeDue | null;
  defaultStudentId?: number | null;
  onClose: () => void;
  onSaved: (feeDue: FeeDue) => void;
}

interface FeeDueFormState {
  student_id: string;
  amount_due: string;
  due_date: string;
  membership_plan: string;
  billing_period_start: string;
  billing_period_end: string;
  notes: string;
}

const MEMBERSHIP_PLANS = [
  "Monthly",
  "3 Months",
  "6 Months",
  "Yearly",
  "Custom",
] as const;

const MEMBERSHIP_PRICES: Record<
  string,
  number
> = {
  Monthly: 2500,
  "3 Months": 6000,
  "6 Months": 10000,
  Yearly: 18000,
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

function addMonthsToDate(
  dateString: string,
  months: number
): string {
  if (!dateString) {
    return "";
  }

  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setMonth(
    date.getMonth() + months
  );

  date.setDate(
    date.getDate() - 1
  );

  return getLocalDateString(date);
}

function getPlanDurationMonths(
  membershipPlan: string
): number | null {
  switch (membershipPlan) {
    case "Monthly":
      return 1;

    case "3 Months":
      return 3;

    case "6 Months":
      return 6;

    case "Yearly":
      return 12;

    default:
      return null;
  }
}

function createEmptyForm(
  defaultStudentId?: number | null
): FeeDueFormState {
  const today =
    getLocalDateString();

  return {
    student_id:
      defaultStudentId
        ? String(
            defaultStudentId
          )
        : "",
    amount_due: "",
    due_date: today,
    membership_plan: "",
    billing_period_start:
      today,
    billing_period_end: "",
    notes: "",
  };
}

function createEditForm(
  feeDue: FeeDue
): FeeDueFormState {
  return {
    student_id: String(
      feeDue.student_id
    ),
    amount_due: String(
      feeDue.amount_due
    ),
    due_date:
      feeDue.due_date,
    membership_plan:
      feeDue.membership_plan ??
      "",
    billing_period_start:
      feeDue.billing_period_start ??
      "",
    billing_period_end:
      feeDue.billing_period_end ??
      "",
    notes:
      feeDue.notes ?? "",
  };
}

function getInputClassName(
  hasError = false
): string {
  return [
    "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900",
    "outline-none transition",
    "placeholder:text-slate-400",
    "focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-violet-500 focus:ring-violet-100",
  ].join(" ");
}

export default function FeeDueFormDialog({
  open,
  students,
  feeDue = null,
  defaultStudentId = null,
  onClose,
  onSaved,
}: FeeDueFormDialogProps) {
  const isEditing =
    Boolean(feeDue);

  const [form, setForm] =
    useState<FeeDueFormState>(
      createEmptyForm(
        defaultStudentId
      )
    );

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<
      Partial<
        Record<
          keyof FeeDueFormState,
          string
        >
      >
    >({});

  const [saving, setSaving] =
    useState(false);

  const sortedStudents =
    useMemo(() => {
      return [...students].sort(
        (first, second) =>
          first.name.localeCompare(
            second.name
          )
      );
    }, [students]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setFieldErrors({});

    if (feeDue) {
      setForm(
        createEditForm(
          feeDue
        )
      );
      return;
    }

    setForm(
      createEmptyForm(
        defaultStudentId
      )
    );
  }, [
    open,
    feeDue,
    defaultStudentId,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    open,
    saving,
    onClose,
  ]);

  function updateField<
    Key extends keyof FeeDueFormState
  >(
    field: Key,
    value: FeeDueFormState[Key]
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      })
    );

    setFieldErrors(
      (currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      })
    );

    setError("");
  }

  function handleMembershipPlanChange(
    membershipPlan: string
  ) {
    const price =
      MEMBERSHIP_PRICES[
        membershipPlan
      ];

    const duration =
      getPlanDurationMonths(
        membershipPlan
      );

    setForm(
      (currentForm) => {
        const startDate =
          currentForm
            .billing_period_start ||
          getLocalDateString();

        return {
          ...currentForm,
          membership_plan:
            membershipPlan,
          amount_due:
            price !== undefined
              ? String(price)
              : currentForm.amount_due,
          billing_period_start:
            startDate,
          billing_period_end:
            duration
              ? addMonthsToDate(
                  startDate,
                  duration
                )
              : currentForm
                  .billing_period_end,
        };
      }
    );

    setFieldErrors(
      (currentErrors) => ({
        ...currentErrors,
        membership_plan:
          undefined,
        amount_due: undefined,
        billing_period_end:
          undefined,
      })
    );
  }

  function handleBillingStartChange(
    billingPeriodStart: string
  ) {
    const duration =
      getPlanDurationMonths(
        form.membership_plan
      );

    setForm(
      (currentForm) => ({
        ...currentForm,
        billing_period_start:
          billingPeriodStart,
        billing_period_end:
          duration &&
          billingPeriodStart
            ? addMonthsToDate(
                billingPeriodStart,
                duration
              )
            : currentForm
                .billing_period_end,
      })
    );

    setFieldErrors(
      (currentErrors) => ({
        ...currentErrors,
        billing_period_start:
          undefined,
        billing_period_end:
          undefined,
      })
    );
  }

  function validateForm(): boolean {
    const errors: Partial<
      Record<
        keyof FeeDueFormState,
        string
      >
    > = {};

    const studentId =
      Number(
        form.student_id
      );

    const amountDue =
      Number(
        form.amount_due
      );

    if (
      !form.student_id ||
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {
      errors.student_id =
        "Please select a student.";
    }

    if (
      !form.amount_due.trim()
    ) {
      errors.amount_due =
        "Amount due is required.";
    } else if (
      !Number.isFinite(
        amountDue
      ) ||
      amountDue < 0
    ) {
      errors.amount_due =
        "Enter a valid amount.";
    }

    if (
      !form.due_date
    ) {
      errors.due_date =
        "Due date is required.";
    }

    if (
      form.billing_period_start &&
      form.billing_period_end &&
      form.billing_period_end <
        form.billing_period_start
    ) {
      errors.billing_period_end =
        "End date cannot be before the start date.";
    }

    setFieldErrors(
      errors
    );

    return (
      Object.keys(
        errors
      ).length === 0
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      saving ||
      !validateForm()
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const commonPayload = {
        student_id: Number(
          form.student_id
        ),
        amount_due: Number(
          form.amount_due
        ),
        due_date:
          form.due_date,
        membership_plan:
          form.membership_plan ||
          null,
        billing_period_start:
          form.billing_period_start ||
          null,
        billing_period_end:
          form.billing_period_end ||
          null,
        notes:
          form.notes ||
          null,
      };

      let savedFeeDue:
        FeeDue;

      if (feeDue) {
        const updatePayload:
          UpdateFeeDueInput =
          commonPayload;

        savedFeeDue =
          await feeDuesService.updateFeeDue(
            feeDue.id,
            updatePayload
          );
      } else {
        const createPayload:
          CreateFeeDueInput =
          commonPayload;

        savedFeeDue =
          await feeDuesService.createFeeDue(
            createPayload
          );
      }

      onSaved(
        savedFeeDue
      );

      onClose();
    } catch (
      submitError
    ) {
      const message =
        submitError instanceof
        Error
          ? submitError.message
          : "Unable to save the fee due record.";

      if (
        message
          .toLowerCase()
          .includes(
            "duplicate"
          ) ||
        message.includes(
          "fee_dues_student_due_date_unique"
        )
      ) {
        setError(
          "A fee due record already exists for this student on the selected due date."
        );
      } else {
        setError(
          message
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {isEditing
                ? "Edit Fee Due"
                : "Add Fee Due"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update the student's membership fee details."
                : "Create a new membership renewal or fee reminder."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M18 6 6 18M6 6l12 12"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Student and payment
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select the student and enter the amount they need to pay.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fee-due-student"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Student
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="fee-due-student"
                    value={
                      form.student_id
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "student_id",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    className={getInputClassName(
                      Boolean(
                        fieldErrors.student_id
                      )
                    )}
                  >
                    <option value="">
                      Select a student
                    </option>

                    {sortedStudents.map(
                      (
                        student
                      ) => (
                        <option
                          key={
                            student.id
                          }
                          value={
                            student.id
                          }
                        >
                          {
                            student.name
                          }
                          {student.phone
                            ? ` — ${student.phone}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  {fieldErrors.student_id ? (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        fieldErrors.student_id
                      }
                    </p>
                  ) : null}

                  {students.length ===
                  0 ? (
                    <p className="mt-2 text-xs text-amber-600">
                      No students are available. Add a student before creating a fee due.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="fee-due-plan"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Membership plan
                  </label>

                  <select
                    id="fee-due-plan"
                    value={
                      form.membership_plan
                    }
                    onChange={(
                      event
                    ) =>
                      handleMembershipPlanChange(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    className={getInputClassName()}
                  >
                    <option value="">
                      Select a plan
                    </option>

                    {MEMBERSHIP_PLANS.map(
                      (
                        plan
                      ) => (
                        <option
                          key={
                            plan
                          }
                          value={
                            plan
                          }
                        >
                          {plan}
                          {MEMBERSHIP_PRICES[
                            plan
                          ] !== undefined
                            ? ` — ₹${MEMBERSHIP_PRICES[
                                plan
                              ].toLocaleString(
                                "en-IN"
                              )}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="fee-due-amount"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Amount due
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
                      ₹
                    </span>

                    <input
                      id="fee-due-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.amount_due
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "amount_due",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        saving
                      }
                      placeholder="2500"
                      className={`${getInputClassName(
                        Boolean(
                          fieldErrors.amount_due
                        )
                      )} pl-8`}
                    />
                  </div>

                  {fieldErrors.amount_due ? (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        fieldErrors.amount_due
                      }
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="fee-due-date"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Due date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="fee-due-date"
                    type="date"
                    value={
                      form.due_date
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "due_date",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    className={getInputClassName(
                      Boolean(
                        fieldErrors.due_date
                      )
                    )}
                  />

                  {fieldErrors.due_date ? (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        fieldErrors.due_date
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Membership period
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  These dates describe the membership period covered by this fee.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fee-period-start"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Period start
                  </label>

                  <input
                    id="fee-period-start"
                    type="date"
                    value={
                      form.billing_period_start
                    }
                    onChange={(
                      event
                    ) =>
                      handleBillingStartChange(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    className={getInputClassName(
                      Boolean(
                        fieldErrors.billing_period_start
                      )
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="fee-period-end"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Period end
                  </label>

                  <input
                    id="fee-period-end"
                    type="date"
                    value={
                      form.billing_period_end
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "billing_period_end",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    className={getInputClassName(
                      Boolean(
                        fieldErrors.billing_period_end
                      )
                    )}
                  />

                  {fieldErrors.billing_period_end ? (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        fieldErrors.billing_period_end
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            <section>
              <label
                htmlFor="fee-due-notes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notes
              </label>

              <textarea
                id="fee-due-notes"
                rows={4}
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "notes",
                    event.target
                      .value
                  )
                }
                disabled={
                  saving
                }
                placeholder="Add any payment, renewal, discount, or follow-up notes..."
                className={`${getInputClassName()} resize-none`}
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                students.length ===
                  0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                  </svg>

                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Fee Due"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}