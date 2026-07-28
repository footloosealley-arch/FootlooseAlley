import FoundationStatusBadge from "@/components/ui-foundation/StatusBadge";

interface StatusBadgeProps {
  status: string | null | undefined;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <FoundationStatusBadge status={status} />;
}
