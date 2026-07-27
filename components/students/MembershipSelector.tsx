"use client";

import { useEffect, useMemo } from "react";

import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  Percent,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MembershipValue = {
  plan: string;
  fee: number;
  discount: number;
  due: number;
  nextDueDate: string;
};

type MembershipSelectorProps = {
  value: MembershipValue;
  onChange: (
    value: MembershipValue
  ) => void;
  disabled?: boolean;
};

type MembershipPlan = {
  name: string;
  price: number;
  months: number;
};

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    name: "Monthly",
    price: 2500,
    months: 1,
  },
  {
    name: "3 Months",
    price: 6000,
    months: 3,
  },
  {
    name: "6 Months",
    price: 10000,
    months: 6,
  },
  {
    name: "Yearly",
    price: 18000,
    months: 12,
  },
];

function normalizeNumber(
  value: number | string | null | undefined
) {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 0
  ) {
    return 0;
  }

  return numberValue;
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createNextDueDate(
  months: number
) {
  const date = new Date();

  const originalDay = date.getDate();

  date.setDate(1);

  date.setMonth(
    date.getMonth() + months
  );

  const lastDayOfTargetMonth =
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

  date.setDate(
    Math.min(
      originalDay,
      lastDayOfTargetMonth
    )
  );

  return formatDateForInput(date);
}

function calculateDue(
  fee: number,
  discount: number
) {
  return Math.max(
    0,
    normalizeNumber(fee) -
      normalizeNumber(discount)
  );
}

export default function MembershipSelector({
  value,
  onChange,
  disabled = false,
}: MembershipSelectorProps) {
  const selectedPlan = useMemo(() => {
    return (
      MEMBERSHIP_PLANS.find(
        (plan) =>
          plan.name === value.plan
      ) ?? MEMBERSHIP_PLANS[0]
    );
  }, [value.plan]);

  useEffect(() => {
    if (value.nextDueDate) {
      return;
    }

    onChange({
      ...value,
      nextDueDate:
        createNextDueDate(
          selectedPlan.months
        ),
    });
  }, [
    onChange,
    selectedPlan.months,
    value,
  ]);

function handlePlanChange(
  planName: string | null
) {
  if (!planName) {
    return;
  }
    const plan =
      MEMBERSHIP_PLANS.find(
        (item) =>
          item.name === planName
      ) ?? MEMBERSHIP_PLANS[0];

    const fee = plan.price;

    const discount =
      normalizeNumber(value.discount);

    onChange({
      ...value,
      plan: plan.name,
      fee,
      discount,
      due: calculateDue(
        fee,
        discount
      ),
      nextDueDate:
        createNextDueDate(plan.months),
    });
  }

  function handleFeeChange(
    inputValue: string
  ) {
    const fee =
      normalizeNumber(inputValue);

    const discount =
      normalizeNumber(value.discount);

    onChange({
      ...value,
      fee,
      due: calculateDue(
        fee,
        discount
      ),
    });
  }

  function handleDiscountChange(
    inputValue: string
  ) {
    const fee =
      normalizeNumber(value.fee);

    const discount = Math.min(
      normalizeNumber(inputValue),
      fee
    );

    onChange({
      ...value,
      discount,
      due: calculateDue(
        fee,
        discount
      ),
    });
  }

  function handleDueChange(
    inputValue: string
  ) {
    onChange({
      ...value,
      due: normalizeNumber(
        inputValue
      ),
    });
  }

  function handleDateChange(
    inputValue: string
  ) {
    onChange({
      ...value,
      nextDueDate:
        inputValue || "",
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Membership Details
          </h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Select the membership plan and
          confirm the fee details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="membershipPlan">
            Membership Plan *
          </Label>

          <Select
            value={
              value.plan ||
              "Monthly"
            }
            disabled={disabled}
            onValueChange={
              handlePlanChange
            }
          >
            <SelectTrigger id="membershipPlan">
              <SelectValue placeholder="Select membership plan" />
            </SelectTrigger>

            <SelectContent>
              {MEMBERSHIP_PLANS.map(
                (plan) => (
                  <SelectItem
                    key={plan.name}
                    value={plan.name}
                  >
                    {plan.name} — ₹
                    {plan.price.toLocaleString(
                      "en-IN"
                    )}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipFee">
            Membership Fee
          </Label>

          <div className="relative">
            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="membershipFee"
              type="number"
              min="0"
              step="1"
              value={normalizeNumber(
                value.fee
              )}
              disabled={disabled}
              onChange={(event) =>
                handleFeeChange(
                  event.target.value
                )
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipDiscount">
            Discount
          </Label>

          <div className="relative">
            <Percent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="membershipDiscount"
              type="number"
              min="0"
              max={normalizeNumber(
                value.fee
              )}
              step="1"
              value={normalizeNumber(
                value.discount
              )}
              disabled={disabled}
              onChange={(event) =>
                handleDiscountChange(
                  event.target.value
                )
              }
              className="pl-9"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Enter the discount as an
            amount, not a percentage.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipDue">
            Fees Due
          </Label>

          <div className="relative">
            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="membershipDue"
              type="number"
              min="0"
              step="1"
              value={normalizeNumber(
                value.due
              )}
              disabled={disabled}
              onChange={(event) =>
                handleDueChange(
                  event.target.value
                )
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nextDueDate">
            Next Due Date
          </Label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="nextDueDate"
              type="date"
              value={
                value.nextDueDate ||
                ""
              }
              disabled={disabled}
              onChange={(event) =>
                handleDateChange(
                  event.target.value
                )
              }
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Plan
          </p>

          <p className="font-medium">
            {value.plan ||
              selectedPlan.name}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Total Fee
          </p>

          <p className="font-medium">
            ₹
            {normalizeNumber(
              value.fee
            ).toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Amount Due
          </p>

          <p className="font-semibold text-primary">
            ₹
            {normalizeNumber(
              value.due
            ).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </section>
  );
}