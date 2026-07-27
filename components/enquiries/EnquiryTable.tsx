"use client";

import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

import StatusBadge from "@/components/enquiries/StatusBadge";

export type Enquiry = {
  id: number;
  created_at: string;

  Name: string | null;
  Phone: string | null;
  Email: string | null;

  Program: string | null;

  Status: string | null;

  Follow_up_date: string | null;

  Notes: string | null;

  source: string | null;

  assigned_to: string | null;

  last_contacted: string | null;

  trial_date: string | null;
};

interface EnquiryTableProps {
  loading: boolean;
  enquiries: Enquiry[];

  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
}

export default function EnquiryTable({
  loading,
  enquiries,
  onEdit,
  onDelete,
  onConvert,
}: EnquiryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">

      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>

            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Phone
            </th>

            <th className="p-3 text-left">
              Program
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {loading && (
            <tr>
              <td
                colSpan={5}
                className="p-10 text-center"
              >
                Loading...
              </td>
            </tr>
          )}

          {!loading && enquiries.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="p-10 text-center text-gray-500"
              >
                No enquiries found.
              </td>
            </tr>
          )}

          {!loading &&
            enquiries.map((enquiry) => ( 
                            <tr
                key={enquiry.id}
                className="border-t transition-colors hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {enquiry.Name || "-"}
                </td>

                <td className="p-3">
                  {enquiry.Phone || "-"}
                </td>

                <td className="p-3">
                  {enquiry.Program || "-"}
                </td>

                <td className="p-3">
                  <StatusBadge status={enquiry.Status} />
                </td>

                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/91${enquiry.Phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-green-100 p-2 transition hover:bg-green-200"
                    >
                      <MessageCircle size={18} />
                    </a>

                    {/* Call */}
                    <a
                      href={`tel:${enquiry.Phone}`}
                      className="rounded-lg bg-blue-100 p-2 transition hover:bg-blue-200"
                    >
                      <Phone size={18} />
                    </a>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(enquiry)}
                      className="rounded-lg bg-yellow-100 p-2 transition hover:bg-yellow-200"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(enquiry)}
                      className="rounded-lg bg-red-100 p-2 transition hover:bg-red-200"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Convert */}
                    {enquiry.Status !== "Joined" ? (
                      <button
                        onClick={() => onConvert(enquiry)}
                        className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition hover:bg-gray-800"
                      >
                        <UserPlus size={18} />
                        Convert
                      </button>
                    ) : (
                      <Link
                        href={`/students/${enquiry.id}`}
                        className="font-semibold text-green-600 hover:underline"
                      >
                        Student
                      </Link>
                    )}

                                   </div>
                </td>
              </tr>
            ))}

        </tbody>

      </table>

    </div>
  );
}