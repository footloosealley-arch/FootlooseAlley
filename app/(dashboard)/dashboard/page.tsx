"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Users,
  IndianRupee,
  CalendarCheck,
  PhoneCall,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";


import PageHeader from "@/components/layout/PageHeader";

import {
  getReportStats,
  ReportStats,
} from "@/lib/reports";

import { supabase } from "@/lib/supabase";






type RecentPayment = {

id:number;

amount:number;

payment_date:string;

payment_method:string;

student_id:number;

};







export default function DashboardPage(){



const [stats,setStats] =

useState<ReportStats | null>(null);



const [payments,setPayments] =

useState<RecentPayment[]>([]);



const [loading,setLoading] =

useState(true);






const [feeStats,setFeeStats] =

useState({

paid:0,

dueSoon:0,

overdue:0,

pendingAmount:0,

});









useEffect(()=>{

loadDashboard();

},[]);









async function loadDashboard(){



try{



const report =

await getReportStats();



setStats(report);






const {

data:paymentData

}=await supabase

.from("Payments")

.select(`

id,

amount,

payment_date,

payment_method,

student_id

`)

.order(

"id",

{

ascending:false

}

)

.limit(5);





setPayments(

paymentData ?? []

);






const {

data:students

}=await supabase

.from("Students")

.select(`

Fees_due,

next_due_date

`);







let paid = 0;

let dueSoon = 0;

let overdue = 0;

let pendingAmount = 0;






students?.forEach(student=>{



const due =

Number(student.Fees_due ?? 0);




pendingAmount += due;



if(due===0){

paid++;

return;

}





if(!student.next_due_date){

overdue++;

return;

}





const today =

new Date();



const dueDate =

new Date(

student.next_due_date

);



const days =

Math.ceil(

(

dueDate.getTime()

-

today.getTime()

)

/

(

1000 *

60 *

60 *

24

)

);





if(days < 0){

overdue++;

}

else if(days <= 7){

dueSoon++;

}



});







setFeeStats({

paid,

dueSoon,

overdue,

pendingAmount,

});




}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}


}








if(loading){

return (

<main className="p-8">

Loading dashboard...

</main>

);

}
return (

<main className="space-y-8">



<PageHeader

title="Dashboard"

description="Footloose Alley studio overview."

/>








<div className="
grid
gap-6
md:grid-cols-4
">





<DashboardCard

title="Total Students"

value={

stats?.totalStudents ?? 0

}

icon={<Users/>}

/>







<DashboardCard

title="Monthly Revenue"

value={

`₹${stats?.monthlyRevenue ?? 0}`

}

icon={<IndianRupee/>}

/>







<DashboardCard

title="Today's Attendance"

value={

stats?.attendanceToday ?? 0

}

icon={<CalendarCheck/>}

/>







<DashboardCard

title="Total Enquiries"

value={

stats?.totalEnquiries ?? 0

}

icon={<PhoneCall/>}

/>



</div>









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

Fee Overview

</h2>






<div className="
grid
gap-5
md:grid-cols-4
">





<FeeCard

title="Paid Students"

value={feeStats.paid}

type="paid"

icon={<CheckCircle/>}

/>







<FeeCard

title="Due This Week"

value={feeStats.dueSoon}

type="due"

icon={<Clock/>}

/>







<FeeCard

title="Overdue"

value={feeStats.overdue}

type="overdue"

icon={<AlertTriangle/>}

/>







<FeeCard

title="Pending Amount"

value={`₹${feeStats.pendingAmount}`}

type="overdue"

icon={<IndianRupee/>}

/>






</div>


</div>









<div className="
flex
flex-wrap
gap-4
">



<Link

href="/students"

className="
rounded-xl
bg-purple-600
px-5
py-3
font-semibold
text-white
"

>

View Students

</Link>






<Link

href="/students"

className="
rounded-xl
bg-green-600
px-5
py-3
font-semibold
text-white
"

>

Send Fee Reminders

</Link>




</div>
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





<div className="
overflow-x-auto
">


<table className="
min-w-full
">


<thead className="bg-slate-100">


<tr>


<th className="p-4 text-left">

Date

</th>


<th className="p-4 text-left">

Amount

</th>


<th className="p-4 text-left">

Method

</th>


</tr>


</thead>





<tbody>


{

payments.map(payment=>(


<tr

key={payment.id}

className="border-b"

>


<td className="p-4">

{

new Date(

payment.payment_date

)

.toLocaleDateString()

}

</td>



<td className="
p-4
font-bold
text-green-600
">

₹{payment.amount}

</td>




<td className="p-4">

{payment.payment_method}

</td>



</tr>


))


}



{

payments.length===0 &&

<tr>

<td

colSpan={3}

className="
p-8
text-center
text-slate-500
"

>

No recent payments.

</td>

</tr>

}



</tbody>


</table>


</div>


</div>







</main>

);


}









function DashboardCard({

title,

value,

icon

}:{

title:string;

value:string | number;

icon:React.ReactNode;

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
gap-4
">


<div className="
rounded-xl
bg-slate-100
p-3
">

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









function FeeCard({

title,

value,

type,

icon

}:{

title:string;

value:string | number;

type:string;

icon:React.ReactNode;

}){


let style="";



if(type==="paid"){

style="bg-green-100 text-green-700";

}

else if(type==="due"){

style="bg-yellow-100 text-yellow-700";

}

else{

style="bg-red-100 text-red-700";

}





return (

<div className="
rounded-xl
bg-slate-50
p-4
">


<div className="
flex
items-center
gap-3
">


<div className={`
rounded-xl
p-3
${style}
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



<h3 className="
text-xl
font-bold
">

{value}

</h3>


</div>


</div>


</div>

);


}