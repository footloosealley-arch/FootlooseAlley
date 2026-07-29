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
      className="studio-surface studio-glow mb-5 rounded-2xl border border-primary/15 px-4 py-4 sm:mb-8 sm:px-6 sm:py-5"
    />
  );
}
