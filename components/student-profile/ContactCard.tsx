import {
  Phone,
  Mail,
  MapPin,
  Shield,
  MessageCircle,
} from "lucide-react";

import type { Student } from "@/types/student";

type Props = {
  student: Student;
};

export default function ContactCard({ student }: Props) {
  const phone = student.Phone ?? "";
  const whatsappNumber = `91${phone.replace(/\D/g, "")}`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-bold text-slate-800">
        Contact Information
      </h2>

      <div className="space-y-5">
        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone className="mt-1 text-indigo-600" size={18} />

          <div className="flex-1">
            <p className="text-sm text-slate-500">Phone</p>

            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium text-slate-800">
                {phone}
              </span>

              <div className="flex gap-2">
                <a
                  href={`tel:${phone}`}
                  className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  Call
                </a>

                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200"
                >
                  <div className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    WhatsApp
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="mt-1 text-indigo-600" size={18} />

          <div>
            <p className="text-sm text-slate-500">Email</p>

            {student.Email ? (
              <a
                href={`mailto:${student.Email}`}
                className="font-medium text-indigo-600 hover:underline"
              >
                {student.Email}
              </a>
            ) : (
              <p className="text-slate-700">—</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 text-indigo-600" size={18} />

          <div>
            <p className="text-sm text-slate-500">Address</p>

            <p className="font-medium text-slate-800">
              {student.Address ?? "Not Available"}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="flex items-start gap-3">
          <Shield className="mt-1 text-red-500" size={18} />

          <div>
            <p className="text-sm text-slate-500">
              Emergency Contact
            </p>

            <p className="font-medium text-slate-800">
              {student.Emergency_contact ?? "Not Available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}