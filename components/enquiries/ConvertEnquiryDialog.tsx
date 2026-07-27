"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  UserRoundPlus,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  CONVERSION_MEMBERSHIP_PLANS,
  enquiryConversionService,
  type ConversionMembershipPlan,
  type EnquiryConversionResult,
} from "@/services/enquiry-conversion.service";

import {
  studentsService,
} from "@/services/students.service";

import type {
  Enquiry,
} from "@/services/enquiries.service";

interface ConvertEnquiryDialogProps {
  open: boolean;

  enquiry:
    | Enquiry
    | null;

  onClose: () => void;

  onConverted: (
    result: EnquiryConversionResult
  ) => void | Promise<void>;
}

interface ClassOption {
  id: number;
  class_name?: string | null;
  program?: string | null;
  day?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
}

interface InstructorOption {
  id: number;
  name?: string | null;
  phone?: string | null;
  specialization?: string | null;
  status?: string | null;
}

interface ConversionFormState {
  membershipPlan:
    ConversionMembershipPlan;

  membershipAmount: string;

  amountPaid: string;

  joinDate: string;

  dueDate: string;

  billingPeriodStart: string;

  billingPeriodEnd: string;

  classId: string;

  instructorId: string;

  createFeeDue: boolean;

  whatsappEnabled: boolean;

  notes: string;
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

function createInitialFormState(
  enquiry:
    | Enquiry
    | null
): ConversionFormState {
  const today =
    getLocalDateString();

  const membershipPlan:
    ConversionMembershipPlan =
    "Monthly";

  const membershipAmount =
    enquiryConversionService
      .getDefaultMembershipAmount(
        membershipPlan
      );

  const billingPeriodEnd =
    enquiryConversionService
      .getMembershipEndDate(
        today,
        membershipPlan
      );

  return {
    membershipPlan,

    membershipAmount:
      String(
        membershipAmount
      ),

    amountPaid:
      "0",

    joinDate:
      today,

    dueDate:
      today,

    billingPeriodStart:
      today,

    billingPeriodEnd,

    classId:
      "",

    instructorId:
      "",

    createFeeDue:
      true,

    whatsappEnabled:
      true,

    notes:
      enquiry
        ? `Converted from enquiry #${enquiry.id}.`
        : "",
  };
}

function parseMoney(
  value: string
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return 0;
  }

  return parsed;
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function formatClassLabel(
  classOption: ClassOption
): string {
  const title =
    classOption.class_name?.trim() ||
    classOption.program?.trim() ||
    `Class #${classOption.id}`;

  const schedule =
    [
      classOption.day,
      classOption.start_time,
    ]
      .filter(Boolean)
      .join(" · ");

  return schedule
    ? `${title} — ${schedule}`
    : title;
}

function formatInstructorLabel(
  instructor:
    InstructorOption
): string {
  const name =
    instructor.name?.trim() ||
    `Instructor #${instructor.id}`;

  const specialization =
    instructor.specialization?.trim();

  return specialization
    ? `${name} — ${specialization}`
    : name;
}

export default function ConvertEnquiryDialog({
  open,
  enquiry,
  onClose,
  onConverted,
}: ConvertEnquiryDialogProps) {
  const [
    form,
    setForm,
  ] =
    useState<ConversionFormState>(
      () =>
        createInitialFormState(
          enquiry
        )
    );

  const [
    classes,
    setClasses,
  ] =
    useState<ClassOption[]>(
      []
    );

  const [
    instructors,
    setInstructors,
  ] =
    useState<
      InstructorOption[]
    >([]);

  const [
    loadingOptions,
    setLoadingOptions,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      createInitialFormState(
        enquiry
      )
    );

    setError(null);
  }, [
    open,
    enquiry,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled =
      false;

    async function loadOptions() {
      setLoadingOptions(
        true
      );

      try {
        const [
          loadedClasses,
          loadedInstructors,
        ] =
          await Promise.all([
            studentsService.getClasses(),
            studentsService.getInstructors(),
          ]);

        if (cancelled) {
          return;
        }

        setClasses(
          (
            loadedClasses ??
            []
          ) as ClassOption[]
        );

        setInstructors(
          (
            loadedInstructors ??
            []
          ) as InstructorOption[]
        );
      } catch (
        optionsError
      ) {
        if (cancelled) {
          return;
        }

        setError(
          optionsError instanceof
            Error
            ? optionsError.message
            : "Unable to load classes and instructors."
        );
      } finally {
        if (!cancelled) {
          setLoadingOptions(
            false
          );
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled =
        true;
    };
  }, [open]);

  const membershipAmount =
    useMemo(
      () =>
        parseMoney(
          form.membershipAmount
        ),
      [
        form.membershipAmount,
      ]
    );

  const amountPaid =
    useMemo(
      () =>
        parseMoney(
          form.amountPaid
        ),
      [
        form.amountPaid,
      ]
    );

  const amountDue =
    useMemo(
      () =>
        Math.max(
          0,
          membershipAmount -
            amountPaid
        ),
      [
        membershipAmount,
        amountPaid,
      ]
    );

  function updateForm<
    Key extends keyof ConversionFormState
  >(
    key: Key,
    value:
      ConversionFormState[Key]
  ) {
    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,
        [key]: value,
      })
    );
  }

  function handleMembershipPlanChange(
    value: string
  ) {
    const membershipPlan =
      value as ConversionMembershipPlan;

    const defaultAmount =
      enquiryConversionService
        .getDefaultMembershipAmount(
          membershipPlan
        );

    const membershipEndDate =
      membershipPlan ===
      "Custom"
        ? form.billingPeriodEnd
        : enquiryConversionService
            .getMembershipEndDate(
              form.billingPeriodStart ||
                form.joinDate,
              membershipPlan
            );

    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,

        membershipPlan,

        membershipAmount:
          membershipPlan ===
          "Custom"
            ? currentForm.membershipAmount
            : String(
                defaultAmount
              ),

        billingPeriodEnd:
          membershipEndDate,
      })
    );
  }

  function handleJoinDateChange(
    value: string
  ) {
    const membershipEndDate =
      form.membershipPlan ===
      "Custom"
        ? form.billingPeriodEnd
        : enquiryConversionService
            .getMembershipEndDate(
              value,
              form.membershipPlan
            );

    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,

        joinDate:
          value,

        dueDate:
          currentForm.dueDate ||
          value,

        billingPeriodStart:
          value,

        billingPeriodEnd:
          membershipEndDate,
      })
    );
  }

  function handleBillingStartChange(
    value: string
  ) {
    const membershipEndDate =
      form.membershipPlan ===
      "Custom"
        ? form.billingPeriodEnd
        : enquiryConversionService
            .getMembershipEndDate(
              value,
              form.membershipPlan
            );

    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,

        billingPeriodStart:
          value,

        billingPeriodEnd:
          membershipEndDate,
      })
    );
  }

  function validateForm():
    string | null {
    if (!enquiry) {
      return "No enquiry was selected.";
    }

    if (
      !form.joinDate
    ) {
      return "Join date is required.";
    }

    if (
      !form.dueDate
    ) {
      return "Due date is required.";
    }

    if (
      !form.billingPeriodStart
    ) {
      return "Membership start date is required.";
    }

    if (
      !form.billingPeriodEnd
    ) {
      return "Membership end date is required.";
    }

    if (
      membershipAmount <= 0
    ) {
      return "Membership amount must be greater than zero.";
    }

    if (
      amountPaid < 0
    ) {
      return "Amount paid cannot be negative.";
    }

    if (
      amountPaid >
      membershipAmount
    ) {
      return "Amount paid cannot be greater than the membership amount.";
    }

    if (
      form.billingPeriodEnd <
      form.billingPeriodStart
    ) {
      return "Membership end date cannot be before the start date.";
    }

    return null;
  }

  async function handleSubmit() {
    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    if (!enquiry) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result =
        await enquiryConversionService
          .convertEnquiry({
            enquiry,

            membershipPlan:
              form.membershipPlan,

            membershipAmount,

            amountPaid,

            joinDate:
              form.joinDate,

            dueDate:
              form.dueDate,

            billingPeriodStart:
              form.billingPeriodStart,

            billingPeriodEnd:
              form.billingPeriodEnd,

            classId:
              form.classId
                ? Number(
                    form.classId
                  )
                : null,

            instructorId:
              form.instructorId
                ? Number(
                    form.instructorId
                  )
                : null,

            createFeeDue:
              form.createFeeDue &&
              amountDue > 0,

            whatsappEnabled:
              form.whatsappEnabled,

            notes:
              form.notes.trim() ||
              null,
          });

      await onConverted(
        result
      );

      onClose();
    } catch (
      conversionError
    ) {
      console.error(
        "Enquiry conversion failed:",
        conversionError
      );

      setError(
        conversionError instanceof
          Error
          ? conversionError.message
          : "Unable to convert the enquiry into a student."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) {
      return;
    }

    setError(null);
    onClose();
  }

  function handleOpenChange(
    nextOpen: boolean
  ) {
    if (
      !nextOpen
    ) {
      handleClose();
    }
  }

  if (!enquiry) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="max-h-[94vh] overflow-hidden p-0 sm:max-w-4xl">
        <div className="flex max-h-[94vh] flex-col">
          <DialogHeader className="border-b px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <UserRoundPlus className="h-5 w-5 text-primary" />

                  Convert to Student
                </DialogTitle>

                <DialogDescription className="mt-1.5">
                  Create a student, assign their membership, and generate their first fee due.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-5 py-5 sm:px-6">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Enquiry
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {enquiry.name}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>
                        {enquiry.phone}
                      </p>

                      {enquiry.email ? (
                        <p>
                          {enquiry.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-background px-4 py-3 sm:text-right">
                    <p className="text-xs text-muted-foreground">
                      Interested in
                    </p>

                    <p className="mt-1 font-semibold">
                      {enquiry.interested_in}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Source:{" "}
                      {enquiry.source}
                    </p>
                  </div>
                </div>

                {enquiry.converted_student_id ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <p>
                      This enquiry is already linked to student #
                      {enquiry.converted_student_id}. The existing student will be used.
                    </p>
                  </div>
                ) : null}
              </div>

              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <p className="leading-5">
                    {error}
                  </p>
                </div>
              ) : null}

              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Membership details
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the plan and confirm the membership amount.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Membership plan
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </span>

                    <select
                      value={
                        form.membershipPlan
                      }
                      disabled={
                        saving
                      }
                      onChange={(
                        event
                      ) =>
                        handleMembershipPlanChange(
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {CONVERSION_MEMBERSHIP_PLANS.map(
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
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Membership amount
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </span>

                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.membershipAmount
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "membershipAmount",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Amount paid now
                    </span>

                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.amountPaid
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "amountPaid",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <div className="rounded-xl border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Remaining fee due
                    </p>

                    <p
                      className={[
                        "mt-1 text-xl font-bold",
                        amountDue >
                        0
                          ? "text-amber-600"
                          : "text-green-600",
                      ].join(
                        " "
                      )}
                    >
                      {formatCurrency(
                        amountDue
                      )}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {amountDue >
                      0
                        ? "A fee-due record can be created automatically."
                        : "Membership is fully paid."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="font-semibold">
                    Membership dates
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm when the student joins and when their payment is due.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Join date
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </span>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="date"
                        value={
                          form.joinDate
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          handleJoinDateChange(
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Fee due date
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </span>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="date"
                        value={
                          form.dueDate
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "dueDate",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Membership start
                    </span>

                    <input
                      type="date"
                      value={
                        form.billingPeriodStart
                      }
                      disabled={
                        saving
                      }
                      onChange={(
                        event
                      ) =>
                        handleBillingStartChange(
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      Membership end
                    </span>

                    <input
                      type="date"
                      value={
                        form.billingPeriodEnd
                      }
                      disabled={
                        saving
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "billingPeriodEnd",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="font-semibold">
                    Class assignment
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Class and instructor are optional and can be assigned later.
                  </p>
                </div>

                {loadingOptions ? (
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Loading classes and instructors...
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Class
                      </span>

                      <select
                        value={
                          form.classId
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "classId",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          Assign later
                        </option>

                        {classes.map(
                          (
                            classOption
                          ) => (
                            <option
                              key={
                                classOption.id
                              }
                              value={
                                classOption.id
                              }
                            >
                              {formatClassLabel(
                                classOption
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Instructor
                      </span>

                      <select
                        value={
                          form.instructorId
                        }
                        disabled={
                          saving
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "instructorId",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          Assign later
                        </option>

                        {instructors.map(
                          (
                            instructor
                          ) => (
                            <option
                              key={
                                instructor.id
                              }
                              value={
                                instructor.id
                              }
                            >
                              {formatInstructorLabel(
                                instructor
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>
                )}
              </section>

              <section className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="font-semibold">
                    Conversion options
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose what should happen automatically after conversion.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    className={[
                      "flex items-start gap-3 rounded-xl border p-4 transition",
                      amountDue >
                      0
                        ? "cursor-pointer hover:bg-muted/30"
                        : "cursor-not-allowed opacity-60",
                    ].join(
                      " "
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form.createFeeDue &&
                        amountDue >
                          0
                      }
                      disabled={
                        saving ||
                        amountDue <=
                          0
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "createFeeDue",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4 rounded border"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Create first fee due
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Create a fee-due record for{" "}
                        {formatCurrency(
                          amountDue
                        )}{" "}
                        with the selected due date.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={
                        form.whatsappEnabled
                      }
                      disabled={
                        saving
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "whatsappEnabled",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4 rounded border"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Enable WhatsApp contact
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Allow WhatsApp reminders and communication for this student.
                      </p>
                    </div>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    Notes
                  </span>

                  <textarea
                    value={
                      form.notes
                    }
                    disabled={
                      saving
                    }
                    rows={3}
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Add any notes about this conversion..."
                    className="w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </section>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="font-semibold text-green-800">
                      Ready to convert
                    </p>

                    <div className="mt-2 space-y-1 text-sm text-green-700">
                      <p>
                        Student:{" "}
                        <span className="font-medium">
                          {enquiry.name}
                        </span>
                      </p>

                      <p>
                        Membership:{" "}
                        <span className="font-medium">
                          {form.membershipPlan}
                        </span>
                      </p>

                      <p>
                        Total amount:{" "}
                        <span className="font-medium">
                          {formatCurrency(
                            membershipAmount
                          )}
                        </span>
                      </p>

                      <p>
                        Remaining due:{" "}
                        <span className="font-medium">
                          {formatCurrency(
                            amountDue
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={
                saving
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-background px-5 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" />

              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={
                saving ||
                loadingOptions
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Converting...
                </>
              ) : (
                <>
                  <UserRoundPlus className="h-4 w-4" />

                  Create Student
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}