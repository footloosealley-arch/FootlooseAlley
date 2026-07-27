"use client";

import { useEffect, useState } from "react";

import {
  Users,
  IndianRupee,
  CalendarCheck,
  PhoneCall,
  Wallet,
  UserCheck,
  UserX,
  Trophy,
} from "lucide-react";

import { toast } from "sonner";

import PageHeader from "@/components/layout/PageHeader";

import RevenueChart from "@/components/reports/RevenueChart";

import { getReportStats } from "@/lib/reports";



type ReportStats = {

  totalStudents:number;

  activeStudents:number;

  monthlyRevenue:number;

  yearlyRevenue:number;

  attendanceToday:number;

  attendancePresentToday:number;

  attendanceAbsentToday:number;

  attendancePercentage:number;

  topAttendanceStudents:{
    name:string;
    present:number;
    total:number;
    percentage:number;
  }[];

  totalEnquiries:number;

  joinedStudents:number;

  conversionRate:number;

  pendingFeeAmount:number;


  revenueChart:{
    month:string;
    revenue:number;
  }[];

};









export default function ReportsPage(){



const [stats,setStats]=useState<ReportStats>({

totalStudents:0,

activeStudents:0,

monthlyRevenue:0,

yearlyRevenue:0,

attendanceToday:0,

attendancePresentToday:0,

attendanceAbsentToday:0,

attendancePercentage:0,

topAttendanceStudents:[],

totalEnquiries:0,

joinedStudents:0,

conversionRate:0,

pendingFeeAmount:0,

revenueChart:[]

});



const [loading,setLoading]=useState(true);









useEffect(()=>{

loadReports();

},[]);







async function loadReports(){


try{


const data = await getReportStats();


setStats(data);


}

catch(error){

console.error(error);

toast.error(
"Unable to load reports"
);


}

finally{

setLoading(false);

}


}









const currency=(amount:number)=>

new Intl.NumberFormat(
"en-IN",
{
style:"currency",
currency:"INR",
maximumFractionDigits:0
}
).format(amount);









return (

<main className="
space-y-8
">





<PageHeader

title="Reports & Analytics"

description="Monitor your studio performance."

/>









<div className="
grid
gap-6
sm:grid-cols-2
xl:grid-cols-4
">



<ReportCard

title="Total Students"

value={loading?"...":stats.totalStudents}

icon={<Users/>}

color="bg-purple-600"

/>





<ReportCard

title="Monthly Revenue"

value={loading?"...":currency(stats.monthlyRevenue)}

icon={<IndianRupee/>}

color="bg-green-600"

/>





<ReportCard

title="Today's Attendance"

value={loading?"...":stats.attendanceToday}

icon={<CalendarCheck/>}

color="bg-blue-600"

/>





<ReportCard

title="Total Enquiries"

value={loading?"...":stats.totalEnquiries}

icon={<PhoneCall/>}

color="bg-orange-500"

/>



</div>









<RevenueChart

data={stats.revenueChart}

/>









<div className="
grid
gap-6
lg:grid-cols-3
">



<InfoCard

title="Present Today"

value={stats.attendancePresentToday}

icon={<UserCheck/>}

/>



<InfoCard

title="Absent Today"

value={stats.attendanceAbsentToday}

icon={<UserX/>}

/>



<InfoCard

title="Attendance Rate"

value={`${stats.attendancePercentage}%`}

icon={<CalendarCheck/>}

/>



</div>









<div className="
rounded-2xl
bg-white
p-6
shadow
">


<div className="
mb-5
flex
items-center
gap-3
">


<Trophy/>


<h2 className="
text-xl
font-bold
">

Top Attendance Students

</h2>


</div>






<div className="
space-y-3
">


{

stats.topAttendanceStudents.length===0

?

<p className="
text-slate-500
">

No attendance data available.

</p>


:


stats.topAttendanceStudents.map((student,index)=>(


<div

key={student.name}

className="
flex
justify-between
rounded-xl
border
p-4
"

>


<div>

<p className="
font-bold
">

{index+1}. {student.name}

</p>


<p className="
text-sm
text-slate-500
">

{student.present} present days

</p>


</div>




<span className="
font-bold
text-green-600
">

{student.percentage}%

</span>


</div>


))


}



</div>


</div>









<div className="
grid
gap-6
lg:grid-cols-3
">



<InfoCard

title="Active Students"

value={stats.activeStudents}

icon={<UserCheck/>}

/>



<InfoCard

title="Pending Fees"

value={currency(stats.pendingFeeAmount)}

icon={<Wallet/>}

/>



<InfoCard

title="Conversion Rate"

value={`${stats.conversionRate}%`}

icon={<PhoneCall/>}

/>



</div>









<div className="
grid
gap-6
lg:grid-cols-2
">


<div className="
rounded-2xl
bg-white
p-6
shadow
">


<h2 className="
mb-4
text-xl
font-bold
">

Revenue Overview

</h2>


<Row

label="Monthly Revenue"

value={currency(stats.monthlyRevenue)}

/>


<Row

label="Yearly Revenue"

value={currency(stats.yearlyRevenue)}

/>


</div>






<div className="
rounded-2xl
bg-white
p-6
shadow
">


<h2 className="
mb-4
text-xl
font-bold
">

Enquiry Performance

</h2>



<Row

label="Total Enquiries"

value={stats.totalEnquiries}

/>



<Row

label="Joined Students"

value={stats.joinedStudents}

/>



<Row

label="Conversion"

value={`${stats.conversionRate}%`}

/>


</div>


</div>






</main>

);


}









function Row({

label,

value

}:{

label:string;

value:string|number;

}){


return (

<div className="
flex
justify-between
border-b
py-3
">


<span className="
text-slate-500
">

{label}

</span>


<span className="
font-bold
">

{value}

</span>


</div>

);


}









function ReportCard({

title,

value,

icon,

color

}:{

title:string;

value:string|number;

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
justify-between
">


<div>

<p className="
text-sm
text-slate-500
">

{title}

</p>


<h2 className="
mt-2
text-3xl
font-bold
">

{value}

</h2>


</div>



<div className={`

rounded-xl

p-4

text-white

${color}

`}>

{icon}

</div>


</div>


</div>

);


}









function InfoCard({

title,

value,

icon

}:{

title:string;

value:string|number;

icon:React.ReactNode;

}){


return (

<div className="
flex
items-center
gap-4
rounded-2xl
bg-white
p-5
shadow
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

);


}