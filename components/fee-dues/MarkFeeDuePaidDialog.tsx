"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FeeDueWithStudent,
  feeDuesService,
} from "@/services/fee-dues.service";

interface MarkFeeDuePaidDialogProps {
  open: boolean;
  feeDue: FeeDueWithStudent | null;
  onClose: () => void;
  onPaid: (
    updatedFeeDue: FeeDueWithStudent
  ) => void;
}

interface PaymentFormState {
  paid_amount: string;
  paid_date: string;
  payment_id: string;
}

interface PaymentFormErrors {
  paid_amount?: string;
  paid_date?: string;
  payment_id?: string;
}

function getLocalDateString(
  date: Date = new Date()
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyForm():
  PaymentFormState {
  return {
    paid_amount: "",
    paid_date:
      getLocalDateString(),
    payment_id: "",
  };
}

function createFormFromFeeDue(
  feeDue: FeeDueWithStudent
): PaymentFormState {
  return {
    paid_amount:
      String(
        feeDue.paid_amount ??
          feeDue.amount_due
      ),
    paid_date:
      feeDue.paid_date ??
      getLocalDateString(),
    payment_id:
      feeDue.payment_id
        ? String(
            feeDue.payment_id
          )
        : "",
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
      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100",
  ].join(" ");
}

function formatCurrency(
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
}

function formatDate(
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
}

export default function MarkFeeDuePaidDialog({
  open,
  feeDue,
  onClose,
  onPaid,
}: MarkFeeDuePaidDialogProps) {
  const [
    form,
    setForm,
  ] =
    useState<PaymentFormState>(() =>
      feeDue ? createFormFromFeeDue(feeDue) : createEmptyForm()
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<PaymentFormErrors>(
      {}
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const outstandingBalance =
    useMemo(() => {
      if (!feeDue) {
        return 0;
      }

      const amountDue =
        Number(
          feeDue.amount_due ??
            0
        );

      const amountPaid =
        Number(
          form.paid_amount ||
            0
        );

      return Math.max(
        0,
        amountDue -
          amountPaid
      );
    }, [
      feeDue,
      form.paid_amount,
    ]);

  const isPartialPayment =
    useMemo(() => {
      if (!feeDue) {
        return false;
      }

      const amountDue =
        Number(
          feeDue.amount_due ??
            0
        );

      const amountPaid =
        Number(
          form.paid_amount ||
            0
        );

      return (
        amountPaid > 0 &&
        amountPaid <
          amountDue
      );
    }, [
      feeDue,
      form.paid_amount,
    ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
          "Escape" &&
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
    Key extends keyof PaymentFormState
  >(
    field: Key,
    value:
      PaymentFormState[Key]
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]:
          value,
      })
    );

    setFieldErrors(
      (
        currentErrors
      ) => ({
        ...currentErrors,
        [field]:
          undefined,
      })
    );

    setError("");
  }

  function validateForm():
    boolean {
    const errors:
      PaymentFormErrors =
      {};

    const paidAmount =
      Number(
        form.paid_amount
      );

    if (
      !form.paid_amount.trim()
    ) {
      errors.paid_amount =
        "Paid amount is required.";
    } else if (
      !Number.isFinite(
        paidAmount
      ) ||
      paidAmount < 0
    ) {
      errors.paid_amount =
        "Enter a valid paid amount.";
    }

    if (
      feeDue &&
      paidAmount >
        Number(
          feeDue.amount_due
        )
    ) {
      errors.paid_amount =
        "Paid amount cannot be greater than the amount due.";
    }

    if (
      !form.paid_date
    ) {
      errors.paid_date =
        "Paid date is required.";
    }

    if (
      form.payment_id.trim()
    ) {
      const paymentId =
        Number(
          form.payment_id
        );

      if (
        !Number.isInteger(
          paymentId
        ) ||
        paymentId <= 0
      ) {
        errors.payment_id =
          "Payment ID must be a positive whole number.";
      }
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
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !feeDue ||
      saving ||
      !validateForm()
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedFeeDue =
        await feeDuesService.markAsPaid(
          feeDue.id,
          {
            paid_amount:
              Number(
                form.paid_amount
              ),
            paid_date:
              form.paid_date,
            payment_id:
              form.payment_id.trim()
                ? Number(
                    form.payment_id
                  )
                : null,
          }
        );

      onPaid({
        ...feeDue,
        ...updatedFeeDue,
      });

      onClose();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Unable to mark this fee due as paid."
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    !open ||
    !feeDue
  ) {
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
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M20 7 10 17l-5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Mark as Paid
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Record the completed membership payment.
                </p>
              </div>
            </div>
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
        >
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {feeDue.student_name ||
                      `Student #${feeDue.student_id}`}
                  </p>

                  {feeDue.student_phone ? (
                    <p className="mt-0.5 text-sm text-slate-500">
                      {
                        feeDue.student_phone
                      }
                    </p>
                  ) : null}
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {
                    feeDue.status
                  }
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Amount due
                  </p>

                  <p className="mt-1 text-base font-bold text-slate-900">
                    {formatCurrency(
                      feeDue.amount_due
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Due date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(
                      feeDue.due_date
                    )}
                  </p>
                </div>

                {feeDue.membership_plan ? (
                  <div className="col-span-2 rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Membership plan
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {
                        feeDue.membership_plan
                      }
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor="paid-amount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Paid amount
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
                  ₹
                </span>

                <input
                  id="paid-amount"
                  type="number"
                  min="0"
                  max={
                    feeDue.amount_due
                  }
                  step="0.01"
                  value={
                    form.paid_amount
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "paid_amount",
                      event.target
                        .value
                    )
                  }
                  disabled={
                    saving
                  }
                  className={`${getInputClassName(
                    Boolean(
                      fieldErrors.paid_amount
                    )
                  )} pl-8`}
                />
              </div>

              {fieldErrors.paid_amount ? (
                <p className="mt-1 text-xs text-red-600">
                  {
                    fieldErrors.paid_amount
                  }
                </p>
              ) : null}

              {isPartialPayment ? (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Remaining balance:{" "}
                  <span className="font-semibold">
                    {formatCurrency(
                      outstandingBalance
                    )}
                  </span>
                </div>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="paid-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Paid date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="paid-date"
                type="date"
                value={
                  form.paid_date
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "paid_date",
                    event.target
                      .value
                  )
                }
                disabled={
                  saving
                }
                className={getInputClassName(
                  Boolean(
                    fieldErrors.paid_date
                  )
                )}
              />

              {fieldErrors.paid_date ? (
                <p className="mt-1 text-xs text-red-600">
                  {
                    fieldErrors.paid_date
                  }
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="payment-record-id"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Payment record ID
                <span className="ml-1 text-xs font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                id="payment-record-id"
                type="number"
                min="1"
                step="1"
                value={
                  form.payment_id
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "payment_id",
                    event.target
                      .value
                  )
                }
                disabled={
                  saving
                }
                placeholder="Link an existing payment record"
                className={getInputClassName(
                  Boolean(
                    fieldErrors.payment_id
                  )
                )}
              />

              {fieldErrors.payment_id ? (
                <p className="mt-1 text-xs text-red-600">
                  {
                    fieldErrors.payment_id
                  }
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Leave this blank when no payment record has been created yet.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path
                    d="M12 8v4m0 4h.01"
                    strokeLinecap="round"
                  />
                </svg>

                <p className="text-sm text-emerald-800">
                  Saving this payment will change the fee due status to{" "}
                  <span className="font-semibold">
                    Paid
                  </span>
                  .
                </p>
              </div>
            </div>
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
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                  Saving Payment...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 7 10 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Mark as Paid
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}