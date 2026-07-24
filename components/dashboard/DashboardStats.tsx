"use client";

import {
  Users,
  UserCheck,
  IndianRupee,
  Wallet,
  CalendarCheck,
  PhoneCall,
  Cake,
  AlertCircle,
} from "lucide-react";


type Props = {
  stats: any;
};



const cards = [

  {
    title:"Total Students",
    key:"totalStudents",
    icon:Users,
    color:"bg-blue-100 text-blue-600",
  },


  {
    title:"Active Members",
    key:"activeStudents",
    icon:UserCheck,
    color:"bg-green-100 text-green-600",
  },


  {
    title:"Today's Collection",
    key:"todayCollection",
    icon:IndianRupee,
    color:"bg-purple-100 text-purple-600",
    money:true,
  },


  {
    title:"Monthly Revenue",
    key:"monthlyRevenue",
    icon:Wallet,
    color:"bg-indigo-100 text-indigo-600",
    money:true,
  },


  {
    title:"Pending Fees",
    key:"pendingFees",
    icon:AlertCircle,
    color:"bg-red-100 text-red-600",
    money:true,
  },


  {
    title:"Today's Attendance",
    key:"todayAttendance",
    icon:CalendarCheck,
    color:"bg-orange-100 text-orange-600",
  },


  {
    title:"Pending Enquiries",
    key:"pendingEnquiries",
    icon:PhoneCall,
    color:"bg-pink-100 text-pink-600",
  },


  {
    title:"Upcoming Birthdays",
    key:"upcomingBirthdays",
    icon:Cake,
    color:"bg-yellow-100 text-yellow-600",
    array:true,
  },


];








export default function DashboardStats({
  stats,
}:Props){





return (


<div className="
grid
gap-6
sm:grid-cols-2
xl:grid-cols-4
">





{
cards.map((card)=>{


const Icon =
card.icon;



let value =
stats?.[card.key];




if(card.array){

value =
value?.length ?? 0;

}






return (


<div

key={card.key}

className="
group
rounded-3xl
bg-white
p-6
shadow-sm
transition
hover:-translate-y-1
hover:shadow-xl
border
border-slate-100
"


>





<div className="
flex
items-center
justify-between
">


<div

className={`
flex
h-14
w-14
items-center
justify-center
rounded-2xl
${card.color}
`}

>


<Icon size={26}/>


</div>





</div>








<p className="
mt-6
text-sm
font-medium
text-slate-500
">

{card.title}

</p>






<h2 className="
mt-2
text-3xl
font-bold
text-slate-800
">

{

card.money

?

`₹${Number(value ?? 0).toLocaleString()}`

:

value

}



</h2>







</div>


);


})

}




</div>


);


}