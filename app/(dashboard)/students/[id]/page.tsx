"use client";

<<<<<<< HEAD
import {
  useParams,
  usePathname,
  useRouter,
} from "next/navigation";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import StudentProfile from "@/components/students/StudentProfile";

import { useAsync } from "@/hooks/useAsync";
import { studentsService } from "@/services/students.service";

function getStudentId(
  paramValue:
    | string
    | string[]
    | undefined,
  pathname: string
): number | null {
  let rawId: string | undefined;

  if (
    typeof paramValue ===
    "string"
  ) {
    rawId = paramValue;
  } else if (
    Array.isArray(paramValue)
  ) {
    rawId = paramValue[0];
  }

  if (!rawId) {
    const pathParts =
      pathname
        .split("/")
        .filter(Boolean);

    const studentsIndex =
      pathParts.indexOf(
        "students"
      );

    if (
      studentsIndex >= 0 &&
      pathParts[
        studentsIndex + 1
      ]
    ) {
      rawId =
        pathParts[
          studentsIndex + 1
        ];
    }
  }

  const parsedId =
    Number(rawId);

  if (
    !Number.isInteger(
      parsedId
    ) ||
    parsedId <= 0
  ) {
    return null;
  }

  return parsedId;
}

export default function StudentProfilePage() {
  const params =
    useParams();

  const pathname =
    usePathname();

  const router =
    useRouter();

  const studentId =
    getStudentId(
      params?.id as
        | string
        | string[]
        | undefined,
      pathname
    );

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsync(
    async () => {
      if (!studentId) {
        throw new Error(
          "Invalid student ID."
        );
      }

      return studentsService.getStudentProfile(
        studentId
      );
    },
    [
      studentId,
    ]
  );

  if (loading) {
    return (
      <LoadingCard title="Loading Student Profile..." />
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Unable to load student profile"
        message={
          error.message
        }
        onRetry={() => {
          void refresh();
        }}
      />
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">
          Student Not Found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This student may have been removed or the link may be incorrect.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/students"
            )
          }
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Return to Students
        </button>
      </div>
    );
  }

  return (
    <StudentProfile
      profile={data}
    />
  );
}
=======
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import StudentHeader from "@/components/students/StudentHeader";
import StudentDetails from "@/components/students/StudentDetails";
import StudentStats from "@/components/students/StudentStats";
import PaymentHistory from "@/components/students/PaymentHistory";
import AttendanceSummary from "@/components/students/AttendanceSummary";
import EditStudentModal from "@/components/students/EditStudentModal";
import AddPaymentModal from "@/components/students/AddPaymentModal";

import { supabase } from "@/lib/supabase";

type Student = {
  id: number;

  Name: string;
  Phone: string | null;
  Email: string | null;

  Program: string | null;

  Fees: number | null;
  Fees_due: number | null;

  Status: string | null;

  membership_plan: string | null;
  join_date: string | null;
  next_due_date: string | null;
  fee_status: string | null;

  Address: string | null;
  Emergency_contact: string | null;
  gender: string | null;
  date_of_birth: string | null;

  student_code: string | null;
  batch: string | null;
  photo_url: string | null;

  referred_by: string | null;
  notes: string | null;
  medical_notes: string | null;
  attendance_percentage: number | null;
  last_attendance: string | null;

  class_id: number | null;
  instructor_id: number | null;
};

type Payment = {
  id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks: string | null;
};

type Attendance = {
  id: number;
  date: string;
  status: string;
};

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();

  const studentId = Number(params.id);

  const [student, setStudent] = useState<Student | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "UPI",
    payment_date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const [editForm, setEditForm] = useState({
    Name: "",
    Phone: "",
    Email: "",
    Program: "",
    Fees: "",
    Fees_due: "",
    membership_plan: "",
    next_due_date: "",
    Address: "",
    Emergency_contact: "",
    gender: "",
    date_of_birth: "",
  });

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("Students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;

      const { data: paymentData, error: paymentError } = await supabase
        .from("Payments")
        .select("*")
        .eq("student_id", studentId)
        .order("id", { ascending: false });

      if (paymentError) throw paymentError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("Attendance")
        .select("*")
        .eq("student_id", studentId)
        .order("date", { ascending: false });

      if (attendanceError) throw attendanceError;

      setStudent(studentData as Student);
      setPayments(paymentData ?? []);
      setAttendance(attendanceData ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function addPayment() {
  try {
    setPaymentSaving(true);

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    const { error: paymentError } = await supabase
      .from("Payments")
      .insert({
        student_id: studentId,
        amount,
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        remarks: paymentForm.remarks,
      });

    if (paymentError) throw paymentError;

    if (student) {
      const currentDue = Number(student.Fees_due ?? 0);

      const newDue = Math.max(currentDue - amount, 0);

      const { error: studentError } = await supabase
        .from("Students")
        .update({
          Fees_due: newDue,
          fee_status: newDue === 0 ? "Paid" : "Due",
          last_payment_date: paymentForm.payment_date,
        })
        .eq("id", studentId);

      if (studentError) throw studentError;
    }

    setPaymentForm({
      amount: "",
      payment_method: "UPI",
      payment_date: new Date().toISOString().split("T")[0],
      remarks: "",
    });

    setPaymentOpen(false);

    await loadStudent();
  } catch (error) {
    console.error(error);
    alert("Unable to add payment");
  } finally {
    setPaymentSaving(false);
  }
}
async function updateStudent() {
  try {
    setSaving(true);

    const { error } = await supabase
      .from("Students")
      .update({
        Name: editForm.Name.trim(),
        Phone: editForm.Phone.trim(),
        Email: editForm.Email.trim() || null,
        Program: editForm.Program.trim() || null,

        Fees: Number(editForm.Fees) || 0,
        Fees_due: Number(editForm.Fees_due) || 0,

        membership_plan: editForm.membership_plan || null,
        next_due_date: editForm.next_due_date || null,

        Address: editForm.Address.trim() || null,
        Emergency_contact: editForm.Emergency_contact.trim() || null,
        gender: editForm.gender || null,
        date_of_birth: editForm.date_of_birth || null,
      })
      .eq("id", studentId);

    if (error) throw error;

    setEditOpen(false);

    await loadStudent();
  } catch (error) {
    console.error(error);
    alert("Unable to update student");
  } finally {
    setSaving(false);
  }
}
function openEdit() {
  if (!student) return;

  setEditForm({
    Name: student.Name,
    Phone: student.Phone ?? "",
    Email: student.Email ?? "",
    Program: student.Program ?? "",

    Fees: String(student.Fees ?? ""),
    Fees_due: String(student.Fees_due ?? ""),

    membership_plan: student.membership_plan ?? "",
    next_due_date: student.next_due_date ?? "",

    Address: student.Address ?? "",
    Emergency_contact: student.Emergency_contact ?? "",

    gender: student.gender ?? "",
    date_of_birth: student.date_of_birth ?? "",
  });

  setEditOpen(true);
}

const totalPaid = payments.reduce(
  (sum, payment) => sum + Number(payment.amount ?? 0),
  0
);

const presentDays = attendance.filter(
  (item) => item.status === "Present"
).length;



const attendancePercentage =
  attendance.length > 0
    ? Math.round((presentDays / attendance.length) * 100)
    : 0;

if (loading) {
  return (
    <main className="p-8">
      Loading student profile...
    </main>
  );
}

return (
  <main className="space-y-8">
    <PageHeader
      title="Student Profile"
      description="Complete student information and activity."
    />

    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow hover:bg-slate-50"
    >
      <ArrowLeft size={18} />
      Back
    </button>

    <StudentHeader
      student={student!}
      onEdit={openEdit}
      onDelete={() => {}}
    />

    <StudentStats
      totalFees={student?.Fees ?? 0}
      totalPaid={totalPaid}
      pendingFees={student?.Fees_due ?? 0}
      attendancePercentage={attendancePercentage}
      nextDueDate={student?.next_due_date ?? null}
      feeStatus={student?.fee_status ?? null}
    />

<div className="grid gap-6 lg:grid-cols-2">
  <StudentDetails
    student={student!}
  />

  <AttendanceSummary
    attendance={attendance}
    lastAttendance={null}
  />
</div>

    <PaymentHistory
      payments={payments}
      totalFees={student?.Fees ?? 0}
    />
        <EditStudentModal
      open={editOpen}
      saving={saving}
      form={editForm}
      onClose={() => setEditOpen(false)}
      onSave={updateStudent}
      onChange={setEditForm}
    />

    <AddPaymentModal
      open={paymentOpen}
      saving={paymentSaving}
      dueAmount={student?.Fees_due ?? 0}
      form={paymentForm}
      onClose={() => setPaymentOpen(false)}
      onSave={addPayment}
      onChange={setPaymentForm}
    />
  </main>
);
}
    
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
