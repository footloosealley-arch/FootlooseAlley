"use client";

import Link from "next/link";
import {
  CreditCard,
  Loader2,
  RefreshCw,
  Snowflake,
  Sun,
} from "lucide-react";
import { useState } from "react";

import { studentsService } from "@/services/students.service";
import type { Student } from "@/types/database";

interface StudentProfileActionsProps {
  student: Student;
  onRefresh: () => Promise<void>;
}

export default function StudentProfileActions({
  student,
  onRefresh,
}: StudentProfileActionsProps) {
  const [membershipLoading, setMembershipLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleMembershipChange() {
    const action =
      student.membership_frozen
        ? "activate"
        : "freeze";

    const confirmed = window.confirm(
      student.membership_frozen
        ? `Activate membership for ${
            student.Name ?? "this student"
          }?`
        : `Freeze membership for ${
            student.Name ?? "this student"
          }?`
    );

    if (!confirmed) {
      return;
    }

    setMembershipLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (
        action === "activate"
      ) {
        await studentsService.activateMembership(
          student.id
        );

        setMessage(
          "Membership activated successfully."
        );
      } else {
        await studentsService.freezeMembership(
          student.id
        );

        setMessage(
          "Membership frozen successfully."
        );
      }

      await onRefresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update membership."
      );
    } finally {
      setMembershipLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setMessage(null);
    setError(null);

    try {
      await onRefresh();

      setMessage(
        "Student profile refreshed."
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to refresh profile."
      );
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">
            Student Actions
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage membership and payment actions
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={
              refreshing ||
              membershipLoading
            }
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh
          </button>

          <Link
            href="/payments"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
          >
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Link>

          <button
            type="button"
            onClick={() => {
              void handleMembershipChange();
            }}
            disabled={
              membershipLoading ||
              refreshing
            }
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
              student.membership_frozen
                ? "bg-green-600 text-white hover:opacity-90"
                : "bg-blue-600 text-white hover:opacity-90"
            }`}
          >
            {membershipLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : student.membership_frozen ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Snowflake className="h-4 w-4" />
            )}

            {student.membership_frozen
              ? "Activate Membership"
              : "Freeze Membership"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}