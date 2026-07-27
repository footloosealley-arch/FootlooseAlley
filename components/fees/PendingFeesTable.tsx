"use client";

import Link from "next/link";

import {
  Eye,
  MessageCircle,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import type { Student } from "@/types/student";

import FeePaymentButton from "@/components/fees/FeePaymentButton";



type FeeStatus =
  | "Paid"
  | "Due Soon"
  | "Overdue";



type Props = {

  students:{
    student:Student;
    status:FeeStatus;
  }[];

  onRefresh:()=>void;

};






export default function PendingFeesTable({

students,

onRefresh,

}:Props){



return (

<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">





<h2 className="
mb-6
text-2xl
font-bold
text-slate-800
">

Student Fee Status

</h2>







<div className="
space-y-4
">






{

students.length===0

?

<p className="
text-slate-500
">

No students found.

</p>


:


students.map(({student,status})=>(



<div

key={student.id}

className="
rounded-2xl
border
p-5
transition
hover:shadow-md
"

>




<div className="
flex
flex-col
gap-4
md:flex-row
md:items-center
md:justify-between
">






<div>


<h3 className="
text-lg
font-bold
text-slate-800
">

{student.Name}

</h3>




<p className="
text-sm
text-slate-500
">

{student.membership_plan ?? "-"}

</p>





<p className="
mt-2
font-semibold
">

Balance:

₹{Number(student.Fees_due ?? 0).toLocaleString()}

</p>





<p className="
text-sm
text-slate-500
">

Next Due:

{

student.next_due_date

?

new Date(
student.next_due_date
)
.toLocaleDateString()

:

"-"

}

</p>






{

student.last_payment_date &&

<p className="
text-sm
text-slate-500
">

Last Payment:

{

new Date(
student.last_payment_date
)
.toLocaleDateString()

}

</p>

}





</div>










<div>


<span

className={`

flex

items-center

gap-2

rounded-full

px-4

py-2

text-sm

font-semibold

${

status==="Paid"

?

"bg-green-100 text-green-700"

:

status==="Due Soon"

?

"bg-yellow-100 text-yellow-700"

:

"bg-red-100 text-red-700"

}

`}

>


{

status==="Paid"

?

<CheckCircle2 size={16}/>

:

status==="Due Soon"

?

<Clock3 size={16}/>

:

<AlertTriangle size={16}/>

}


{status}


</span>


</div>








</div>








<div className="
mt-5
flex
flex-wrap
gap-3
">






<Link

href={`/students/${student.id}`}

className="
flex
items-center
gap-2
rounded-xl
bg-indigo-100
px-4
py-2
text-indigo-700
"

>

<Eye size={18}/>

View

</Link>








{

Number(student.Fees_due ?? 0)>0 &&

<FeePaymentButton

studentId={student.id}

onSuccess={onRefresh}

/>

}








{

Number(student.Fees_due ?? 0)>0 &&

<a

href={`https://wa.me/91${student.Phone}?text=Hi ${student.Name} 👋 Your pending fee amount is ₹${student.Fees_due}. Thank you from Footloose Alley Dance & Fitness.`}

target="_blank"

className="
flex
items-center
gap-2
rounded-xl
bg-green-600
px-4
py-2
text-white
"

>

<MessageCircle size={18}/>

WhatsApp

</a>


}








</div>








</div>


))


}





</div>






</div>

);


}