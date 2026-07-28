import type { ReactNode } from "react";
import FoundationSectionCard from "@/components/ui-foundation/SectionCard";

interface Props {
  children: ReactNode;
}

export default function SectionCard({ children }: Props) {
  return <FoundationSectionCard>{children}</FoundationSectionCard>;
}
