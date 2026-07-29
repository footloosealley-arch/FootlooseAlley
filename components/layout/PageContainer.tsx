import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {children}
    </div>
  );
}
