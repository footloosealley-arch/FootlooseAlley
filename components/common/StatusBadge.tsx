interface StatusBadgeProps {
  status: string | null | undefined;
}

const styles: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700",

  Inactive:
    "bg-gray-100 text-gray-700",

  Frozen:
    "bg-blue-100 text-blue-700",

  New:
    "bg-sky-100 text-sky-700",

  "Follow Up":
    "bg-yellow-100 text-yellow-700",

  Trial:
    "bg-purple-100 text-purple-700",

  Joined:
    "bg-green-100 text-green-700",

  Closed:
    "bg-red-100 text-red-700",

  Paid:
    "bg-green-100 text-green-700",

  Pending:
    "bg-orange-100 text-orange-700",

  Absent:
    "bg-red-100 text-red-700",

  Present:
    "bg-green-100 text-green-700",

  Late:
    "bg-yellow-100 text-yellow-700",
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const value = status ?? "Unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {value}
    </span>
  );
}