import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      {children}
    </main>
  );
}