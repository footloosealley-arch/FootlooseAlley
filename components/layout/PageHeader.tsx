import type { ReactNode } from "react";
import FoundationPageHeader from "@/components/ui-foundation/PageHeader";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <FoundationPageHeader
      title={title}
      description={description}
      actions={action}
      className="mb-8"
    />
  );
}
