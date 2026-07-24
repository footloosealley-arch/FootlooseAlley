"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";

import {
  IndianRupee,
  Users,
  Wallet,
  ReceiptText,
} from "lucide-react";



type PaymentRecord = {

  id:number;

  amount:number;

  payment_date:string;

  payment_method:string;

  remarks:string | null;

  received_by:string | null;

  student:{
    Name:string;
    membership_plan:string | null;
  } | null;

};







export default function PaymentsPage(){


const [payments,setPayments] =
useState<PaymentRecord[]>([]);


const [loading,setLoading] =
useState(true);


const [search,setSearch] =
useState("");


const [methodFilter,setMethodFilter] =
useState("All");


const [dateFilter,setDateFilter] =
useState("All");









useEffect(()=>{

loadPayments();

},[]);









async function loadPayments(){


try{


const {
data,
error
}=await supabase


.from("Payments")


.select(`

id,

amount,

payment_date,

payment_method,

remarks,

received_by,

Students!Payments_student_id_fkey(

Name,

membership_plan

)

`)


.order(
"id",
{
ascending:false
}
);





if(error){

throw error;

}





const formatted =

(data ?? []).map((item:any)=>(

{

...item,

student:item.Students ?? null

}

));




setPayments(formatted);



}

catch(error){

console.error(
error
);

}


finally{

setLoading(false);

}


}









const filteredPayments =

payments.filter(payment=>{


const nameMatch =

payment.student?.Name

?.toLowerCase()

.includes(
search.toLowerCase()
);



const methodMatch =

methodFilter==="All"

?

true

:

payment.payment_method===methodFilter;




let dateMatch=true;



const today=new Date();

const paymentDate =
new Date(
payment.payment_date
);



if(dateFilter==="This Month"){


dateMatch =

paymentDate.getMonth()

===

today.getMonth()

&&

paymentDate.getFullYear()

===

today.getFullYear();


}




if(dateFilter==="Last Month"){


const lastMonth =

new Date(
today.getFullYear(),
today.getMonth()-1,
1
);



dateMatch =

paymentDate.getMonth()

===

lastMonth.getMonth()

&&

paymentDate.getFullYear()

===

lastMonth.getFullYear();


}



return (

nameMatch

&&

methodMatch

&&

dateMatch

);


});









const totalCollection =

filteredPayments.reduce(

(sum,p)=>

sum +

Number(p.amount),

0

);







if(loading){

return (

<main className="p-8">

Loading payments...

</main>

);

}









return (

<main className="space-y-8">



<PageHeader

title="Payments"

description="Track payment transactions and revenue."

/>









<div className="
grid
gap-4
md:grid-cols-3
">


<StatCard

title="Collection"

value={`₹${totalCollection.toLocaleString()}`}

icon={<IndianRupee/>}

color="text-green-600"

/>



<StatCard

title="Transactions"

value={filteredPayments.length.toString()}

icon={<Users/>}

color="text-purple-600"

/>



<StatCard

title="Pending"

value="View in Fees"

icon={<Wallet/>}

color="text-red-600"

/>



</div>









<div className="
rounded-2xl
bg-white
p-6
shadow
">


<div className="
grid
gap-5
md:grid-cols-3
">



<input

placeholder="Search student..."

value={search}

onChange={e=>setSearch(e.target.value)}

className="
rounded-xl
border
p-3
"

/>





<select

value={methodFilter}

onChange={e=>setMethodFilter(e.target.value)}

className="
rounded-xl
border
p-3
"

>

<option value="All">
All Methods
</option>

<option>
Cash
</option>

<option>
UPI
</option>

<option>
Card
</option>

<option>
Online
</option>

</select>






<select

value={dateFilter}

onChange={e=>setDateFilter(e.target.value)}

className="
rounded-xl
border
p-3
"

>

<option value="All">
All Time
</option>

<option>
This Month
</option>

<option>
Last Month
</option>

</select>



</div>


</div>









<div className="
overflow-hidden
rounded-2xl
bg-white
shadow
">


<div className="
border-b
p-5
">


<h2 className="
text-xl
font-bold
">

Payment Records

</h2>


</div>







<div className="
overflow-x-auto
">


<table className="min-w-full">


<thead className="bg-slate-100">


<tr>


<th className="p-4 text-left">
Date
</th>


<th className="p-4 text-left">
Student
</th>


<th className="p-4 text-left">
Plan
</th>


<th className="p-4 text-left">
Amount
</th>


<th className="p-4 text-left">
Method
</th>


<th className="p-4 text-left">
Received By
</th>


<th className="p-4 text-left">
Remarks
</th>


<th className="p-4 text-left">
Actions
</th>


</tr>


</thead>







<tbody>


{

filteredPayments.map(payment=>(


<tr

key={payment.id}

className="
border-b
hover:bg-slate-50
"

>


<td className="p-4">

{
new Date(
payment.payment_date
)
.toLocaleDateString()
}

</td>





<td className="p-4 font-semibold">

{
payment.student?.Name ?? "-"
}

</td>





<td className="p-4">

{
payment.student?.membership_plan ?? "-"
}

</td>





<td className="
p-4
font-bold
text-green-600
">

₹{Number(payment.amount).toLocaleString()}

</td>





<td className="p-4">

<span className="
rounded-full
bg-indigo-100
px-3
py-1
text-indigo-700
">

{payment.payment_method}

</span>

</td>





<td className="p-4">

{
payment.received_by ?? "-"
}

</td>





<td className="p-4 text-slate-500">

{
payment.remarks ?? "-"
}

</td>





<td className="p-4">


<Link

href={`/payments/receipt/${payment.id}`}

className="
flex
items-center
gap-2
rounded-xl
bg-purple-100
px-4
py-2
font-semibold
text-purple-700
"

>

<ReceiptText size={18}/>

Receipt

</Link>


</td>





</tr>


))


}



</tbody>


</table>


</div>


</div>







</main>

);


}









function StatCard({

title,

value,

icon,

color,

}:{

title:string;

value:string;

icon:React.ReactNode;

color:string;

}){


return (

<div className="
rounded-2xl
bg-white
p-5
shadow
">


<div className="
flex
items-center
gap-3
">


<div className={`
rounded-xl
bg-slate-100
p-3
${color}
`}>

{icon}

</div>


<div>

<p className="
text-sm
text-slate-500
">

{title}

</p>


<h2 className="
text-2xl
font-bold
">

{value}

</h2>


</div>


</div>


</div>

);


}