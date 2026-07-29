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
      className="studio-surface studio-glow mb-8 rounded-2xl border border-primary/15 px-5 py-5 sm:px-6"
    />
  );
}
