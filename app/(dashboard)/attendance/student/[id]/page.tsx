"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarCheck,
  User,
  UserX,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";



type Student = {

  id:number;

  Name:string;

  Program:string | null;

};



type AttendanceRecord = {

  id:number;

  date:string;

  status:string;

};









export default function StudentAttendancePage(){



const params = useParams();

const router = useRouter();



const studentId = Number(params.id);






const [student,setStudent] =

useState<Student | null>(null);



const [records,setRecords] =

useState<AttendanceRecord[]>([]);



const [loading,setLoading] =

useState(true);







useEffect(()=>{

loadHistory();

},[]);








async function loadHistory(){



try{


const {

data:studentData,

error:studentError

}=await supabase


.from("Students")

.select(`

id,

Name,

Program

`)

.eq(
"id",
studentId
)

.single();







if(studentError)

throw studentError;








const {

data:attendanceData,

error:attendanceError

}=await supabase


.from("Attendance")

.select(`

id,

date,

status

`)

.eq(
"student_id",
studentId
)

.order(
"date",
{
ascending:false
}
);






if(attendanceError)

throw attendanceError;






setStudent(studentData);


setRecords(
attendanceData ?? []
);



}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}


}








const presentDays =

records.filter(

item=>

item.status==="Present"

).length;







const absentDays =

records.filter(

item=>

item.status==="Absent"

).length;







const percentage =

records.length

?

Math.round(

(presentDays / records.length)

*

100

)

:

0;








if(loading){

return (

<main className="p-8">

Loading attendance history...

</main>

);

}









return (

<main className="space-y-8">





<PageHeader

title="Student Attendance History"

description="Track attendance performance."

/>








<button

onClick={()=>router.back()}

className="
flex
items-center
gap-2
rounded-xl
bg-white
px-4
py-3
shadow
"

>

<ArrowLeft size={18}/>

Back

</button>









<div className="
rounded-2xl
bg-white
p-6
shadow
">


<div className="
flex
items-center
gap-4
">


<div className="
rounded-xl
bg-purple-100
p-4
text-purple-600
">

<User/>

</div>




<div>

<h2 className="
text-2xl
font-bold
">

{student?.Name}

</h2>


<p className="
text-slate-500
">

{student?.Program ?? "-"}

</p>


</div>


</div>


</div>









<div className="
grid
gap-6
md:grid-cols-3
">



<SummaryCard

title="Present Days"

value={presentDays}

icon={<CalendarCheck/>}

/>





<SummaryCard

title="Absent Days"

value={absentDays}

icon={<UserX/>}

/>





<SummaryCard

title="Attendance"

value={`${percentage}%`}

icon={<CalendarCheck/>}

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

Attendance Records

</h2>






<div className="
space-y-3
">


{

records.length===0

?

<p className="
text-slate-500
">

No attendance records found.

</p>


:


records.map(record=>(


<div

key={record.id}

className="
flex
items-center
justify-between
rounded-xl
border
p-4
"

>


<div>

<p className="
font-semibold
">

{

new Date(record.date)

.toLocaleDateString()

}

</p>


</div>





<span

className={`

rounded-full

px-4

py-2

font-semibold

${

record.status==="Present"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}

`}

>

{record.status}

</span>



</div>


))


}



</div>


</div>









</main>

);


}









function SummaryCard({

title,

value,

icon,

}:{

title:string;

value:number|string;

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
gap-3
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