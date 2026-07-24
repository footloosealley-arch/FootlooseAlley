"use client";

import {
  Calendar,
  CreditCard,
  FileText,
  IndianRupee,
  User,
} from "lucide-react";

import type { Payment } from "@/types/payment";



type Props = {
  payments: Payment[];
};





export default function PaymentTable({
  payments,
}: Props) {



function methodStyle(method:string){


switch(method){


case "UPI":

return "bg-green-100 text-green-700";


case "Card":

return "bg-blue-100 text-blue-700";


case "Online":

return "bg-purple-100 text-purple-700";


default:

return "bg-orange-100 text-orange-700";


}


}






if(payments.length===0){


return (

<div className="
rounded-3xl
bg-white
p-8
shadow-lg
">


<h2 className="
text-2xl
font-bold
text-slate-800
">

💳 Payment History

</h2>


<div className="
mt-6
rounded-2xl
border
border-dashed
p-8
text-center
">


<p className="
font-semibold
text-slate-700
">

No payments recorded

</p>


<p className="
mt-2
text-sm
text-slate-500
">

Payment history will appear here

</p>


</div>


</div>

);


}









return (

<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">





<div className="
mb-6
flex
items-center
justify-between
">


<div>


<h2 className="
text-2xl
font-bold
text-slate-800
">

💳 Payment History

</h2>


<p className="
mt-1
text-sm
text-slate-500
">

{payments.length} payment{payments.length!==1?"s":""}

</p>


</div>


</div>








<div className="
space-y-4
">





{

payments.map(payment=>(


<div

key={payment.id}

className="
rounded-2xl
border
border-slate-100
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


<div className="
flex
items-center
gap-2
">


<IndianRupee

size={20}

className="text-green-600"

/>


<h3 className="
text-2xl
font-bold
text-green-600
">

₹{Number(payment.amount).toLocaleString()}

</h3>


</div>






<div className="
mt-3
flex
items-center
gap-2
text-sm
text-slate-500
">


<Calendar size={15}/>


{

new Date(
payment.payment_date
)
.toLocaleDateString()

}


</div>



</div>









<div>

<span

className={`
rounded-full
px-4
py-2
text-sm
font-semibold
${methodStyle(
payment.payment_method
)}
`}

>

<CreditCard

size={15}

className="inline mr-1"

/>


{payment.payment_method}

</span>


</div>





</div>










<div className="
mt-5
grid
gap-3
md:grid-cols-2
">





<div className="
flex
items-center
gap-2
text-sm
text-slate-600
">


<User size={16}/>


<span>

Received By:

<b>

{" "}

{payment.received_by ?? "-"}

</b>


</span>


</div>







<div className="
flex
items-center
gap-2
text-sm
text-slate-600
">


<FileText size={16}/>


<span>

Remarks:

<b>

{" "}

{payment.remarks ?? "-"}

</b>


</span>


</div>







</div>






</div>


))


}



</div>







</div>

);


}