"use client";

type Props = {
  onSelect: (
    status: "Present" | "Absent" | "Late" | "Leave"
  ) => void;
};

export default function AttendanceButtons({
  onSelect,
}: Props) {
  const buttonClass =
    "rounded-xl px-4 py-2 text-white font-semibold transition";

  return (
    <div className="flex flex-wrap gap-3">

      <button
        onClick={() => onSelect("Present")}
        className={`${buttonClass} bg-green-600 hover:bg-green-700`}
      >
        ✅ Present
      </button>

      <button
        onClick={() => onSelect("Absent")}
        className={`${buttonClass} bg-red-600 hover:bg-red-700`}
      >
        ❌ Absent
      </button>

      <button
        onClick={() => onSelect("Late")}
        className={`${buttonClass} bg-yellow-500 hover:bg-yellow-600`}
      >
        ⏰ Late
      </button>

      <button
        onClick={() => onSelect("Leave")}
        className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
      >
        🌴 Leave
      </button>

    </div>
  );
}