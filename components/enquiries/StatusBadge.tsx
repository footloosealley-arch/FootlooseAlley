interface StatusBadgeProps {
  status: string | null;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const value = status ?? "New";

  let classes =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  switch (value) {
    case "Joined":
      classes += " bg-green-100 text-green-700";
      break;

    case "Follow Up":
      classes += " bg-yellow-100 text-yellow-700";
      break;

    case "Not Interested":
      classes += " bg-red-100 text-red-700";
      break;

    case "Converted":
      classes += " bg-emerald-100 text-emerald-700";
      break;

    default:
      classes += " bg-blue-100 text-blue-700";
      break;
  }

  return <span className={classes}>{value}</span>;
}