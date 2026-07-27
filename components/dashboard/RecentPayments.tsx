<<<<<<< HEAD
import Link from "next/link";

import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";

interface PaymentWithStudent {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  Students?: {
    Name: string | null;
  } | null;
}

interface RecentPaymentsProps {
  payments: PaymentWithStudent[];
}

export default function RecentPayments({
  payments,
}: RecentPaymentsProps) {
  return (
    <WidgetCard
      title="Recent Payments"
      description="Latest fee collections"
    >
      {payments.length === 0 ? (
        <EmptyState
          title="No Payments"
          description="No recent payments found."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {payment.Students?.Name ?? "Unknown Student"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    payment.payment_date
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold">
                  ₹{Number(payment.amount).toLocaleString()}
                </p>

                {payment.payment_method && (
                  <p className="text-xs text-muted-foreground">
                    {payment.payment_method}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/payments"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All Payments →
            </Link>
          </div>
        </div>
      )}
    </WidgetCard>
  );
=======
type Props={
payments:any[];
};


export default function RecentPayments({
payments,
}:Props){


return (

<div className="
rounded-2xl
bg-white
p-6
shadow
">


<h2 className="
mb-5
text-xl
font-bold
">

Recent Payments

</h2>




<div className="space-y-4">


{
payments.map(payment=>(

<div
key={payment.id}
className="
flex
justify-between
border-b
pb-3
"
>


<div>

<p className="font-semibold">

₹{payment.amount}

</p>

<p className="text-sm text-slate-500">

{payment.payment_method}

</p>

</div>



<p className="text-sm text-slate-500">

{payment.payment_date}

</p>



</div>


))

}


</div>


</div>

);

>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}