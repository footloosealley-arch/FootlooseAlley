interface StatusBadgeProps {
  status: string | null;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const value = status?.trim() || "New";

  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  const statusClasses: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-cyan-100 text-cyan-700",
    "Follow Up": "bg-amber-100 text-amber-700",
    "Follow-up": "bg-amber-100 text-amber-700",
    "Trial Booked": "bg-purple-100 text-purple-700",
    "Trial Scheduled": "bg-purple-100 text-purple-700",
    "Trial Completed": "bg-indigo-100 text-indigo-700",
    Joined: "bg-green-100 text-green-700",
    Converted: "bg-emerald-100 text-emerald-700",
    Closed: "bg-gray-200 text-gray-700",
    "Not Interested": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`${baseClasses} ${
        statusClasses[value] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}