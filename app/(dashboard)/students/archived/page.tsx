"use client";

import Link from "next/link";
import { ArchiveRestore, ArrowLeft, Loader2, Trash2, Users } from "lucide-react";
import { useState } from "react";

import EmptyState from "@/components/common/EmptyState";
import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import PageHeader from "@/components/layout/PageHeader";
import { useAsync } from "@/hooks/useAsync";
import { archivedStudentsService } from "@/services/archived-students.service";

export default function ArchivedStudentsPage() {
  const [workingStudentId, setWorkingStudentId] = useState<number | null>(null);
  const { data, loading, error, refresh } = useAsync(
    () => archivedStudentsService.getArchivedStudents(),
    "archived-students"
  );

  async function handleRestore(id: number, name: string) {
    if (workingStudentId !== null) return;
    const confirmed = window.confirm(`Restore ${name} to the active student list?`);
    if (!confirmed) return;

    try {
      setWorkingStudentId(id);
      await archivedStudentsService.restoreStudent(id);
      await refresh();
    } catch (restoreError) {
      window.alert(
        restoreError instanceof Error
          ? restoreError.message
          : "Unable to restore the student."
      );
    } finally {
      setWorkingStudentId(null);
    }
  }

  async function handlePermanentDelete(id: number, name: string) {
    if (workingStudentId !== null) return;
    const confirmed = window.confirm(
      `Permanently delete ${name}?\n\nThis removes linked test records and cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setWorkingStudentId(id);
      await archivedStudentsService.permanentlyDeleteStudent(id);
      await refresh();
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to permanently delete the student."
      );
    } finally {
      setWorkingStudentId(null);
    }
  }

  const students = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Archived Students"
        description="Restore archived students or permanently remove test records"
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/students"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </Link>

        <div className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          {data?.total ?? 0} archived
        </div>
      </div>

      {loading && <LoadingCard title="Loading archived students..." />}

      {!loading && error && (
        <ErrorCard
          title="Unable to load archived students"
          message={error.message}
          onRetry={() => void refresh()}
        />
      )}

      {!loading && !error && students.length === 0 && (
        <EmptyState
          title="No Archived Students"
          description="Archived students will appear here when a record cannot be safely deleted."
        />
      )}

      {!loading && !error && students.length > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="divide-y">
            {students.map((student) => {
              const name = student.Name?.trim() || "Unnamed Student";
              const working = workingStudentId === student.id;

              return (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.Phone || "No phone"}
                      {student.Program ? ` · ${student.Program}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={workingStudentId !== null}
                      onClick={() => void handleRestore(student.id, name)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {working ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArchiveRestore className="h-4 w-4" />
                      )}
                      Restore
                    </button>

                    <button
                      type="button"
                      disabled={workingStudentId !== null}
                      onClick={() => void handlePermanentDelete(student.id, name)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {working ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete permanently
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
