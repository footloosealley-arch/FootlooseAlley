"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import FeeDueDashboard from "@/components/fee-dues/FeeDueDashboard";
import FeeDueFormDialog, {
  FeeDueStudentOption,
} from "@/components/fee-dues/FeeDueFormDialog";
import FeeDueTable from "@/components/fee-dues/FeeDueTable";
import MarkFeeDuePaidDialog from "@/components/fee-dues/MarkFeeDuePaidDialog";

import { supabase } from "@/lib/supabase";

import {
  FeeDue,
  FeeDueFilters,
  FeeDueWithStudent,
  feeDuesService,
} from "@/services/fee-dues.service";

interface StudentDatabaseRow {
  id: number;
  created_at?: string | null;

  Name?: string | null;
  Phone?: string | null;
  Email?: string | null;

  Program?: string | null;
  Fees?: number | null;
  Fees_due?: number | null;
  Status?: string | null;

  membership_plan?: string | null;
  next_due_date?: string | null;
  last_payment_date?: string | null;
  fee_status?: string | null;
  membership_frozen?: boolean | null;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

const INITIAL_FILTERS: FeeDueFilters = {
  search: "",
  status: "All",
  dateFilter: "All",
  studentId: null,
};

function getStudentName(
  student: StudentDatabaseRow
): string {
  return (
    student.Name?.trim() ||
    `Student #${student.id}`
  );
}

function getStudentPhone(
  student: StudentDatabaseRow
): string {
  return student.Phone?.trim() || "";
}

function getStudentEmail(
  student: StudentDatabaseRow
): string | null {
  return student.Email?.trim() || null;
}

function getStudentPlan(
  student: StudentDatabaseRow
): string {
  return (
    student.membership_plan?.trim() ||
    student.Program?.trim() ||
    ""
  );
}

function normalizeStudent(
  student: StudentDatabaseRow
): FeeDueStudentOption {
  return {
    id: Number(student.id),
    name: getStudentName(student),
    phone: getStudentPhone(student) || null,
    membership_plan:
      getStudentPlan(student) || null,
  };
}

function mergeFeeDuesWithStudents(
  feeDues: FeeDue[],
  students: StudentDatabaseRow[]
): FeeDueWithStudent[] {
  const studentMap = new Map<
    number,
    StudentDatabaseRow
  >();

  students.forEach((student) => {
    studentMap.set(
      Number(student.id),
      student
    );
  });

  return feeDues.map((feeDue) => {
    const student = studentMap.get(
      Number(feeDue.student_id)
    );

    return {
      ...feeDue,
      student_name: student
        ? getStudentName(student)
        : `Student #${feeDue.student_id}`,
      student_phone: student
        ? getStudentPhone(student)
        : "",
      student_email: student
        ? getStudentEmail(student)
        : null,
    };
  });
}

function replaceFeeDueRecord(
  records: FeeDueWithStudent[],
  updatedFeeDue:
    | FeeDue
    | FeeDueWithStudent
): FeeDueWithStudent[] {
  return records.map((record) =>
    record.id === updatedFeeDue.id
      ? {
          ...record,
          ...updatedFeeDue,
        }
      : record
  );
}

function SuccessIcon() {
  return (
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
  );
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        d="M12 8v5m0 3h.01"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
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
        d="M18 6 6 18M6 6l12 12"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FeeDuesPage() {
  const [feeDues, setFeeDues] =
    useState<FeeDueWithStudent[]>([]);

  const [students, setStudents] =
    useState<StudentDatabaseRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [filters, setFilters] =
    useState<FeeDueFilters>(
      INITIAL_FILTERS
    );

  const [
    formDialogOpen,
    setFormDialogOpen,
  ] = useState(false);

  const [
    paidDialogOpen,
    setPaidDialogOpen,
  ] = useState(false);

  const [
    selectedFeeDue,
    setSelectedFeeDue,
  ] =
    useState<FeeDueWithStudent | null>(
      null
    );

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const showToast = useCallback(
    (
      type: "success" | "error",
      message: string
    ) => {
      setToast({
        type,
        message,
      });
    },
    []
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setToast(null);
      }, 4500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  const loadStudents =
    useCallback(async (): Promise<
      StudentDatabaseRow[]
    > => {
      const { data, error } =
        await supabase
          .from("Students")
          .select(
            `
            id,
            created_at,
            Name,
            Phone,
            Email,
            Program,
            Fees,
            Fees_due,
            Status,
            membership_plan,
            next_due_date,
            last_payment_date,
            fee_status,
            membership_frozen
          `
          )
          .order("Name", {
            ascending: true,
          });

      if (error) {
        throw new Error(
          `Unable to load students: ${error.message}`
        );
      }

      return (
        (data ??
          []) as StudentDatabaseRow[]
      );
    }, []);

  const loadPageData = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const [
          loadedFeeDues,
          loadedStudents,
        ] = await Promise.all([
          feeDuesService.getFeeDues(),
          loadStudents(),
        ]);

        setStudents(loadedStudents);

        setFeeDues(
          mergeFeeDuesWithStudents(
            loadedFeeDues,
            loadedStudents
          )
        );
      } catch (loadError) {
        showToast(
          "error",
          loadError instanceof Error
            ? loadError.message
            : "Unable to load fee due data."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadStudents, showToast]
  );

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const studentOptions =
    useMemo<FeeDueStudentOption[]>(
      () =>
        students
          .map(normalizeStudent)
          .filter(
            (student) =>
              Number.isInteger(
                student.id
              ) && student.id > 0
          )
          .sort((first, second) =>
            first.name.localeCompare(
              second.name
            )
          ),
      [students]
    );

  const filteredFeeDues =
    useMemo(
      () =>
        feeDuesService.filterFeeDues(
          feeDues,
          filters
        ),
      [feeDues, filters]
    );

  const summary = useMemo(
    () =>
      feeDuesService.calculateSummary(
        feeDues
      ),
    [feeDues]
  );

  function handleAddFeeDue() {
    setSelectedFeeDue(null);
    setFormDialogOpen(true);
  }

  function handleEditFeeDue(
    feeDue: FeeDueWithStudent
  ) {
    setSelectedFeeDue(feeDue);
    setFormDialogOpen(true);
  }

  function handleOpenPaidDialog(
    feeDue: FeeDueWithStudent
  ) {
    setSelectedFeeDue(feeDue);
    setPaidDialogOpen(true);
  }

  function handleFeeDueSaved(
    savedFeeDue: FeeDue
  ) {
    const existingRecord =
      feeDues.find(
        (feeDue) =>
          feeDue.id ===
          savedFeeDue.id
      );

    if (existingRecord) {
      setFeeDues((current) =>
        replaceFeeDueRecord(
          current,
          savedFeeDue
        )
      );

      showToast(
        "success",
        "Fee due updated successfully."
      );

      return;
    }

    const student =
      students.find(
        (item) =>
          Number(item.id) ===
          Number(
            savedFeeDue.student_id
          )
      );

    const newRecord: FeeDueWithStudent =
      {
        ...savedFeeDue,
        student_name: student
          ? getStudentName(student)
          : `Student #${savedFeeDue.student_id}`,
        student_phone: student
          ? getStudentPhone(student)
          : "",
        student_email: student
          ? getStudentEmail(student)
          : null,
      };

    setFeeDues((current) => [
      ...current,
      newRecord,
    ]);

    showToast(
      "success",
      "Fee due added successfully."
    );
  }

  function handlePaid(
    updatedFeeDue: FeeDueWithStudent
  ) {
    setFeeDues((current) =>
      replaceFeeDueRecord(
        current,
        updatedFeeDue
      )
    );

    showToast(
      "success",
      "Payment recorded successfully."
    );
  }

  async function handleSendReminder(
    feeDue: FeeDueWithStudent
  ) {
    if (!feeDue.student_phone) {
      showToast(
        "error",
        "This student does not have a phone number."
      );

      return;
    }

    const studentName =
      feeDue.student_name ||
      `Student #${feeDue.student_id}`;

    const whatsappUrl =
      feeDuesService.getWhatsAppUrl(
        feeDue.student_phone,
        studentName,
        feeDue
      );

    const popup = window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!popup) {
      window.location.href =
        whatsappUrl;
    }

    try {
      const updatedFeeDue =
        await feeDuesService.recordReminder(
          feeDue.id
        );

      setFeeDues((current) =>
        replaceFeeDueRecord(
          current,
          updatedFeeDue
        )
      );
    } catch (reminderError) {
      showToast(
        "error",
        reminderError instanceof Error
          ? reminderError.message
          : "WhatsApp opened, but the reminder count could not be updated."
      );
    }
  }

  function handleCallStudent(
    feeDue: FeeDueWithStudent
  ) {
    if (!feeDue.student_phone) {
      showToast(
        "error",
        "This student does not have a phone number."
      );

      return;
    }

    window.location.href =
      feeDuesService.getCallUrl(
        feeDue.student_phone
      );
  }

  async function handleWaive(
    feeDue: FeeDueWithStudent
  ) {
    const confirmed =
      window.confirm(
        `Mark the fee due for ${
          feeDue.student_name ||
          `Student #${feeDue.student_id}`
        } as waived?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        await feeDuesService.markAsWaived(
          feeDue.id,
          feeDue.notes ||
            "Fee waived."
        );

      setFeeDues((current) =>
        replaceFeeDueRecord(
          current,
          updated
        )
      );

      showToast(
        "success",
        "Fee due marked as waived."
      );
    } catch (waiveError) {
      showToast(
        "error",
        waiveError instanceof Error
          ? waiveError.message
          : "Unable to waive the fee due."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(
    feeDue: FeeDueWithStudent
  ) {
    const confirmed =
      window.confirm(
        `Cancel this fee due for ${
          feeDue.student_name ||
          `Student #${feeDue.student_id}`
        }?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        await feeDuesService.markAsCancelled(
          feeDue.id,
          feeDue.notes ||
            "Fee due cancelled."
        );

      setFeeDues((current) =>
        replaceFeeDueRecord(
          current,
          updated
        )
      );

      showToast(
        "success",
        "Fee due cancelled."
      );
    } catch (cancelError) {
      showToast(
        "error",
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel the fee due."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReopen(
    feeDue: FeeDueWithStudent
  ) {
    const confirmed =
      window.confirm(
        `Reopen this fee due for ${
          feeDue.student_name ||
          `Student #${feeDue.student_id}`
        }?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        await feeDuesService.reopenFeeDue(
          feeDue.id
        );

      setFeeDues((current) =>
        replaceFeeDueRecord(
          current,
          updated
        )
      );

      showToast(
        "success",
        "Fee due reopened."
      );
    } catch (reopenError) {
      showToast(
        "error",
        reopenError instanceof Error
          ? reopenError.message
          : "Unable to reopen the fee due."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(
    feeDue: FeeDueWithStudent
  ) {
    const confirmed =
      window.confirm(
        `Permanently delete the fee due for ${
          feeDue.student_name ||
          `Student #${feeDue.student_id}`
        }?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      await feeDuesService.deleteFeeDue(
        feeDue.id
      );

      setFeeDues((current) =>
        current.filter(
          (record) =>
            record.id !== feeDue.id
        )
      );

      showToast(
        "success",
        "Fee due deleted."
      );
    } catch (deleteError) {
      showToast(
        "error",
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the fee due."
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="relative min-h-full">
      <div className="space-y-6">
        <FeeDueDashboard
          summary={summary}
          filters={filters}
          loading={
            loading ||
            actionLoading
          }
          onFiltersChange={
            setFilters
          }
          onAddFeeDue={
            handleAddFeeDue
          }
          onRefresh={() =>
            void loadPageData(false)
          }
        />

        <FeeDueTable
          feeDues={
            filteredFeeDues
          }
          loading={loading}
          onEdit={
            handleEditFeeDue
          }
          onMarkPaid={
            handleOpenPaidDialog
          }
          onSendReminder={
            handleSendReminder
          }
          onCallStudent={
            handleCallStudent
          }
          onWaive={handleWaive}
          onCancel={handleCancel}
          onReopen={handleReopen}
          onDelete={handleDelete}
        />
      </div>

      <FeeDueFormDialog
        open={formDialogOpen}
        students={studentOptions}
        feeDue={selectedFeeDue}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedFeeDue(null);
        }}
        onSaved={
          handleFeeDueSaved
        }
      />

      <MarkFeeDuePaidDialog
        open={paidDialogOpen}
        feeDue={selectedFeeDue}
        onClose={() => {
          setPaidDialogOpen(false);
          setSelectedFeeDue(null);
        }}
        onPaid={handlePaid}
      />

      {actionLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 animate-spin text-violet-600"
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

            <p className="text-sm font-semibold text-slate-700">
              Updating fee due...
            </p>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[70] w-[calc(100%-2.5rem)] max-w-sm">
          <div
            role="status"
            className={[
              "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl",
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
          >
            <div
              className={[
                "mt-0.5 shrink-0",
                toast.type === "success"
                  ? "text-emerald-600"
                  : "text-red-600",
              ].join(" ")}
            >
              {toast.type ===
              "success" ? (
                <SuccessIcon />
              ) : (
                <ErrorIcon />
              )}
            </div>

            <p className="min-w-0 flex-1 text-sm font-medium leading-5">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
              aria-label="Close notification"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}