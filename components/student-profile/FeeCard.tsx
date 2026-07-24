"use client";

import { useEffect, useState } from "react";

import {
  IndianRupee,
  Wallet,
  AlertCircle,
} from "lucide-react";

import { getPayments } from "@/lib/payments";

import type { Student } from "@/types/student";


type Props = {
  student: Student;
};



const membershipFees: Record<string, number> = {

  Monthly: 2500,

  "3 Months": 6000,

  "6 Months": 10000,

  Yearly: 18000,

};




export default function FeeCard({
  student,
}: Props) {


  const [paidFees,setPaidFees] =
    useState(0);





  useEffect(()=>{

    loadPayments();

  },[student.id]);







  async function loadPayments(){

    const result =
      await getPayments(
        student.id
      );


    if(result.error){

      console.error(
        result.error
      );

      return;

    }



    const totalPaid =
      (result.data ?? [])
        .reduce(

          (sum,payment)=>

            sum +
            Number(
              payment.amount ?? 0
            ),

          0

        );



    setPaidFees(
      totalPaid
    );

  }







  const totalFees =
    membershipFees[
      student.membership_plan ?? ""
    ]
    ??
    student.Fees
    ??
    0;





  const outstanding =
    Math.max(
      totalFees - paidFees,
      0
    );





  const progress =
    totalFees > 0

    ? Math.min(
        Math.round(
          (paidFees / totalFees) * 100
        ),
        100
      )

    : 0;








return (

<div className="
rounded-2xl
bg-white
p-6
shadow-lg
">


<h2 className="
mb-6
text-xl
font-bold
text-slate-800
">

Fee Summary

</h2>





<div className="
space-y-5
">





<div className="
flex
items-center
justify-between
">

<div className="
flex
items-center
gap-3
">

<IndianRupee
size={20}
className="text-indigo-600"
/>


<span>
Total Fees
</span>


</div>



<span className="font-bold">

₹{totalFees.toLocaleString()}

</span>


</div>







<div className="
flex
items-center
justify-between
">


<div className="
flex
items-center
gap-3
">


<Wallet
size={20}
className="text-green-600"
/>


<span>
Paid
</span>


</div>



<span className="
font-bold
text-green-600
">

₹{paidFees.toLocaleString()}

</span>


</div>








<div className="
flex
items-center
justify-between
">


<div className="
flex
items-center
gap-3
">


<AlertCircle
size={20}
className="text-red-600"
/>


<span>
Outstanding
</span>


</div>



<span className="
font-bold
text-red-600
">

₹{outstanding.toLocaleString()}

</span>


</div>









<div className="pt-2">


<div className="
mb-2
flex
justify-between
text-sm
text-slate-500
">


<span>
Payment Progress
</span>


<span>
{progress}%
</span>


</div>



<div className="
h-3
overflow-hidden
rounded-full
bg-slate-200
">


<div

className="
h-full
rounded-full
bg-green-500
transition-all
"

style={{

width:`${progress}%`

}}

/>


</div>


</div>







<div className="pt-2">


{
outstanding <= 0 ? (

<span className="
rounded-full
bg-green-100
px-3
py-2
text-sm
font-semibold
text-green-700
">

✅ Fees Fully Paid

</span>


) : (


<span className="
rounded-full
bg-yellow-100
px-3
py-2
text-sm
font-semibold
text-yellow-700
">

⚠ ₹{outstanding.toLocaleString()} Pending

</span>


)

}


</div>





</div>


</div>

);

}