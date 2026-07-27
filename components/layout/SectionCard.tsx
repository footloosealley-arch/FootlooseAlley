import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function SectionCard({ children }: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {children}
    </div>
  );
}