"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import StudentForm, {
  type StudentFormData,
} from "@/components/students/StudentForm";
import { useAsync } from "@/hooks/useAsync";
import { studentsService } from "@/services/students.service";
import type { Student } from "@/types/database";

function parseStudentId(value: string | string[] | undefined) {
  const rawId = Array.isArray(value) ? value[0] : value;
  const id = Number(rawId);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function dateValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function mapInitialValues(student: Student): StudentFormData {
  return {
    name: student.Name ?? "",
    phone: student.Phone ?? "",
    email: student.Email ?? "",
    photoUrl: student.photo_url,
    gender: student.gender ?? "",
    dateOfBirth: dateValue(student.date_of_birth),
    address: student.Address ?? "",
    emergencyContact: student.Emergency_contact ?? "",
    whatsappEnabled: student.whatsapp_enabled ?? false,
    program: student.Program ?? "",
    classId: student.class_id,
    instructorId: student.instructor_id,
    membershipPlan: student.membership_plan ?? "Monthly",
    fees: student.Fees ?? 0,
    discount: student.membership_discount ?? 0,
    feesDue: student.Fees_due ?? 0,
    joinDate: dateValue(student.join_date),
    nextDueDate: dateValue(student.next_due_date),
    medicalNotes: student.medical_notes ?? "",
    notes: student.notes ?? "",
  };
}

function createUpdatePayload(values: StudentFormData): Partial<Student> {
  return {
    Name: values.name.trim(),
    Phone: values.phone.trim(),
    Email: values.email.trim() || null,
    photo_url: values.photoUrl,
    gender: values.gender || null,
    date_of_birth: values.dateOfBirth || null,
    Address: values.address.trim() || null,
    Emergency_contact: values.emergencyContact.trim() || null,
    whatsapp_enabled: values.whatsappEnabled,
    Program: values.program || null,
    class_id: values.classId,
    instructor_id: values.instructorId,
    membership_plan: values.membershipPlan || null,
    Fees: values.fees,
    membership_discount: values.discount,
    Fees_due: values.feesDue,
    join_date: values.joinDate || null,
    next_due_date: values.nextDueDate || null,
    medical_notes: values.medicalNotes.trim() || null,
    notes: values.notes.trim() || null,
  };
}

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = parseStudentId(params?.id as string | string[] | undefined);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const submissionInProgress = useRef(false);

  const { data: student, loading, error, refresh } = useAsync(
    () => studentId
      ? studentsService.getStudentById(studentId)
      : Promise.resolve(null),
    [studentId]
  );

  async function handleSubmit(values: StudentFormData) {
    if (!studentId || submissionInProgress.current) return;

    submissionInProgress.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      const phone = values.phone.trim();
      const phoneExists = await studentsService.studentExists(phone, studentId);

      if (phoneExists) {
        setSaveError("A different student already uses this phone number.");
        return;
      }

      await studentsService.updateStudent(studentId, createUpdatePayload(values));
      toast.success("Student details updated successfully.");
      router.push(`/students/${studentId}`);
    } catch (submitError) {
      console.error("Failed to update student:", submitError);
      setSaveError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the student. Please try again."
      );
    } finally {
      submissionInProgress.current = false;
      setSaving(false);
    }
  }

  if (!studentId) {
    return (
      <ErrorCard
        title="Invalid student ID"
        message="The student link is invalid. Return to the students list and try again."
      />
    );
  }

  if (loading) return <LoadingCard title="Loading Student..." />;

  if (error) {
    return (
      <ErrorCard
        title="Unable to load student"
        message={error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!student) {
    return (
      <ErrorCard
        title="Student Not Found"
        message="This student may have been removed or the link may be incorrect."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Student</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update {student.Name || "this student"}&apos;s details.
        </p>
      </div>

      {saveError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <StudentForm
        studentId={studentId}
        initialValues={mapInitialValues(student)}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (!saving) router.push(`/students/${studentId}`);
        }}
      />
    </div>
  );
}
