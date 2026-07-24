"use client";

import Link from "next/link";

import {
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import type { Student } from "@/types/student";



type Props = {

  students: Student[];

  onEdit: (student: Student) => void;

  onDelete: (id:number)=>void;

};







export default function StudentTable({

students,

onEdit,

onDelete,

}:Props){






function getFeeStatus(student:Student){


const due =
Number(
student.Fees_due ?? 0
);




if(due <= 0){

return (

<span className="
rounded-full
bg-green-100
px-3
py-1
text-xs
font-semibold
text-green-700
">

Paid

</span>

);


}



return (

<span className="
rounded-full
bg-yellow-100
px-3
py-1
text-xs
font-semibold
text-yellow-700
">

Pending

</span>

);


}







return (

<div className="
overflow-hidden
rounded-3xl
border
border-slate-100
bg-white
shadow-lg
">





<div className="
border-b
px-6
py-6
">


<h2 className="
text-2xl
font-bold
text-slate-800
">

Student Directory

</h2>


<p className="
mt-1
text-sm
text-slate-500
">

{students.length} member{students.length !== 1 ? "s":""}

</p>



</div>







<div className="
overflow-x-auto
">


<table className="
min-w-full
">


<thead className="
bg-slate-50
">


<tr className="
text-left
text-sm
font-semibold
text-slate-600
">


<th className="px-6 py-4">
Student
</th>


<th className="px-6 py-4">
Program
</th>


<th className="px-6 py-4">
Contact
</th>


<th className="px-6 py-4">
Fees
</th>


<th className="px-6 py-4">
Status
</th>


<th className="
px-6
py-4
text-center
">

Actions

</th>


</tr>


</thead>








<tbody>


{
students.length===0

?


<tr>

<td

colSpan={6}

className="
py-12
text-center
text-slate-500
"

>

No students found

</td>

</tr>


:


students.map((student)=>(



<tr

key={student.id}

className="
border-t
transition
hover:bg-indigo-50/40
"

>








<td className="
px-6
py-5
">


<div className="
flex
items-center
gap-4
">



{
student.photo_url

?


<img

src={student.photo_url}

alt={student.Name}

className="
h-14
w-14
rounded-full
border-2
border-indigo-100
object-cover
"

/>


:


<div className="
flex
h-14
w-14
items-center
justify-center
rounded-full
bg-gradient-to-br
from-indigo-600
to-purple-600
text-lg
font-bold
text-white
">

{
student.Name
?.charAt(0)
.toUpperCase()
}

</div>


}





<div>


<Link

href={`/students/${student.id}`}

className="
font-semibold
text-slate-800
hover:text-indigo-600
"

>

{student.Name}

</Link>




<div className="
mt-1
flex
items-center
gap-1
text-sm
text-slate-500
">

<MapPin size={14}/>

{student.Address ?? "-"}

</div>


</div>



</div>



</td>









<td className="
px-6
py-5
">


<span className="
rounded-full
bg-indigo-100
px-3
py-1
text-sm
font-medium
text-indigo-700
">

{student.Program ?? "-"}

</span>


</td>









<td className="
px-6
py-5
">


<div className="
space-y-2
text-sm
">


<div className="
flex
items-center
gap-2
">

<Phone size={14}/>

{student.Phone}


</div>




<div className="
flex
items-center
gap-2
text-slate-500
">

<Mail size={14}/>

{student.Email ?? "-"}


</div>



</div>


</td>









<td className="
px-6
py-5
">


<p className="
font-bold
text-slate-800
">

₹{Number(student.Fees ?? 0).toLocaleString()}

</p>


<p className="
text-sm
text-red-500
">

Due ₹{Number(student.Fees_due ?? 0).toLocaleString()}

</p>


</td>









<td className="
px-6
py-5
">


<div className="
space-y-2
">


{getFeeStatus(student)}



<span

className={`
block
w-fit
rounded-full
px-3
py-1
text-xs
font-semibold
${
student.Status==="Active"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}
`}

>

{student.Status ?? "Inactive"}

</span>


</div>


</td>









<td className="
px-6
py-5
">


<div className="
flex
justify-center
gap-2
">



<Link

href={`/students/${student.id}`}

className="
rounded-xl
bg-indigo-100
p-2
text-indigo-700
transition
hover:bg-indigo-200
"

title="View"

>

<Eye size={18}/>

</Link>





<button

onClick={()=>onEdit(student)}

className="
rounded-xl
bg-blue-100
p-2
text-blue-700
transition
hover:bg-blue-200
"

title="Edit"

>

<Pencil size={18}/>

</button>





<button

onClick={()=>onDelete(student.id)}

className="
rounded-xl
bg-red-100
p-2
text-red-700
transition
hover:bg-red-200
"

title="Delete"

>

<Trash2 size={18}/>

</button>





</div>


</td>









</tr>



))

}



</tbody>


</table>


</div>






</div>


);


}