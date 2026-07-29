"use client";

import Link from "next/link";
import {
  useCallback,
  useState,
} from "react";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRoundCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import PrivateStudentPhoto from "@/components/students/PrivateStudentPhoto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import { studentIntakeService } from "@/services/student-intake.service";

import type {
  StudentIntakeSubmission,
} from "@/types/student-intake";

type StudentIntakePanelProps = {
  onStudentCreated: () =>
    void | Promise<void>;
};

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="break-words text-sm font-medium">
          {value?.trim() ||
            "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function StudentIntakePanel({
  onStudentCreated,
}: StudentIntakePanelProps) {
  const [
    registrations,
    setRegistrations,
  ] = useState<
    StudentIntakeSubmission[]
  >([]);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [
    processingId,
    setProcessingId,
  ] = useState<number | null>(null);

  const [
    rejectTarget,
    setRejectTarget,
  ] =
    useState<StudentIntakeSubmission | null>(
      null
    );

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const fetchData = useCallback(
    () =>
      studentIntakeService.getPending(),
    []
  );

  const commitData = useCallback(
    (
      result:
        StudentIntakeSubmission[]
    ) => {
      setRegistrations(result);
      setLoadError(null);
    },
    []
  );

  const handleLoadError = useCallback(
    (error: unknown) => {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load pending registrations."
      );
    },
    []
  );

  const {
    loading,
    refresh,
  } = useLatestAsync({
    fetchData,
    onSuccess: commitData,
    onError: handleLoadError,
  });

  async function handleApprove(
    registration:
      StudentIntakeSubmission
  ) {
    setProcessingId(
      registration.id
    );

    try {
      const studentId =
        await studentIntakeService.approve(
          registration.id
        );

      toast.success(
        `${registration.Name} was added as an inactive student.`
      );

      await Promise.all([
        refresh(),
        onStudentCreated(),
      ]);

      toast.info(
        <span>
          Assign membership, fees, class,
          and instructor from{" "}
          <Link
            href={`/students/${studentId}/edit`}
            className="font-semibold underline"
          >
            Edit Student
          </Link>
          .
        </span>
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to approve this registration."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(
    registration:
      StudentIntakeSubmission
  ) {
    setRejectionReason("");
    setRejectTarget(registration);
  }

  async function handleReject() {
    if (!rejectTarget) {
      return;
    }

    setProcessingId(
      rejectTarget.id
    );

    try {
      await studentIntakeService.reject(
        rejectTarget.id,
        rejectionReason
      );

      toast.success(
        `${rejectTarget.Name}'s registration was rejected.`
      );

      setRejectTarget(null);
      setRejectionReason("");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to reject this registration."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mb-6">
        <LoadingCard title="Loading Google registrations..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mb-6">
        <ErrorCard
          title="Unable to load Google registrations"
          message={loadError}
          onRetry={() => {
            void refresh();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <section className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-amber-200 bg-amber-100/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500 p-2 text-white">
              <ClipboardCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-amber-950">
                Pending Google registrations
              </h2>

              <p className="text-sm text-amber-800">
                {registrations.length} registration
                {registrations.length === 1
                  ? ""
                  : "s"}{" "}
                waiting for staff approval
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refresh();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {registrations.length === 0 ? (
          <div className="px-5 py-7 text-center text-sm text-muted-foreground">
            New Student Registration Form
            responses will appear here for
            approval.
          </div>
        ) : (
          <div className="grid gap-4 p-4 xl:grid-cols-2">
            {registrations.map(
              (registration) => {
                const processing =
                  processingId ===
                  registration.id;

                return (
                  <article
                    key={registration.id}
                    className="rounded-2xl border bg-background p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        {registration.photo_path ? (
                          <PrivateStudentPhoto
                            path={
                              registration.photo_path
                            }
                            alt={
                              registration.Name
                            }
                            className="h-14 w-14 rounded-2xl object-cover ring-1 ring-border"
                            fallback={
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                                {registration.Name
                                  .trim()
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                            {registration.Name
                              .trim()
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-semibold">
                            {registration.Name}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            Submitted{" "}
                            {formatDate(
                              registration.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Detail
                        icon={
                          <Phone className="h-4 w-4" />
                        }
                        label="Phone"
                        value={
                          registration.Phone
                        }
                      />

                      <Detail
                        icon={
                          <Mail className="h-4 w-4" />
                        }
                        label="Email"
                        value={
                          registration.Email
                        }
                      />

                      <Detail
                        icon={
                          <UserRoundCheck className="h-4 w-4" />
                        }
                        label="Program"
                        value={
                          registration.Program
                        }
                      />

                      <Detail
                        icon={
                          <CalendarDays className="h-4 w-4" />
                        }
                        label="Preferred batch"
                        value={
                          registration.batch
                        }
                      />

                      <div className="sm:col-span-2">
                        <Detail
                          icon={
                            <MapPin className="h-4 w-4" />
                          }
                          label="Address"
                          value={
                            registration.Address
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={() =>
                          openRejectDialog(
                            registration
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>

                      <Button
                        type="button"
                        disabled={processing}
                        onClick={() => {
                          void handleApprove(
                            registration
                          );
                        }}
                      >
                        <Check className="h-4 w-4" />
                        {processing
                          ? "Approving..."
                          : "Approve student"}
                      </Button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (
            !open &&
            processingId === null
          ) {
            setRejectTarget(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject registration
            </DialogTitle>

            <DialogDescription>
              {rejectTarget
                ? `Reject ${rejectTarget.Name}'s pending registration?`
                : "Reject this pending registration?"}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectionReason}
            disabled={
              processingId !== null
            }
            placeholder="Optional reason for your records"
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                processingId !== null
              }
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={
                processingId !== null
              }
              onClick={() => {
                void handleReject();
              }}
            >
              {processingId !== null
                ? "Rejecting..."
                : "Reject registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
