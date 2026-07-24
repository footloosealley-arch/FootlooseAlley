import { supabase } from "@/lib/supabase";



export type RevenueChartItem = {

  month:string;

  revenue:number;

};




export type ProgramStat = {

  program:string;

  count:number;

};



export type MembershipStat = {

  plan:string;

  count:number;

};



export type PaymentMethodStat = {

  method:string;

  amount:number;

};




export type TopAttendanceStudent = {

  name:string;

  present:number;

  total:number;

  percentage:number;

};







export type ReportStats = {


  totalStudents:number;

  activeStudents:number;

  inactiveStudents:number;



  monthlyRevenue:number;

  yearlyRevenue:number;



  attendanceToday:number;

  attendancePresentToday:number;

  attendanceAbsentToday:number;

  attendancePercentage:number;



  topAttendanceStudents:TopAttendanceStudent[];



  totalEnquiries:number;

  joinedStudents:number;

  conversionRate:number;



  pendingFeeAmount:number;



  revenueChart:RevenueChartItem[];



  programStats:ProgramStat[];



  membershipStats:MembershipStat[];



  paymentMethodStats:PaymentMethodStat[];



};









export async function getReportStats():Promise<ReportStats>{



const today = new Date();


const todayString =

today.toISOString().split("T")[0];



const currentMonth =

today.getMonth();



const currentYear =

today.getFullYear();








const [

students,

payments,

attendanceTodayData,

allAttendance,

enquiries,

feeDueStudents

] = await Promise.all([





supabase

.from("Students")

.select(`

id,

Name,

Status,

Program,

membership_plan,

Fees_due

`),







supabase

.from("Payments")

.select(`

amount,

payment_date,

payment_method

`),







supabase

.from("Attendance")

.select(`

student_id,

status

`)

.eq(

"date",

todayString

),







supabase

.from("Attendance")

.select(`

student_id,

status

`),







supabase

.from("Enquiries")

.select("*"),







supabase

.from("Students")

.select("Fees_due")

.gt(

"Fees_due",

0

),



]);






const studentData =

students.data ?? [];



const paymentData =

payments.data ?? [];



const todayAttendance =

attendanceTodayData.data ?? [];



const attendanceData =

allAttendance.data ?? [];



const enquiryData =

enquiries.data ?? [];







let monthlyRevenue = 0;


let yearlyRevenue = 0;







const revenueChart:RevenueChartItem[] =

Array.from(

{length:12},

(_,index)=>(

{

month:new Date(

0,

index

)

.toLocaleString(

"default",

{

month:"short"

}

),

revenue:0

}

)

);







const paymentMethodMap:Record<string,number>={};



paymentData.forEach(payment=>{


const amount =

Number(payment.amount ?? 0);



const paymentDate =

new Date(
payment.payment_date
);



if(

paymentDate.getFullYear()

!==

currentYear

)

return;





yearlyRevenue += amount;



revenueChart[

paymentDate.getMonth()

].revenue += amount;






if(

paymentDate.getMonth()

===

currentMonth

){

monthlyRevenue += amount;

}





const method =

payment.payment_method ?? "Other";



paymentMethodMap[method] =

(

paymentMethodMap[method] ?? 0

)

+

amount;



});




const programMap:Record<string,number>={};



studentData.forEach(student=>{


const program =

student.Program ?? "Other";



programMap[program] =

(

programMap[program] ?? 0

)

+

1;



});








const membershipMap:Record<string,number>={};



studentData.forEach(student=>{


const plan =

student.membership_plan ?? "Other";



membershipMap[plan] =

(

membershipMap[plan] ?? 0

)

+

1;



});









const paymentMethodStats =

Object.entries(paymentMethodMap)

.map(([method,amount])=>(

{

method,

amount

}

));









const pendingFeeAmount =

feeDueStudents.data?.reduce(

(sum,student)=>

sum +

Number(student.Fees_due ?? 0),

0

)

??

0;









const attendancePresentToday =

todayAttendance.filter(

item=>

item.status==="Present"

).length;







const attendanceAbsentToday =

todayAttendance.filter(

item=>

item.status==="Absent"

).length;







const attendanceToday =

todayAttendance.length;







const attendancePercentage =

attendanceToday > 0

?

Math.round(

attendancePresentToday /

attendanceToday *

100

)

:

0;













const attendanceMap:

Record<

number,

{

present:number;

total:number;

}

> = {};





attendanceData.forEach(record=>{


if(!attendanceMap[record.student_id]){


attendanceMap[record.student_id]={

present:0,

total:0,

};

}



attendanceMap[record.student_id].total++;



if(record.status==="Present"){


attendanceMap[record.student_id].present++;


}



});









const topAttendanceStudents =

Object.entries(attendanceMap)

.map(([studentId,data])=>{


const student =

studentData.find(

item=>

item.id===Number(studentId)

);




const percentage =

data.total > 0

?

Math.round(

data.present /

data.total *

100

)

:

0;



return {


name:

student?.Name ?? "Unknown",


present:

data.present,


total:

data.total,


percentage,


};



})

.sort(

(a,b)=>

b.percentage-a.percentage

)

.slice(0,5);









const joinedStudents =

enquiryData.filter(

item=>

item.Status==="Joined"

).length;









const conversionRate =

enquiryData.length > 0

?

Math.round(

joinedStudents /

enquiryData.length *

100

)

:

0;









return {



totalStudents:

studentData.length,





activeStudents:

studentData.filter(

student=>

student.Status==="Active"

).length,





inactiveStudents:

studentData.filter(

student=>

student.Status!=="Active"

).length,







monthlyRevenue,





yearlyRevenue,







attendanceToday,



attendancePresentToday,



attendanceAbsentToday,



attendancePercentage,







topAttendanceStudents,









totalEnquiries:

enquiryData.length,





joinedStudents,





conversionRate,







pendingFeeAmount,









revenueChart,









programStats:

Object.entries(programMap)

.map(([program,count])=>(

{

program,

count

}

)),









membershipStats:

Object.entries(membershipMap)

.map(([plan,count])=>(

{

plan,

count

}

)),









paymentMethodStats,



};



}