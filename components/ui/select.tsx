<<<<<<< HEAD
"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SelectProps =
  SelectPrimitive.Root.Props<
    string,
    false
  >;

function Select({
  children,
  ...props
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      {...props}
    >
      {children}
    </SelectPrimitive.Root>
  );
}

function SelectGroup({
  className,
  ...props
}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn(
        "scroll-my-1 p-1",
        className
      )}
      {...props}
    />
  );
}

function SelectValue({
  className,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "flex flex-1 text-left",
        className
      )}
      {...props}
    />
  );
=======
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
<<<<<<< HEAD
  size?: "sm" | "default";
=======
  size?: "sm" | "default"
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
<<<<<<< HEAD
        "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "data-placeholder:text-muted-foreground",
        "data-[size=default]:h-10 data-[size=sm]:h-8",
        "dark:bg-input/30 dark:hover:bg-input/50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
=======
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
        className
      )}
      {...props}
    >
      {children}
<<<<<<< HEAD

=======
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
<<<<<<< HEAD
    | "align"
    | "alignOffset"
    | "side"
    | "sideOffset"
    | "alignItemWithTrigger"
=======
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
<<<<<<< HEAD
        alignItemWithTrigger={
          alignItemWithTrigger
        }
=======
        alignItemWithTrigger={alignItemWithTrigger}
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
<<<<<<< HEAD
          data-align-trigger={
            alignItemWithTrigger
          }
          className={cn(
            "relative isolate z-50 max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-36 overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
            "origin-[var(--transform-origin)] duration-100",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />

          <SelectPrimitive.List>
            {children}
          </SelectPrimitive.List>

=======
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
<<<<<<< HEAD
      className={cn(
        "px-1.5 py-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  );
=======
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
<<<<<<< HEAD
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-2 pr-8 pl-2 text-sm outline-none select-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
=======
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
<<<<<<< HEAD

=======
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
<<<<<<< HEAD
        <CheckIcon className="pointer-events-none size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
=======
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
<<<<<<< HEAD
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-border",
        className
      )}
      {...props}
    />
  );
=======
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectScrollUpButton({
  className,
  ...props
<<<<<<< HEAD
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollUpArrow
>) {
=======
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
<<<<<<< HEAD
        "sticky top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1",
=======
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
        className
      )}
      {...props}
    >
<<<<<<< HEAD
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
=======
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

function SelectScrollDownButton({
  className,
  ...props
<<<<<<< HEAD
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollDownArrow
>) {
=======
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
<<<<<<< HEAD
        "sticky bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1",
=======
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
        className
      )}
      {...props}
    >
<<<<<<< HEAD
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
=======
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
<<<<<<< HEAD
};
=======
}
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
