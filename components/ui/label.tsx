"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps =
  React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<
  HTMLLabelElement,
  LabelProps
>(function Label(
  {
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };