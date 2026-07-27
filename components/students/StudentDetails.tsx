"use client";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  FileText,
  UserCircle2,
} from "lucide-react";

type Props = {
  student: {
    Email: string | null;
    Phone: string | null;
    Address: string | null;
    date_of_birth: string | null;
    gender: string | null;
    Emergency_contact: string | null;
    medical_notes?: string | null;
    notes?: string | null;
    referred_by?: string | null;
    join_date?: string | null;
  };
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export default function StudentDetails({
  student,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        Personal Information
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <DetailRow
          icon={<Mail size={18} />}
          label="Email"
          value={student.Email ?? "-"}
        />

        <DetailRow
          icon={<Phone size={18} />}
          label="Phone"
          value={student.Phone ?? "-"}
        />

        <DetailRow
          icon={<MapPin size={18} />}
          label="Address"
          value={student.Address ?? "-"}
        />

        <DetailRow
          icon={<Calendar size={18} />}
          label="Date of Birth"
          value={
            student.date_of_birth
              ? new Date(student.date_of_birth).toLocaleDateString()
              : "-"
          }
        />

        <DetailRow
          icon={<UserCircle2 size={18} />}
          label="Gender"
          value={student.gender ?? "-"}
        />

        <DetailRow
          icon={<Shield size={18} />}
          label="Emergency Contact"
          value={student.Emergency_contact ?? "-"}
        />

        <DetailRow
          icon={<Heart size={18} />}
          label="Joined On"
          value={
            student.join_date
              ? new Date(student.join_date).toLocaleDateString()
              : "-"
          }
        />

        <DetailRow
          icon={<UserCircle2 size={18} />}
          label="Referred By"
          value={student.referred_by ?? "-"}
        />

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Heart size={18} />
            Medical Notes
          </h3>

          <p className="whitespace-pre-wrap text-slate-700">
            {student.medical_notes || "No medical notes available."}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <FileText size={18} />
            General Notes
          </h3>

          <p className="whitespace-pre-wrap text-slate-700">
            {student.notes || "No notes available."}
          </p>
        </div>

      </div>

    </div>
  );
}