"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Search,
  Plus,
  MessageCircle,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";





type Student = {

id:number;

Name:string | null;

Phone:string | null;

Program:string | null;

Fees:number | null;

Fees_due:number | null;

Status:string | null;

membership_plan:string | null;

next_due_date:string | null;

fee_status:string | null;

};









export default function StudentsPage(){



const [students,setStudents] =

useState<Student[]>([]);



const [loading,setLoading] =

useState(true);



const [search,setSearch] =

useState("");



const [filter,setFilter] =

useState("All");









useEffect(()=>{

loadStudents();

},[]);









async function loadStudents(){


try{


const {

data,

error

}=await supabase

.from("Students")

.select(`

id,

Name,

Phone,

Program,

Fees,

Fees_due,

Status,

membership_plan,

next_due_date,

fee_status

`)

.order(

"id",

{

ascending:false

}

);





if(error)

throw error;



setStudents(

data ?? []

);



}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}


}









function getFeeStatus(student:Student){



const due =

Number(student.Fees_due ?? 0);





if(due===0){

return "Paid";

}







if(!student.next_due_date){

return "Overdue";

}





const today = new Date();



const dueDate =

new Date(

student.next_due_date

);





const difference =

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







if(difference < 0){

return "Overdue";

}





if(difference <= 7){

return "Due Soon";

}





return "Pending";


}









const filteredStudents =

students.filter(student=>{



const name =

(student.Name ?? "")

.toLowerCase();



const phone =

student.Phone ?? "";





const matchesSearch =

name.includes(

search.toLowerCase()

)

||

phone.includes(search);





const status =

getFeeStatus(student);





const matchesFilter =

filter==="All"

||

filter===status;





return (

matchesSearch

&&

matchesFilter

);


});









if(loading){

return (

<main className="p-8">

Loading students...

</main>

);

}

return (

<main className="space-y-8">



<PageHeader

title="Students"

description="Manage students, fees and membership details."

/>









<div className="
flex
flex-col
gap-4
md:flex-row
md:items-center
md:justify-between
">



<Link

href="/students/add"

className="
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-5
py-3
font-semibold
text-white
"

>

<Plus size={18}/>

Add Student

</Link>








<div className="
relative
">


<Search

size={18}

className="
absolute
left-3
top-3
text-slate-400
"

/>



<input

placeholder="Search student..."

value={search}

onChange={e=>

setSearch(e.target.value)

}

className="
rounded-xl
border
py-3
pl-10
pr-4
"

/>



</div>



</div>









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

]

.map(item=>(


<button

key={item}

onClick={()=>setFilter(item)}

className={`

rounded-xl

px-4

py-2

font-semibold

${

filter===item

?

"bg-purple-600 text-white"

:

"bg-white"

}

`}

>

{item}

</button>


))


}


</div>









<div className="
overflow-x-auto
rounded-2xl
bg-white
shadow
">


<table className="
min-w-full
">


<thead className="bg-slate-100">


<tr>


<th className="p-4 text-left">

Name

</th>


<th className="p-4 text-left">

Phone

</th>


<th className="p-4 text-left">

Program

</th>


<th className="p-4 text-left">

Fees Due

</th>


<th className="p-4 text-left">

Due Date

</th>


<th className="p-4 text-left">

Status

</th>


<th className="p-4 text-left">

Action

</th>


</tr>


</thead>








<tbody>


{

filteredStudents.map(student=>(


<tr

key={student.id}

className="border-b"

>


<td className="p-4">


<Link

href={`/students/${student.id}`}

className="
font-semibold
text-purple-600
"

>

{student.Name ?? "-"}

</Link>


</td>








<td className="p-4">

{student.Phone ?? "-"}

</td>








<td className="p-4">

{student.Program ?? "-"}

</td>








<td className="
p-4
font-semibold
">

₹{student.Fees_due ?? 0}

</td>








<td className="p-4">

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

</td>








<td className="p-4">


<StatusBadge

status={getFeeStatus(student)}

/>


</td>








<td className="p-4">


<div className="
flex
items-center
gap-2
">





<Link

href={`/students/${student.id}`}

className="
rounded-xl
bg-purple-100
px-3
py-2
font-semibold
text-purple-700
"

>

View

</Link>








<a

href={`https://wa.me/91${student.Phone ?? ""}`}

target="_blank"

className="
flex
items-center
gap-2
rounded-xl
bg-green-100
px-3
py-2
font-semibold
text-green-700
"

>

<MessageCircle size={16}/>

WhatsApp

</a>





</div>


</td>






</tr>


))


}








{

filteredStudents.length===0 &&


<tr>


<td

colSpan={7}

className="
p-8
text-center
text-slate-500
"

>

No students found.

</td>


</tr>


}



</tbody>


</table>


</div>


</main>

);


}









function StatusBadge({

status

}:{

status:string;

}){


let style = "";



if(status==="Paid"){

style="bg-green-100 text-green-700";

}

else if(status==="Due Soon"){

style="bg-yellow-100 text-yellow-700";

}

else if(status==="Overdue"){

style="bg-red-100 text-red-700";

}

else{

style="bg-slate-100 text-slate-700";

}




return (

<span

className={`

rounded-full

px-3

py-1

text-sm

font-semibold

${style}

`}

>

{status}

</span>

);


}