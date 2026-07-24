"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  CalendarCheck,
  Search,
  Save,
  History,
} from "lucide-react";

import { toast } from "sonner";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";



type Student = {

id:number;

Name:string;

Program:string | null;

};



type AttendanceStatus = {

student_id:number;

status:string;

};







export default function AttendancePage(){


const [students,setStudents] =
useState<Student[]>([]);


const [attendance,setAttendance] =
useState<AttendanceStatus[]>([]);


const [search,setSearch] =
useState("");


const [loading,setLoading] =
useState(true);


const [saving,setSaving] =
useState(false);



const today =

new Date()
.toISOString()
.split("T")[0];






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

Program

`)

.eq(
"Status",
"Active"
)

.order(
"Name"
);





if(error)

throw error;





setStudents(
data ?? []
);






const {
data:existing
}=await supabase


.from("Attendance")

.select(`

student_id,

status

`)

.eq(
"date",
today
);






setAttendance(
existing ?? []
);



}

catch(error){

console.error(error);

toast.error(
"Unable to load attendance"
);

}

finally{

setLoading(false);

}


}









function setStatus(

studentId:number,

status:string

){



setAttendance(prev=>{


const exists =

prev.find(

item=>

item.student_id===studentId

);



if(exists){


return prev.map(item=>

item.student_id===studentId

?

{

...item,

status

}

:

item

);


}




return [

...prev,

{

student_id:studentId,

status

}

];


});


}









async function saveAttendance(){


try{


setSaving(true);



for(const item of attendance){



await supabase

.from("Attendance")

.upsert(

{

student_id:item.student_id,

date:today,

status:item.status,

},

{

onConflict:
"student_id,date"

}

);


}





toast.success(
"Attendance saved"
);


}

catch(error){

console.error(error);

toast.error(
"Attendance save failed"
);

}

finally{

setSaving(false);

}


}









const filteredStudents =

students.filter(student=>

student.Name

.toLowerCase()

.includes(
search.toLowerCase()
)

);








if(loading){

return (

<main className="p-8">

Loading attendance...

</main>

);

}








return (

<main className="
space-y-8
">





<PageHeader

title="Attendance"

description="Track daily student attendance."

/>







<div className="
rounded-2xl
bg-white
p-6
shadow
">


<div className="
flex
items-center
gap-3
">


<CalendarCheck/>


<div>

<p className="
text-sm
text-slate-500
">

Attendance Date

</p>


<h2 className="
font-bold
">

{new Date(today).toLocaleDateString()}

</h2>


</div>


</div>


</div>








<div className="
rounded-2xl
bg-white
p-6
shadow
">



<div className="
relative
mb-6
">


<Search

className="
absolute
left-3
top-3
text-slate-400
"

size={20}

/>


<input

placeholder="Search student..."

value={search}

onChange={e=>

setSearch(
e.target.value
)

}

className="
w-full
rounded-xl
border
p-3
pl-10
"

/>


</div>








<div className="
space-y-3
">


{

filteredStudents.map(student=>{


const current =

attendance.find(

item=>

item.student_id===student.id

);





return (

<div

key={student.id}

className="
flex
flex-col
gap-4
rounded-xl
border
p-4
md:flex-row
md:items-center
md:justify-between
"

>


<div>

<h3 className="
font-bold
">

{student.Name}

</h3>


<p className="
text-sm
text-slate-500
">

{student.Program}

</p>


</div>







<div className="
flex
flex-wrap
gap-2
">





<button

onClick={()=>setStatus(student.id,"Present")}

className={`

rounded-xl

px-4

py-2

font-semibold

${

current?.status==="Present"

?

"bg-green-600 text-white"

:

"bg-green-100 text-green-700"

}

`}

>

Present

</button>






<button

onClick={()=>setStatus(student.id,"Absent")}

className={`

rounded-xl

px-4

py-2

font-semibold

${

current?.status==="Absent"

?

"bg-red-600 text-white"

:

"bg-red-100 text-red-700"

}

`}

>

Absent

</button>







<Link

href={`/attendance/student/${student.id}`}

className="
flex
items-center
gap-2
rounded-xl
bg-indigo-100
px-4
py-2
font-semibold
text-indigo-700
"

>

<History size={18}/>

History

</Link>





</div>





</div>

);


})


}



</div>







<button

onClick={saveAttendance}

disabled={saving}

className="
mt-6
flex
items-center
gap-2
rounded-xl
bg-indigo-600
px-6
py-3
font-semibold
text-white
"

>


<Save size={18}/>


{

saving

?

"Saving..."

:

"Save Attendance"

}


</button>







</div>







</main>

);


}