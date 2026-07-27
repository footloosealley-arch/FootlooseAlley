"use client";

import {
  FeeDueStatus,
  FeeDueWithStudent,
  feeDuesService,
} from "@/services/fee-dues.service";

interface FeeDueTableProps {
  feeDues: FeeDueWithStudent[];
  loading?: boolean;
  onEdit: (
    feeDue: FeeDueWithStudent
  ) => void;
  onMarkPaid: (
    feeDue: FeeDueWithStudent
  ) => void;
  onSendReminder: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCallStudent: (
    feeDue: FeeDueWithStudent
  ) => void;
  onWaive: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCancel: (
    feeDue: FeeDueWithStudent
  ) => void;
  onReopen: (
    feeDue: FeeDueWithStudent
  ) => void;
  onDelete: (
    feeDue: FeeDueWithStudent
  ) => void;
}

interface StatusBadgeStyle {
  background: string;
  text: string;
  dot: string;
}

const STATUS_STYLES: Record<
  FeeDueStatus,
  StatusBadgeStyle
> = {
  Pending: {
    background: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  "Due Today": {
    background: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Overdue: {
    background: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  Paid: {
    background: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Waived: {
    background: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  Cancelled: {
    background: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
};

function StatusBadge({
  status,
}: {
  status: FeeDueStatus;
}) {
  const style =
    STATUS_STYLES[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.background,
        style.text,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          style.dot,
        ].join(" ")}
      />

      {status}
    </span>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 animate-spin"
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
  );
}

function EmptyStateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-10 w-10"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path
        d="M8 3v4M16 3v4M3 10h18"
        strokeLinecap="round"
      />

      <path
        d="M8 15h8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m14 5 5 5M4 20l3.5-.7L19 7.8a2 2 0 0 0 0-2.8 2 2 0 0 0-2.8 0L4.7 16.5 4 20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
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
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 21l1.6-4.7A8.5 8.5 0 1 1 20.5 11.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8.4 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .7.7 1.2 1.7 2.1 2.9 2.7.3.2.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.6 0 .5-.2 1.3-.7 1.8-.7.7-1.7 1-2.8.7-1.8-.5-3.4-1.5-4.8-2.8-1.2-1.1-2.2-2.5-2.7-4.1-.3-.9-.2-1.6.1-2.2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5 10 8l-1.8 1.8a14.2 14.2 0 0 0 6 6L16 14l3.5 2.5v3c0 .8-.7 1.5-1.5 1.5C9.7 21 3 14.3 3 6c0-.8.7-1.5 1.5-1.5h3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="5"
        cy="12"
        r="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="1.5"
      />

      <circle
        cx="19"
        cy="12"
        r="1.5"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActionButton({
  title,
  onClick,
  children,
  className = "",
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function getDueDateText(
  feeDue: FeeDueWithStudent
): string {
  if (
    feeDue.status === "Paid"
  ) {
    return feeDue.paid_date
      ? `Paid ${feeDuesService.formatDate(
          feeDue.paid_date
        )}`
      : "Payment completed";
  }

  if (
    feeDue.status === "Waived"
  ) {
    return "Payment waived";
  }

  if (
    feeDue.status === "Cancelled"
  ) {
    return "Fee due cancelled";
  }

  const days =
    feeDuesService.getDaysUntilDue(
      feeDue.due_date
    );

  if (days < 0) {
    const overdueDays =
      Math.abs(days);

    return `${overdueDays} ${
      overdueDays === 1
        ? "day"
        : "days"
    } overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `Due in ${days} days`;
}

function FeeDueActions({
  feeDue,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onCallStudent,
  onWaive,
  onCancel,
  onReopen,
  onDelete,
}: {
  feeDue: FeeDueWithStudent;
  onEdit: (
    feeDue: FeeDueWithStudent
  ) => void;
  onMarkPaid: (
    feeDue: FeeDueWithStudent
  ) => void;
  onSendReminder: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCallStudent: (
    feeDue: FeeDueWithStudent
  ) => void;
  onWaive: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCancel: (
    feeDue: FeeDueWithStudent
  ) => void;
  onReopen: (
    feeDue: FeeDueWithStudent
  ) => void;
  onDelete: (
    feeDue: FeeDueWithStudent
  ) => void;
}) {
  const isActive =
    feeDue.status ===
      "Pending" ||
    feeDue.status ===
      "Due Today" ||
    feeDue.status ===
      "Overdue";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {isActive ? (
        <>
          <ActionButton
            title="Mark as paid"
            onClick={() =>
              onMarkPaid(
                feeDue
              )
            }
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <CheckIcon />
          </ActionButton>

          <ActionButton
            title={
              feeDue.student_phone
                ? "Send WhatsApp reminder"
                : "Phone number unavailable"
            }
            onClick={() =>
              onSendReminder(
                feeDue
              )
            }
            disabled={
              !feeDue.student_phone
            }
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <WhatsAppIcon />
          </ActionButton>

          <ActionButton
            title={
              feeDue.student_phone
                ? "Call student"
                : "Phone number unavailable"
            }
            onClick={() =>
              onCallStudent(
                feeDue
              )
            }
            disabled={
              !feeDue.student_phone
            }
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <PhoneIcon />
          </ActionButton>
        </>
      ) : null}

      <ActionButton
        title="Edit fee due"
        onClick={() =>
          onEdit(
            feeDue
          )
        }
        className="border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
      >
        <EditIcon />
      </ActionButton>

      <details className="relative">
        <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
          <span className="sr-only">
            More actions
          </span>

          <MoreIcon />
        </summary>

        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {isActive ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onWaive(
                    feeDue
                  )
                }
                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Mark as waived
              </button>

              <button
                type="button"
                onClick={() =>
                  onCancel(
                    feeDue
                  )
                }
                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Cancel fee due
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                onReopen(
                  feeDue
                )
              }
              className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Reopen fee due
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() =>
              onDelete(
                feeDue
              )
            }
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <DeleteIcon />

            Delete
          </button>
        </div>
      </details>
    </div>
  );
}

function MobileFeeDueCard({
  feeDue,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onCallStudent,
  onWaive,
  onCancel,
  onReopen,
  onDelete,
}: {
  feeDue: FeeDueWithStudent;
  onEdit: (
    feeDue: FeeDueWithStudent
  ) => void;
  onMarkPaid: (
    feeDue: FeeDueWithStudent
  ) => void;
  onSendReminder: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCallStudent: (
    feeDue: FeeDueWithStudent
  ) => void;
  onWaive: (
    feeDue: FeeDueWithStudent
  ) => void;
  onCancel: (
    feeDue: FeeDueWithStudent
  ) => void;
  onReopen: (
    feeDue: FeeDueWithStudent
  ) => void;
  onDelete: (
    feeDue: FeeDueWithStudent
  ) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
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

        <StatusBadge
          status={
            feeDue.status
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Amount
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {feeDuesService.formatCurrency(
              feeDue.amount_due
            )}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Due date
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {feeDuesService.formatDate(
              feeDue.due_date
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {feeDue.membership_plan ||
              "No plan selected"}
          </p>

          <p
            className={[
              "mt-0.5 text-xs",
              feeDue.status ===
                "Overdue"
                ? "font-semibold text-red-600"
                : "text-slate-500",
            ].join(" ")}
          >
            {getDueDateText(
              feeDue
            )}
          </p>
        </div>

        {feeDue.reminder_count >
        0 ? (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            {
              feeDue.reminder_count
            }{" "}
            reminder
            {feeDue.reminder_count ===
            1
              ? ""
              : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <FeeDueActions
          feeDue={feeDue}
          onEdit={onEdit}
          onMarkPaid={
            onMarkPaid
          }
          onSendReminder={
            onSendReminder
          }
          onCallStudent={
            onCallStudent
          }
          onWaive={onWaive}
          onCancel={onCancel}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

export default function FeeDueTable({
  feeDues,
  loading = false,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onCallStudent,
  onWaive,
  onCancel,
  onReopen,
  onDelete,
}: FeeDueTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />

          <p className="text-sm font-medium">
            Loading fee dues...
          </p>
        </div>
      </div>
    );
  }

  if (
    feeDues.length === 0
  ) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <EmptyStateIcon />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No fee dues found
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            There are no fee due records matching the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {feeDues.map(
          (feeDue) => (
            <MobileFeeDueCard
              key={
                feeDue.id
              }
              feeDue={
                feeDue
              }
              onEdit={
                onEdit
              }
              onMarkPaid={
                onMarkPaid
              }
              onSendReminder={
                onSendReminder
              }
              onCallStudent={
                onCallStudent
              }
              onWaive={
                onWaive
              }
              onCancel={
                onCancel
              }
              onReopen={
                onReopen
              }
              onDelete={
                onDelete
              }
            />
          )
        )}
      </div>

      <div className="hidden overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Membership
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due date
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reminders
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {feeDues.map(
                (feeDue) => (
                  <tr
                    key={
                      feeDue.id
                    }
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="min-w-0">
                        <p className="max-w-48 truncate font-semibold text-slate-900">
                          {feeDue.student_name ||
                            `Student #${feeDue.student_id}`}
                        </p>

                        {feeDue.student_phone ? (
                          <p className="mt-0.5 text-sm text-slate-500">
                            {
                              feeDue.student_phone
                            }
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-slate-400">
                            No phone number
                          </p>
                        )}

                        {feeDue.student_email ? (
                          <p className="mt-0.5 max-w-52 truncate text-xs text-slate-400">
                            {
                              feeDue.student_email
                            }
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-slate-800">
                        {feeDue.membership_plan ||
                          "—"}
                      </p>

                      {feeDue.billing_period_start ||
                      feeDue.billing_period_end ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {feeDuesService.formatDate(
                            feeDue.billing_period_start
                          )}
                          {" – "}
                          {feeDuesService.formatDate(
                            feeDue.billing_period_end
                          )}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-slate-900">
                        {feeDuesService.formatCurrency(
                          feeDue.amount_due
                        )}
                      </p>

                      {feeDue.status ===
                        "Paid" &&
                      feeDue.paid_amount !==
                        null ? (
                        <p className="mt-1 text-xs text-emerald-600">
                          Paid{" "}
                          {feeDuesService.formatCurrency(
                            feeDue.paid_amount
                          )}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-slate-800">
                        {feeDuesService.formatDate(
                          feeDue.due_date
                        )}
                      </p>

                      <p
                        className={[
                          "mt-1 text-xs",
                          feeDue.status ===
                            "Overdue"
                            ? "font-semibold text-red-600"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {getDueDateText(
                          feeDue
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <StatusBadge
                        status={
                          feeDue.status
                        }
                      />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-800">
                        {
                          feeDue.reminder_count
                        }
                      </p>

                      {feeDue.last_reminder_sent_at ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Last sent{" "}
                          {new Date(
                            feeDue.last_reminder_sent_at
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          Not sent
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <FeeDueActions
                        feeDue={
                          feeDue
                        }
                        onEdit={
                          onEdit
                        }
                        onMarkPaid={
                          onMarkPaid
                        }
                        onSendReminder={
                          onSendReminder
                        }
                        onCallStudent={
                          onCallStudent
                        }
                        onWaive={
                          onWaive
                        }
                        onCancel={
                          onCancel
                        }
                        onReopen={
                          onReopen
                        }
                        onDelete={
                          onDelete
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {feeDues.length}
            </span>{" "}
            fee due{" "}
            {feeDues.length ===
            1
              ? "record"
              : "records"}
          </p>
        </div>
      </div>
    </>
  );
}