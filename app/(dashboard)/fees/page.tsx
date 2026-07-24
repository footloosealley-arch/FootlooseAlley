"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import type { Student } from "@/types/student";

import FeeSummaryCards from "@/components/fees/FeeSummaryCards";

import PendingFeesTable from "@/components/fees/PendingFeesTable";





type FeeStatus =
  | "Paid"
  | "Due Soon"
  | "Overdue";






export default function FeesPage(){



const [students,setStudents] =
useState<Student[]>([]);



const [loading,setLoading] =
useState(true);



const [filter,setFilter] =
useState<
"All"|FeeStatus
>("All");









async function loadFees(){


setLoading(true);



const {

data,

error

}=await supabase

.from("Students")

.select("*")

.order(
"Name"
);





if(error){

console.error(
error
);

setLoading(false);

return;

}





setStudents(
data ?? []
);



setLoading(false);


}







useEffect(()=>{


loadFees();


},[]);









function getFeeStatus(

student:Student

):FeeStatus{



const due =

Number(
student.Fees_due ?? 0
);





if(due <= 0){

return "Paid";

}





if(student.next_due_date){


const today =
new Date();


const dueDate =
new Date(
student.next_due_date
);





if(
dueDate < today
){

return "Overdue";

}





const days =

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
);





if(days <= 7){

return "Due Soon";

}



}





return "Due Soon";


}









const feeStudents = useMemo(()=>{


return students.map(student=>(


{

student,

status:
getFeeStatus(student)

}



));


},[students]);









const filteredStudents =

filter==="All"

?

feeStudents

:

feeStudents.filter(

item=>

item.status===filter

);











const totalPending =

students.reduce(

(sum,student)=>

sum +

Number(
student.Fees_due ?? 0
),

0

);









const totalCollected =

students.reduce(

(sum,student)=>

sum +

(

Number(student.Fees ?? 0)

-

Number(student.Fees_due ?? 0)

),

0

);








const dueSoonCount =

feeStudents.filter(

item=>

item.status==="Due Soon"

).length;







const overdueCount =

feeStudents.filter(

item=>

item.status==="Overdue"

).length;








if(loading){


return (

<main className="p-8">


<div className="
rounded-3xl
bg-white
p-10
text-center
shadow
">

Loading fees...

</div>


</main>

);


}










return (

<main className="
min-h-screen
space-y-8
bg-slate-50
p-8
">








<div className="
rounded-3xl
bg-gradient-to-r
from-indigo-700
via-purple-700
to-pink-600
p-8
text-white
shadow-xl
">


<h1 className="
text-4xl
font-bold
">

💰 Fee Management

</h1>


<p className="
mt-2
text-white/80
">

Track collections, pending fees and membership status

</p>


</div>









<FeeSummaryCards


totalCollected={
totalCollected
}


totalPending={
totalPending
}


dueSoonCount={
dueSoonCount
}


overdueCount={
overdueCount
}


/>









<div className="
flex
flex-wrap
gap-3
">


{

[
"All",
"Paid",
"Due Soon",
"Overdue"

].map(item=>(


<button

key={item}

onClick={()=>setFilter(
item as any
)}

className={`
rounded-xl
px-5
py-2
font-semibold
transition
${
filter===item
?
"bg-indigo-600 text-white"
:
"bg-white text-slate-700"
}
`}

>

{item}

</button>


))


}


</div>









<PendingFeesTable


students={
filteredStudents
}


onRefresh={
loadFees
}


/>







</main>

);


}