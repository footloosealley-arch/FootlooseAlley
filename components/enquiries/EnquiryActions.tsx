import {
  MessageCircle,
  Phone,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

interface EnquiryActionsProps {
  phone: string | null;
  isJoined: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}

export default function EnquiryActions({
  phone,
  isJoined,
  onEdit,
  onDelete,
  onConvert,
}: EnquiryActionsProps) {
  return (
    <div className="flex items-center gap-2">

      {phone && (
        <>
          <a
            href={`https://wa.me/91${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-100 p-2 transition hover:bg-green-200"
            title="WhatsApp"
          >
            <MessageCircle size={18} />
          </a>

          <a
            href={`tel:${phone}`}
            className="rounded-lg bg-blue-100 p-2 transition hover:bg-blue-200"
            title="Call"
          >
            <Phone size={18} />
          </a>
        </>
      )}

      <button
        onClick={onEdit}
        className="rounded-lg bg-yellow-100 p-2 transition hover:bg-yellow-200"
        title="Edit"
      >
        <Pencil size={18} />
      </button>

      <button
        onClick={onDelete}
        className="rounded-lg bg-red-100 p-2 transition hover:bg-red-200"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>

      {!isJoined && (
        <button
          onClick={onConvert}
          className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition hover:bg-gray-800"
        >
          <UserPlus size={18} />
          Convert
        </button>
      )}
    </div>
  );
}