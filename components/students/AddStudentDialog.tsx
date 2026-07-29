"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import StudentForm, {
  type StudentFormData,
} from "@/components/students/StudentForm";

import { studentsService } from "@/services/students.service";

import type { Student } from "@/types/database";

type AddStudentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdded?: (
    student: Student
  ) => void | Promise<void>;
};

function createStudentPayload(
  values: StudentFormData
): Partial<Student> {
  return {
    Name: values.name.trim(),
    Phone: values.phone.trim(),
    Email: values.email.trim() || null,

    Program: values.program || null,

    Fees: values.fees,
    Fees_due: values.feesDue,

    Status: "Active",

    Address: values.address.trim() || null,

    Emergency_contact:
      values.emergencyContact.trim() || null,

    photo_url: values.photoUrl || null,

    membership_plan:
      values.membershipPlan || null,

    join_date: values.joinDate || null,

    date_of_birth:
      values.dateOfBirth || null,

    gender: values.gender || null,

    next_due_date:
      values.nextDueDate || null,

    last_payment_date: null,

    fee_status:
      values.feesDue > 0
        ? "Due"
        : "Paid",

    student_code: null,

    batch: values.program || null,

    instructor_id:
      values.instructorId ?? null,

    medical_notes:
      values.medicalNotes.trim() || null,

    attendance_percentage: 0,

    whatsapp_enabled:
      values.whatsappEnabled,

    notes: values.notes.trim() || null,

    referred_by: null,

    membership_frozen: false,

    last_attendance: null,

    class_id: values.classId ?? null,
  };
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  onStudentAdded,
}: AddStudentDialogProps) {
  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    values: StudentFormData
  ) {
    setSaving(true);
    setError(null);

    try {
      const phone = values.phone.trim();

      const phoneExists =
        await studentsService.studentExists(
          phone
        );

      if (phoneExists) {
        setError(
          "A student with this phone number already exists."
        );

        return;
      }

      const payload =
        createStudentPayload(values);

      const createdStudent =
        await studentsService.createStudent(
          payload
        );

      await onStudentAdded?.(
        createdStudent
      );

      onOpenChange(false);
    } catch (submitError) {
      console.error(
        "Failed to create student:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the student. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (saving) return;

    setError(null);
    onOpenChange(false);
  }

  function handleOpenChange(
    nextOpen: boolean
  ) {
    if (saving) return;

    if (!nextOpen) {
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl">
        <div className="flex max-h-[92vh] flex-col">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>
              Add New Student
            </DialogTitle>

            <DialogDescription>
              Enter the student&apos;s
              personal, class, membership,
              and payment details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <StudentForm
              loading={saving}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
